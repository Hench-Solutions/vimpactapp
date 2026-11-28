// Reads the BUSY "List of Sales Vouchers" export used for box labels, entirely
// in the browser. The header row (found below BUSY's title rows) must match
// EXPECTED_COLUMNS exactly, ignoring letter case, or the file is rejected.
//
// Layout: the first item row of an invoice carries Date / PO / Docket /
// Transporter / Vch/Bill No / Particulars; the invoice's next items have those
// cells blank and inherit them. Reading stops at the "Total" row, whose
// CASE / BOX and Qty are used to check nothing was missed.
import * as XLSX from "xlsx";

// The exact header row of the BUSY export, in order. Uploads must match it
// (letter case and extra spaces ignored); anything else is rejected.
const EXPECTED_COLUMNS = [
  { name: "Date", key: "date" },
  { name: "PO NUMBER", key: "po" },
  { name: "Docket No / Gr No", key: "docket" },
  { name: "TRANSPORTER", key: "transporter" },
  { name: "Vch/Bill No", key: "bill" },
  { name: "Particulars", key: "party" },
  { name: "Sku Code", key: "fsn" },
  { name: "Item Details", key: "item" },
  { name: "CASE / BOX", key: "boxes" },
  { name: "Qty.", key: "qty" },
  { name: "Unit", key: "unit" },
  { name: "Price", key: "price" },
  { name: "Amount", key: "amount" },
  { name: "AMT WITH GST", key: "amountGst" },
];

export const LABEL_HEADERS = EXPECTED_COLUMNS.map((c) => c.name);

const clean = (s) =>
  String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

/** Error for a file that isn't the expected BUSY export; details lists what differs. */
export class LabelFileError extends Error {
  constructor(message, details = []) {
    super(message);
    this.details = details;
  }
}

function columnLetter(index) {
  let s = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26))
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

function toNumber(v) {
  const n = parseFloat(
    String(v ?? "")
      .replace(/,/g, "")
      .trim(),
  );
  return Number.isFinite(n) ? n : NaN;
}

/** Finds the header row (the one containing "Vch/Bill No") and checks it column by column. */
function validateHeader(grid) {
  const r = grid
    .slice(0, 30)
    .findIndex((line) => line.some((c) => clean(c) === "vch/bill no"));
  if (r === -1) {
    throw new LabelFileError(
      'This is not the BUSY "List of Sales Vouchers" file: no header row with "Vch/Bill No" was found.',
      [`Expected header: ${LABEL_HEADERS.join(" | ")}`],
    );
  }

  const cells = grid[r].map(clean);
  const first = cells.findIndex((c) => c !== "");
  let last = cells.length - 1;
  while (last > first && cells[last] === "") last--;

  const details = [];
  const width = Math.max(EXPECTED_COLUMNS.length, last - first + 1);
  for (let i = 0; i < width; i++) {
    const want = EXPECTED_COLUMNS[i]?.name;
    const raw = String(grid[r][first + i] ?? "").trim();
    if (clean(raw) === clean(want)) continue;
    const where = `Column ${columnLetter(first + i)}`;
    if (!want) details.push(`${where}: extra column "${raw}" is not expected`);
    else if (!raw) details.push(`${where}: "${want}" is missing`);
    else details.push(`${where}: expected "${want}", found "${raw}"`);
  }
  if (details.length) {
    throw new LabelFileError(
      `The Excel headers (row ${r + 1}) do not match the BUSY "List of Sales Vouchers" format.`,
      details,
    );
  }

  const col = {};
  EXPECTED_COLUMNS.forEach((c, i) => {
    col[c.key] = first + i;
  });
  return { row: r, col };
}

/**
 * Parse an uploaded workbook into label rows.
 * Returns { rows, returnsSkipped, totalCheck }.
 *   totalCheck: null when the file has no Total row, else
 *   { boxesFile, boxesTotal, qtyFile, qtyTotal, ok }
 * Throws LabelFileError (message + details) when the file isn't the expected export.
 */
export async function readLabelExcel(file) {
  if (!/\.(xlsx|xls)$/i.test(file.name || "")) {
    throw new LabelFileError(
      "Please upload an Excel file (.xlsx or .xls) exported from BUSY.",
    );
  }
  let wb;
  try {
    wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
  } catch {
    throw new LabelFileError(
      "This file could not be opened as an Excel workbook.",
    );
  }
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new LabelFileError("The Excel file has no sheets.");

  const grid = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: false,
    defval: "",
    dateNF: "dd-mm-yyyy",
  });
  const header = validateHeader(grid);
  const { col } = header;
  const get = (line, key) => String(line[col[key]] ?? "").trim();

  const rows = [];
  let returnsSkipped = 0;
  let totalCheck = null;
  // Sums over every item line (returns included) so they compare with BUSY's Total row.
  let boxesFile = 0;
  let qtyFile = 0;
  let current = null; // the invoice whose items we are walking through

  for (let r = header.row + 1; r < grid.length; r++) {
    const line = grid[r];
    const item = get(line, "item").replace(/\s+/g, " ");
    const bill = get(line, "bill");

    // End of data: BUSY's Total row.
    if (!bill && /^(grand\s*)?total$/i.test(item)) {
      const boxesTotal = toNumber(get(line, "boxes"));
      const qtyTotal = toNumber(get(line, "qty"));
      totalCheck = {
        boxesFile,
        boxesTotal,
        qtyFile,
        qtyTotal,
        ok:
          (Number.isNaN(boxesTotal) || boxesTotal === boxesFile) &&
          (Number.isNaN(qtyTotal) || Math.abs(qtyTotal - qtyFile) < 0.001),
      };
      break;
    }
    if (!item) continue;

    if (bill) {
      // First item of a new invoice: it carries the invoice-level fields.
      current = {
        bill,
        date: get(line, "date"),
        party: get(line, "party"),
        po: get(line, "po"),
        docket: get(line, "docket"),
        transporter: get(line, "transporter"),
      };
    } else if (!current) {
      continue; // item line with no invoice above it
    }

    const qty = toNumber(get(line, "qty"));
    const boxesRaw = toNumber(get(line, "boxes"));
    if (!Number.isNaN(boxesRaw)) boxesFile += boxesRaw;
    if (!Number.isNaN(qty)) qtyFile += qty;

    if (qty < 0 || /^SR-/i.test(current.bill)) {
      returnsSkipped++;
      continue;
    }

    // If BUSY ever repeats PO / Docket / Transporter on an item row, use that value.
    current.po = get(line, "po") || current.po;
    current.docket = get(line, "docket") || current.docket;
    current.transporter = get(line, "transporter") || current.transporter;

    const fsn = get(line, "fsn");
    const boxes = Number.isInteger(boxesRaw) && boxesRaw > 0 ? boxesRaw : 0;

    const errors = [];
    if (!fsn) errors.push("Sku Code");
    if (!current.po) errors.push("PO Number");
    if (!current.docket) errors.push("Docket No");
    if (!boxes)
      errors.push(
        Number.isNaN(boxesRaw) ? "CASE / BOX" : "CASE / BOX (whole number > 0)",
      );

    rows.push({
      id: rows.length,
      excelRow: r + 1,
      date: current.date,
      bill: current.bill,
      party: current.party,
      po: current.po,
      docket: current.docket,
      transporter: current.transporter,
      item,
      fsn,
      qty: Number.isNaN(qty) ? "" : qty,
      unit: get(line, "unit"),
      boxes,
      errors,
    });
  }

  if (rows.length === 0)
    throw new LabelFileError(
      "The headers are correct, but no sale items were found below them.",
    );
  return { rows, returnsSkipped, totalCheck };
}

/**
 * Box numbering for each valid row: { offset, total }.
 * 'sku'     → every row runs 1..boxes.
 * 'invoice' → numbers continue across the items of one invoice.
 */
export function computeBoxNumbering(rows, mode) {
  const result = {};
  if (mode === "invoice") {
    const byBill = new Map();
    for (const row of rows) {
      if (row.errors.length) continue;
      if (!byBill.has(row.bill)) byBill.set(row.bill, []);
      byBill.get(row.bill).push(row);
    }
    for (const list of byBill.values()) {
      const total = list.reduce((s, r) => s + r.boxes, 0);
      let offset = 0;
      for (const row of list) {
        result[row.id] = { offset, total };
        offset += row.boxes;
      }
    }
  } else {
    for (const row of rows) {
      if (!row.errors.length) result[row.id] = { offset: 0, total: row.boxes };
    }
  }
  return result;
}

export function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([LABEL_HEADERS]);
  ws["!cols"] = [12, 16, 18, 28, 18, 34, 20, 40, 10, 8, 7, 9, 11, 13].map(
    (wch) => ({ wch }),
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Label Data");
  XLSX.writeFile(wb, "Label Upload Template.xlsx");
}

// Reads the dispatch label Excel (BUSY "List of Sales Vouchers" columns A–H
// plus FSN No / PO No / Docket No / Total Boxes) entirely in the browser.
// Columns are matched by header text, not position, and the header row is
// searched for, so a raw BUSY export with its title rows also works.
import * as XLSX from 'xlsx';

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

const COLUMN_ALIASES = {
  date: ['date'],
  bill: ['vchbillno', 'billno', 'vchno', 'invoiceno'],
  party: ['particulars', 'party'],
  item: ['itemdetails', 'item', 'itemname'],
  qty: ['qty', 'quantity'],
  unit: ['unit'],
  fsn: ['fsnno', 'fsn'],
  po: ['pono', 'po', 'ponumber'],
  docket: ['docketno', 'docket', 'docketnumber'],
  boxes: ['totalboxes', 'boxes', 'noofboxes'],
};

export const LABEL_HEADERS = [
  'Date', 'Vch/Bill No', 'Particulars', 'Item Details', 'Qty.', 'Unit', 'Price', 'Amount',
  'FSN No', 'PO No', 'Docket No', 'Total Boxes',
];

function toNumber(v) {
  const n = parseFloat(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
}

function findHeader(grid) {
  for (let r = 0; r < Math.min(grid.length, 30); r++) {
    const cells = grid[r].map(norm);
    const col = {};
    for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
      const idx = cells.findIndex((c) => aliases.includes(c));
      if (idx !== -1) col[key] = idx;
    }
    if (col.bill !== undefined && col.item !== undefined) return { row: r, col };
  }
  return null;
}

/**
 * Parse an uploaded workbook into label rows.
 * Returns { rows, returnsSkipped, missingColumns }.
 * Throws Error with a user-facing message when the file can't be used at all.
 */
export async function readLabelExcel(file) {
  const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new Error('The Excel file has no sheets.');

  const grid = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '', dateNF: 'dd-mm-yyyy' });
  const header = findHeader(grid);
  if (!header) {
    throw new Error('Could not find the header row. The sheet needs "Vch/Bill No" and "Item Details" columns.');
  }

  const { col } = header;
  const missingColumns = ['fsn', 'po', 'docket', 'boxes']
    .filter((k) => col[k] === undefined)
    .map((k) => ({ fsn: 'FSN No', po: 'PO No', docket: 'Docket No', boxes: 'Total Boxes' })[k]);

  const get = (line, key) => (col[key] === undefined ? '' : String(line[col[key]] ?? '').trim());

  const rows = [];
  let returnsSkipped = 0;
  let current = null; // invoice context carried down to item-only rows

  for (let r = header.row + 1; r < grid.length; r++) {
    const line = grid[r];
    const item = get(line, 'item').replace(/\s+/g, ' ');
    if (!item) continue;

    const bill = get(line, 'bill');
    if (bill) {
      current = { bill, date: get(line, 'date'), party: get(line, 'party'), po: '', docket: '' };
    } else if (!current) {
      continue; // item line with no invoice above it
    }

    const qty = toNumber(get(line, 'qty'));
    if (qty < 0 || /^SR-/i.test(current.bill)) {
      returnsSkipped++;
      continue;
    }

    // PO / Docket are per invoice: fill once, reused for the invoice's later items.
    const po = get(line, 'po') || current.po;
    const docket = get(line, 'docket') || current.docket;
    current.po = po;
    current.docket = docket;

    const fsn = get(line, 'fsn');
    const boxesRaw = toNumber(get(line, 'boxes'));
    const boxes = Number.isInteger(boxesRaw) && boxesRaw > 0 ? boxesRaw : 0;

    const errors = [];
    if (!fsn) errors.push('FSN No');
    if (!po) errors.push('PO No');
    if (!docket) errors.push('Docket No');
    if (!boxes) errors.push(Number.isNaN(boxesRaw) ? 'Total Boxes' : 'Total Boxes (whole number > 0)');

    rows.push({
      id: rows.length,
      excelRow: r + 1,
      date: current.date,
      bill: current.bill,
      party: current.party,
      item,
      qty: Number.isNaN(qty) ? '' : qty,
      unit: get(line, 'unit'),
      fsn,
      po,
      docket,
      boxes,
      errors,
    });
  }

  if (rows.length === 0) throw new Error('No sale items found below the header row.');
  return { rows, returnsSkipped, missingColumns };
}

/**
 * Box numbering for each valid row: { offset, total }.
 * 'sku'     → every row runs 1..boxes.
 * 'invoice' → numbers continue across the items of one invoice.
 */
export function computeBoxNumbering(rows, mode) {
  const result = {};
  if (mode === 'invoice') {
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
  ws['!cols'] = [12, 18, 34, 40, 8, 7, 9, 11, 22, 16, 14, 12].map((wch) => ({ wch }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Label Data');
  XLSX.writeFile(wb, 'Label Upload Template.xlsx');
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  computeBoxNumbering,
  downloadTemplate,
  LABEL_HEADERS,
  readLabelExcel,
} from "../../lib/labelExcel";
import BoxLabel from "./BoxLabel";

import "./labels.css";

const SETTINGS_KEY = "vimpactapp:labelSettings";
const DEFAULT_SETTINGS = {
  company: "VIMPACT CARE PVT LTD",
  numbering: "sku",
  offsetX: 0,
  offsetY: 0,
};
const VISIBLE_ROWS = 10; // table scrolls after this many rows

function loadSettings() {
  try {
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Printed box-number range for a row, honouring the user's From/To (reprint) inputs. */
function rangeFor(row, numbering, input) {
  const n = numbering[row.id];
  if (!n) return null;
  const min = n.offset + 1;
  const max = n.offset + row.boxes;
  const from =
    input?.from === undefined || input.from === "" ? min : Number(input.from);
  const to =
    input?.to === undefined || input.to === "" ? max : Number(input.to);
  const valid =
    Number.isInteger(from) &&
    Number.isInteger(to) &&
    from >= min &&
    to <= max &&
    from <= to;
  return {
    min,
    max,
    from,
    to,
    total: n.total,
    valid,
    count: valid ? to - from + 1 : 0,
  };
}

function buildLabels(row, range, company) {
  const labels = [];
  for (let b = range.from; b <= range.to; b++) {
    labels.push({
      key: `${row.id}-${b}`,
      company,
      item: row.item,
      fsn: row.fsn,
      docket: row.docket,
      po: row.po,
      transporter: row.transporter,
      party: row.party,
      bill: row.bill,
      boxNo: b,
      boxTotal: range.total,
    });
  }
  return labels;
}

export default function LabelPrinting() {
  const [settings, setSettings] = useState(loadSettings);
  const [file, setFile] = useState(null); // { name, rows, returnsSkipped, totalCheck }
  const [error, setError] = useState(null); // { message, details[], fileName }
  const [reading, setReading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [ranges, setRanges] = useState({});
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [printJob, setPrintJob] = useState(null);
  const [toolsOpen, setToolsOpen] = useState(false); // preview & settings section, collapsed by default
  const inputRef = useRef(null);
  const tableWrapRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Render the labels first, then open the print dialog; clear once it closes.
  useEffect(() => {
    if (!printJob) return undefined;
    const t = setTimeout(() => {
      window.print();
      setPrintJob(null);
    }, 100);
    return () => clearTimeout(t);
  }, [printJob]);

  const rows = useMemo(() => file?.rows ?? [], [file]);
  const numbering = useMemo(
    () => computeBoxNumbering(rows, settings.numbering),
    [rows, settings.numbering],
  );

  const rangeById = useMemo(() => {
    const map = {};
    for (const row of rows)
      map[row.id] = rangeFor(row, numbering, ranges[row.id]);
    return map;
  }, [rows, numbering, ranges]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.bill, r.party, r.item, r.fsn, r.po, r.docket, r.transporter].some(
        (v) => v.toLowerCase().includes(q),
      ),
    );
  }, [rows, search]);

  // Cap the table at VISIBLE_ROWS rows (rows differ in height, so measure them) and scroll the rest.
  useLayoutEffect(() => {
    const wrap = tableWrapRef.current;
    if (!wrap) return undefined;
    const measure = () => {
      const trs = wrap.querySelectorAll("tbody tr");
      if (trs.length <= VISIBLE_ROWS) {
        wrap.style.maxHeight = "";
        return;
      }
      let height = wrap.querySelector("thead").offsetHeight;
      for (let i = 0; i < VISIBLE_ROWS; i++) height += trs[i].offsetHeight;
      wrap.style.maxHeight = `${height + 2}px`;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [visibleRows, file]);

  const summary = useMemo(() => {
    const selectedRows = rows.filter(
      (r) => selected.has(r.id) && rangeById[r.id]?.valid,
    );
    return {
      invoices: new Set(rows.map((r) => r.bill)).size,
      skus: rows.length,
      errorRows: rows.filter((r) => r.errors.length).length,
      selectedRows: selectedRows.length,
      labels: selectedRows.reduce((s, r) => s + rangeById[r.id].count, 0),
    };
  }, [rows, selected, rangeById]);

  const previewRow =
    rows.find((r) => r.id === previewId && !r.errors.length) ||
    rows.find((r) => !r.errors.length);
  const previewRange = previewRow ? rangeById[previewRow.id] : null;
  const previewLabel =
    previewRow && previewRange?.valid ?
      buildLabels(
        previewRow,
        { ...previewRange, to: previewRange.from },
        settings.company,
      )[0]
    : null;

  async function handleFile(f) {
    if (!f) return;
    setError(null);
    setReading(true);
    try {
      const parsed = await readLabelExcel(f);
      setFile({ name: f.name, ...parsed });
      setSelected(
        new Set(parsed.rows.filter((r) => !r.errors.length).map((r) => r.id)),
      );
      setRanges({});
      setSearch("");
      setPreviewId(null);
    } catch (err) {
      setFile(null);
      setError({
        message:
          err.message ||
          "Could not read this file. Please upload an .xlsx or .xls file.",
        details: err.details || [],
        fileName: f.name,
      });
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectableVisible = visibleRows.filter((r) => !r.errors.length);
  const allVisibleSelected =
    selectableVisible.length > 0 &&
    selectableVisible.every((r) => selected.has(r.id));

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const r of selectableVisible) {
        if (allVisibleSelected) next.delete(r.id);
        else next.add(r.id);
      }
      return next;
    });
  }

  function setRange(id, field, value) {
    setRanges((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function updateSetting(field, value) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  function printSelected() {
    const labels = rows
      .filter((r) => selected.has(r.id) && rangeById[r.id]?.valid)
      .flatMap((r) => buildLabels(r, rangeById[r.id], settings.company));
    if (labels.length) setPrintJob(labels);
  }

  function printTest() {
    if (previewLabel) setPrintJob([previewLabel]);
  }

  return (
    <div className="table-page labels-page">
      {/* Upload */}
      <section
        className={`lbl-upload ${dragOver ? "drag" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div>
          <h3>Upload sales Excel</h3>
          <p>
            BUSY "List of Sales Vouchers" export with <b>PO NUMBER</b>,{" "}
            <b>Docket No / Gr No</b>, <b>TRANSPORTER</b>, <b>Sku Code</b> and{" "}
            <b>CASE / BOX</b>. Drag the file here or choose it.
          </p>
          {file && (
            <p className="lbl-file-name">
              Loaded: <b>{file.name}</b>
            </p>
          )}
        </div>
        <div className="lbl-upload-actions">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="table-search-btn"
            onClick={() => inputRef.current?.click()}
            disabled={reading}
          >
            {reading ?
              "Reading…"
            : file ?
              "Choose another file"
            : "Choose Excel file"}
          </button>
          <button
            type="button"
            className="table-action-btn"
            onClick={downloadTemplate}
          >
            Download blank template
          </button>
        </div>
      </section>

      {error && (
        <div className="page-banner page-banner-error lbl-reject" role="alert">
          <b>File rejected{error.fileName ? `: ${error.fileName}` : ""}</b>
          <p>{error.message}</p>
          {error.details.length > 0 && (
            <ul>
              {error.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          <p className="lbl-reject-hint">
            Upload the BUSY "List of Sales Vouchers" export with these columns
            in this order:{" "}
            <span className="mono">{LABEL_HEADERS.join(" | ")}</span>
          </p>
        </div>
      )}

      {file && (
        <>
          {file.totalCheck && !file.totalCheck.ok && (
            <p className="page-banner page-banner-error">
              The file's Total row does not match its items:{" "}
              {[
                file.totalCheck.boxesFile !== file.totalCheck.boxesTotal &&
                  `CASE / BOX adds up to ${file.totalCheck.boxesFile} but Total says ${file.totalCheck.boxesTotal}`,
                Math.abs(file.totalCheck.qtyFile - file.totalCheck.qtyTotal) >=
                  0.001 &&
                  `Qty adds up to ${file.totalCheck.qtyFile} but Total says ${file.totalCheck.qtyTotal}`,
              ]
                .filter(Boolean)
                .join("; ")}
              . Check the export before printing.
            </p>
          )}
          {!file.totalCheck && (
            <p className="page-banner page-banner-warn">
              No "Total" row found at the end of the sheet, so the file could
              not be checked for missing rows.
            </p>
          )}

          {/* Summary */}
          <div className="lbl-stats">
            <div>
              <span>Invoices</span>
              <b>{summary.invoices}</b>
            </div>
            <div>
              <span>Items (SKU rows)</span>
              <b>{summary.skus}</b>
              {file.returnsSkipped > 0 && (
                <small>
                  {file.returnsSkipped} sales return line(s) skipped
                </small>
              )}
            </div>
            <div className={summary.errorRows ? "crit" : ""}>
              <span>Rows with missing data</span>
              <b>{summary.errorRows}</b>
            </div>
            <div
              className={
                file.totalCheck ?
                  file.totalCheck.ok ?
                    "good"
                  : "crit"
                : ""
              }
            >
              <span>Total row check</span>
              <b>
                {file.totalCheck ?
                  file.totalCheck.ok ?
                    `✓ ${file.totalCheck.boxesTotal} boxes`
                  : "✗ Mismatch"
                : "—"}
              </b>
            </div>
            <div className="good">
              <span>Labels to print</span>
              <b>{summary.labels}</b>
            </div>
          </div>

          {/* Preview + settings: collapsible, closed by default so the table sits higher */}
          <section className={`lbl-tools ${toolsOpen ? "open" : ""}`}>
            <div className="lbl-tools-bar">
              <button
                type="button"
                className="lbl-tools-toggle"
                aria-expanded={toolsOpen}
                aria-controls="lbl-tools-body"
                onClick={() => setToolsOpen((o) => !o)}
              >
                <span className="lbl-tools-chev" aria-hidden="true">
                  ›
                </span>
                <span className="lbl-tools-title">
                  Label preview &amp; settings
                </span>
                {previewLabel && (
                  <span className="lbl-tools-current">
                    {previewLabel.bill} · {previewLabel.item}
                  </span>
                )}
              </button>
              <button
                type="button"
                className="table-action-btn"
                onClick={printTest}
                disabled={!previewLabel || !!printJob}
              >
                Test print 1 label
              </button>
            </div>

            {toolsOpen && (
              <div className="lbl-top" id="lbl-tools-body">
                <div className="lbl-card">
                  <div className="lbl-card-head">
                    <h4>Label preview (100 × 50 mm)</h4>
                  </div>
                  <div className="lbl-preview">
                    {previewLabel ?
                      <BoxLabel
                        label={previewLabel}
                        offsetX={settings.offsetX}
                        offsetY={settings.offsetY}
                      />
                    : <p className="lbl-muted">
                        Fix the rows with missing data to see a preview.
                      </p>
                    }
                  </div>
                  <p className="lbl-muted lbl-hint">
                    Click a row in the table to preview its label.
                  </p>
                </div>

                <div className="lbl-card lbl-settings">
                  <h4>Label settings</h4>
                  <label>
                    <span>Company name on label</span>
                    <input
                      value={settings.company}
                      onChange={(e) => updateSetting("company", e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Box numbering</span>
                    <select
                      value={settings.numbering}
                      onChange={(e) => {
                        updateSetting("numbering", e.target.value);
                        setRanges({});
                      }}
                    >
                      <option value="sku">Per item (each SKU 1/N)</option>
                      <option value="invoice">
                        Per invoice (across items)
                      </option>
                    </select>
                  </label>
                  <div className="lbl-offsets">
                    <label>
                      <span>Shift right (mm)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={settings.offsetX}
                        onChange={(e) =>
                          updateSetting("offsetX", Number(e.target.value) || 0)
                        }
                      />
                    </label>
                    <label>
                      <span>Shift down (mm)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={settings.offsetY}
                        onChange={(e) =>
                          updateSetting("offsetY", Number(e.target.value) || 0)
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="table-action-btn"
                    onClick={() => setSettings(DEFAULT_SETTINGS)}
                  >
                    Reset settings
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Rows: full width */}
          <div className="lbl-rows">
            <div className="table-toolbar lbl-toolbar">
              <label className="lbl-search">
                <span>Search</span>
                <input
                  type="search"
                  placeholder="Invoice, party, item, Sku code, PO, docket or transporter"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="table-search-btn"
                onClick={printSelected}
                disabled={!summary.labels || !!printJob}
              >
                Print {summary.labels} label{summary.labels === 1 ? "" : "s"}
              </button>
            </div>

            <div className="table-wrap lbl-table-wrap" ref={tableWrapRef}>
              <table className="data-table lbl-table">
                <thead>
                  <tr>
                    <th className="col-check">
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        disabled={!selectableVisible.length}
                      />
                    </th>
                    <th className="col-bill">Invoice / Party</th>
                    <th>Item</th>
                    <th className="col-fsn">Sku Code (FSN)</th>
                    <th className="col-po">PO / Docket / Transporter</th>
                    <th className="col-boxes">Boxes</th>
                    <th className="col-range">Print box no.</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="table-empty">
                        No rows match the search.
                      </td>
                    </tr>
                  )}
                  {visibleRows.map((row) => {
                    const range = rangeById[row.id];
                    const bad = row.errors.length > 0;
                    return (
                      <tr
                        key={row.id}
                        className={`${bad ? "row-error" : ""} ${previewRow?.id === row.id ? "row-preview" : ""}`}
                        onClick={() => !bad && setPreviewId(row.id)}
                      >
                        <td
                          className="col-check"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            aria-label={`Select ${row.bill} ${row.item}`}
                            checked={selected.has(row.id)}
                            disabled={bad}
                            onChange={() => toggleRow(row.id)}
                          />
                        </td>
                        <td className="col-bill">
                          <div className="mono">{row.bill}</div>
                          {row.party && (
                            <div className="lbl-muted lbl-party-cell">
                              {row.party}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="lbl-cell-item">{row.item}</div>
                          {bad && (
                            <div className="lbl-cell-error">
                              Missing: {row.errors.join(", ")} (Excel row{" "}
                              {row.excelRow})
                            </div>
                          )}
                        </td>
                        <td className="mono col-fsn">{row.fsn || "—"}</td>
                        <td className="mono col-po">
                          <div>{row.po || "—"}</div>
                          <div className="lbl-muted">{row.docket || "—"}</div>
                          {row.transporter && (
                            <div className="lbl-muted lbl-transporter">
                              {row.transporter}
                            </div>
                          )}
                        </td>
                        <td className="col-boxes">{row.boxes || "—"}</td>
                        <td
                          className="col-range"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {range ?
                            <div
                              className={`lbl-range ${range.valid ? "" : "invalid"}`}
                            >
                              <input
                                type="number"
                                min={range.min}
                                max={range.max}
                                placeholder={range.min}
                                value={ranges[row.id]?.from ?? ""}
                                onChange={(e) =>
                                  setRange(row.id, "from", e.target.value)
                                }
                                aria-label="From box"
                              />
                              <span>to</span>
                              <input
                                type="number"
                                min={range.min}
                                max={range.max}
                                placeholder={range.max}
                                value={ranges[row.id]?.to ?? ""}
                                onChange={(e) =>
                                  setRange(row.id, "to", e.target.value)
                                }
                                aria-label="To box"
                              />
                            </div>
                          : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <details className="lbl-card lbl-help">
        <summary>TSC printer setup (one time)</summary>
        <ol>
          <li>
            Windows → Printers → <b>TSC printer</b> → Printing preferences →
            Page Setup → <b>New</b> stock: width <b>100 mm</b>, height{" "}
            <b>50 mm</b>.
          </li>
          <li>
            Stock tab: Media type <b>Labels with gaps</b>, gap height as on the
            roll (usually 2–3 mm).
          </li>
          <li>
            In Chrome's print dialog: choose the TSC printer, Paper size{" "}
            <b>100 × 50 mm</b>, Margins <b>None</b>, Scale <b>Default/100</b>,
            and untick <b>Headers and footers</b>.
          </li>
          <li>
            Use <b>Test print 1 label</b> first. If the text sits off-centre,
            adjust <i>Shift right / Shift down</i> in Label settings.
          </li>
        </ol>
      </details>

      {printJob &&
        createPortal(
          <div className="label-print-root">
            <style>{"@page { size: 100mm 50mm; margin: 0; }"}</style>
            {printJob.map((label) => (
              <BoxLabel
                key={label.key}
                label={label}
                offsetX={settings.offsetX}
                offsetY={settings.offsetY}
              />
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

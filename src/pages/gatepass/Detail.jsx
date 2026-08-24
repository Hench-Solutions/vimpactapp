import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGatePassRow } from '../../lib/gatePassData';
import { searchBusyVouchers } from '../../lib/busyVouchers';

// Demo-only placeholder for an uploaded photo - no real images exist yet,
// this just needs to look like "a page of a document" at a glance.
function DocPlaceholder({ n }) {
  return (
    <div className="doc-placeholder">
      <div className="doc-placeholder-lines">
        <span /><span /><span style={{ width: '60%' }} />
      </div>
      <span className="doc-placeholder-tag">Pic {n}</span>
    </div>
  );
}

// Vendor + Bill No together are the match key (agreed design); Date and
// Amount are shown as confirmation, not filtered on, since OCR/typed
// values can be slightly off - the human picks the right row, the system
// doesn't silently auto-pick for them.
function TagVoucherModal({ vendor, invNo, onCancel, onConfirm }) {
  const candidates = searchBusyVouchers({ vendor, invNo });
  const [checkedIdx, setCheckedIdx] = useState(null);

  return (
    <div className="tag-modal-overlay" onClick={onCancel}>
      <div className="tag-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Tag BUSY Voucher</h3>
        <p className="tag-modal-sub">
          Searching by Vendor <strong>"{vendor || '—'}"</strong> and Invoice No. <strong>"{invNo || '—'}"</strong>
        </p>

        {candidates.length === 0 ? (
          <p className="tag-modal-empty">No matching BUSY voucher found for these values yet.</p>
        ) : (
          <div className="tag-modal-list">
            <div className="tag-modal-row tag-modal-head">
              <span></span>
              <span>Bill No</span>
              <span>Vendor</span>
              <span>Date</span>
              <span>Amount</span>
            </div>
            {candidates.map((c, i) => (
              <label key={i} className="tag-modal-row">
                <input
                  type="checkbox"
                  checked={checkedIdx === i}
                  onChange={() => setCheckedIdx(checkedIdx === i ? null : i)}
                />
                <span className="mono">{c.billNo}</span>
                <span>{c.vendor}</span>
                <span>{c.date}</span>
                <span className="num">₹{c.amount}</span>
              </label>
            ))}
          </div>
        )}

        <div className="tag-modal-actions">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            type="button"
            className="btn-primary"
            disabled={checkedIdx === null}
            onClick={() => onConfirm(candidates[checkedIdx])}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GatePassDetail() {
  const { gatePassNo } = useParams();
  const navigate = useNavigate();
  const row = getGatePassRow(gatePassNo);

  const [activePic, setActivePic] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  const [ocrState, setOcrState] = useState('reading'); // reading | ok | failed
  const [form, setForm] = useState({ invNo: '', invoiceDate: '', invoiceName: '', amount: '' });
  const [saved, setSaved] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [taggedVoucher, setTaggedVoucher] = useState(null);

  useEffect(() => {
    if (!row) return;
    setOcrState('reading');
    setForm({ invNo: '', invoiceDate: '', invoiceName: '', amount: '' });
    setTaggedVoucher(null);
    const t = setTimeout(() => {
      if (row.invNo) {
        setForm({ invNo: row.invNo, invoiceDate: row.invoiceDate, invoiceName: row.invoiceName, amount: row.amount });
        setOcrState('ok');
      } else {
        setOcrState('failed');
      }
    }, 1100);
    return () => clearTimeout(t);
  }, [row]);

  if (!row) {
    return (
      <div className="placeholder-page">
        <h2>Not found</h2>
        <p>No demo data for Gate Pass <code>{gatePassNo}</code>.</p>
      </div>
    );
  }

  function handleField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTaggedVoucher(null); // editing the invoice fields invalidates a prior tag - re-confirm needed
  }

  function handleTagConfirm(voucher) {
    setTaggedVoucher(voucher);
    setShowTagModal(false);
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const fieldsReady = ocrState !== 'reading';

  return (
    <div className="gpd-page">
      <button type="button" className="gpd-back" onClick={() => navigate('/gatepass/all')}>← Back to list</button>

      <div className="gpd-layout">
        <div className="gpd-left">
          <div className="gpd-tabs">
            {Array.from({ length: row.docs }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`gpd-tab ${activePic === n ? 'active' : ''}`}
                onClick={() => setActivePic(n)}
              >
                Pic {n}
              </button>
            ))}
          </div>

          <button type="button" className="gpd-preview" onClick={() => setLightbox(true)}>
            <DocPlaceholder n={activePic} />
            <span className="gpd-preview-hint">Click to view full size</span>
          </button>
        </div>

        <form className="gpd-right" onSubmit={handleSave}>
          <div className="gpd-field">
            <span>Gate Pass No.</span>
            <input type="text" value={row.gatePassNo} readOnly className="gpd-readonly" />
          </div>

          {ocrState === 'reading' && (
            <div className="gpd-ocr-banner reading">⏳ Reading document with OCR…</div>
          )}
          {ocrState === 'failed' && (
            <div className="gpd-ocr-banner failed">⚠ OCR could not read this document — please enter the details manually.</div>
          )}
          {ocrState === 'ok' && (
            <div className="gpd-ocr-banner ok">✓ Filled automatically from OCR — check before saving.</div>
          )}

          <div className="gpd-field">
            <span>Invoice No.</span>
            <input type="text" value={form.invNo} disabled={!fieldsReady} onChange={(e) => handleField('invNo', e.target.value)} />
          </div>
          <div className="gpd-field">
            <span>Invoice Date</span>
            <input type="date" value={form.invoiceDate} disabled={!fieldsReady} onChange={(e) => handleField('invoiceDate', e.target.value)} />
          </div>

          <div className="gpd-field">
            <span>Invoice Name</span>
            <div className="gpd-field-with-action">
              <input type="text" value={form.invoiceName} disabled={!fieldsReady} onChange={(e) => handleField('invoiceName', e.target.value)} />
              <button
                type="button"
                className="gpd-tag-btn"
                disabled={!fieldsReady}
                onClick={() => setShowTagModal(true)}
                title="Search BUSY and tag the matching Purchase Voucher"
              >
                🔍 Tag BUSY Voucher
              </button>
            </div>
          </div>

          {taggedVoucher && (
            <div className="gpd-ocr-banner ok">
              ✓ Matched to BUSY voucher <strong>{taggedVoucher.billNo}</strong> ({taggedVoucher.vendor}, ₹{taggedVoucher.amount})
            </div>
          )}

          <div className="gpd-field">
            <span>Amount</span>
            <input type="number" value={form.amount} disabled={!fieldsReady} onChange={(e) => handleField('amount', e.target.value)} />
          </div>

          <button type="submit" className="gpd-save" disabled={!fieldsReady}>
            {saved
              ? (taggedVoucher ? 'Saved & Matched ✓ (demo only)' : 'Saved ✓ (demo only)')
              : 'SAVE'}
          </button>
        </form>
      </div>

      {lightbox && (
        <div className="gpd-lightbox" onClick={() => setLightbox(false)}>
          <div className="gpd-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <DocPlaceholder n={activePic} big />
          </div>
          <button className="gpd-lightbox-close" onClick={() => setLightbox(false)} aria-label="Close">✕</button>
        </div>
      )}

      {showTagModal && (
        <TagVoucherModal
          vendor={form.invoiceName}
          invNo={form.invNo}
          onCancel={() => setShowTagModal(false)}
          onConfirm={handleTagConfirm}
        />
      )}
    </div>
  );
}

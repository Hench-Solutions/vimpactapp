import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGatePassRow } from '../../lib/gatePassData';

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

export default function GatePassDetail() {
  const { gatePassNo } = useParams();
  const navigate = useNavigate();
  const row = getGatePassRow(gatePassNo);

  const [activePic, setActivePic] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  const [ocrState, setOcrState] = useState('reading'); // reading | ok | failed
  const [form, setForm] = useState({ invNo: '', invoiceDate: '', invoiceName: '', amount: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!row) return;
    setOcrState('reading');
    setForm({ invNo: '', invoiceDate: '', invoiceName: '', amount: '' });
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
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

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
            <input type="text" value={form.invNo} disabled={ocrState === 'reading'} onChange={(e) => handleField('invNo', e.target.value)} />
          </div>
          <div className="gpd-field">
            <span>Invoice Date</span>
            <input type="date" value={form.invoiceDate} disabled={ocrState === 'reading'} onChange={(e) => handleField('invoiceDate', e.target.value)} />
          </div>
          <div className="gpd-field">
            <span>Invoice Name</span>
            <input type="text" value={form.invoiceName} disabled={ocrState === 'reading'} onChange={(e) => handleField('invoiceName', e.target.value)} />
          </div>
          <div className="gpd-field">
            <span>Amount</span>
            <input type="number" value={form.amount} disabled={ocrState === 'reading'} onChange={(e) => handleField('amount', e.target.value)} />
          </div>

          <button type="submit" className="gpd-save" disabled={ocrState === 'reading'}>
            {saved ? 'Saved ✓ (demo only)' : 'SAVE'}
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
    </div>
  );
}

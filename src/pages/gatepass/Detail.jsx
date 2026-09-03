import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchGatePassPhotos, runGatePassOcr, saveGatePassInvoice } from '../../lib/api';

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const OCR_BANNER = {
  ok:     { cls: 'ok',      text: '✓ Filled automatically from OCR — check before saving.' },
  failed: { cls: 'failed',  text: '⚠ OCR could not read this document — please enter the details manually.' },
  manual: { cls: 'ok',      text: '✓ Saved manually.' },
  pending: null,
};

export default function GatePassDetail() {
  const { gatePassId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const row = location.state; // passed from AllEntries - gatePassNo, guardName, status, createdAt, invoice fields

  const [photos, setPhotos] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(false);

  const [invoice, setInvoice] = useState({
    invoiceNo: row?.invoiceNo || '',
    invoiceDate: row?.invoiceDate ? row.invoiceDate.slice(0, 10) : '',
    vendorName: row?.vendorName || '',
    amount: row?.amount ?? '',
  });
  const [ocrStatus, setOcrStatus] = useState(row?.ocrStatus || 'pending');
  const [ocrRunning, setOcrRunning] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchGatePassPhotos(gatePassId)
      .then((list) => { if (!cancelled) { setPhotos(list); setActiveIdx(0); } })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [gatePassId]);

  const activePhoto = photos[activeIdx];

  async function handleRunOcr() {
    setOcrRunning(true);
    setFormError('');
    try {
      const result = await runGatePassOcr(gatePassId);
      setInvoice({
        invoiceNo: result.invoiceNo || '',
        invoiceDate: result.invoiceDate ? result.invoiceDate.slice(0, 10) : '',
        vendorName: result.vendorName || '',
        amount: result.amount ?? '',
      });
      setOcrStatus(result.ocrStatus);
    } catch (err) {
      setFormError(err.message);
      setOcrStatus('failed');
    } finally {
      setOcrRunning(false);
    }
  }

  function set(field, value) {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await saveGatePassInvoice(gatePassId, {
        InvoiceNo: invoice.invoiceNo.trim() || null,
        InvoiceDate: invoice.invoiceDate || null,
        VendorName: invoice.vendorName.trim() || null,
        Amount: invoice.amount === '' ? null : Number(invoice.amount),
      });
      setOcrStatus('manual');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const banner = OCR_BANNER[ocrStatus];

  return (
    <div className="gpd-page">
      <button type="button" className="gpd-back" onClick={() => navigate('/gatepass/all')}>← Back to list</button>

      <div className="gpd-layout">
        <div className="gpd-left">
          {loading && <p className="tag-modal-sub">Loading documents…</p>}
          {error && <p className="tag-modal-sub" style={{ color: 'var(--crit)' }}>{error}</p>}

          {!loading && !error && photos.length === 0 && (
            <p className="tag-modal-sub">No documents uploaded for this gate pass.</p>
          )}

          {!loading && !error && photos.length > 0 && (
            <>
              <div className="gpd-tabs">
                {photos.map((p, i) => (
                  <button
                    key={p.photoId}
                    type="button"
                    className={`gpd-tab ${activeIdx === i ? 'active' : ''}`}
                    onClick={() => setActiveIdx(i)}
                  >
                    Pic {i + 1}
                  </button>
                ))}
              </div>

              <button type="button" className="gpd-preview" onClick={() => setLightbox(true)}>
                <img src={activePhoto.url} alt={`Document ${activeIdx + 1}`} style={{ maxWidth: '100%', borderRadius: 8 }} />
                <span className="gpd-preview-hint">Click to view full size</span>
              </button>
            </>
          )}
        </div>

        <form className="gpd-right" onSubmit={handleSave}>
          <div className="gpd-field">
            <span>Gate Pass No.</span>
            <input type="text" value={row?.gatePassNo || gatePassId} readOnly className="gpd-readonly" />
          </div>
          <div className="gpd-field">
            <span>Guard</span>
            <input type="text" value={row?.guardName || '—'} readOnly className="gpd-readonly" />
          </div>
          <div className="gpd-field">
            <span>Entry Date</span>
            <input type="text" value={formatDateTime(row?.createdAt)} readOnly className="gpd-readonly" />
          </div>

          <button type="button" className="table-search-btn" onClick={handleRunOcr} disabled={ocrRunning || photos.length === 0} style={{ marginBottom: 8 }}>
            {ocrRunning ? 'Reading document…' : '🔍 Run OCR'}
          </button>

          {banner && <div className={`gpd-ocr-banner ${banner.cls}`}>{banner.text}</div>}

          <div className="gpd-field">
            <span>Invoice No.</span>
            <input type="text" value={invoice.invoiceNo} onChange={(e) => set('invoiceNo', e.target.value)} />
          </div>
          <div className="gpd-field">
            <span>Invoice Date</span>
            <input type="date" value={invoice.invoiceDate} onChange={(e) => set('invoiceDate', e.target.value)} />
          </div>
          <div className="gpd-field">
            <span>Vendor Name</span>
            <input type="text" value={invoice.vendorName} onChange={(e) => set('vendorName', e.target.value)} placeholder="OCR doesn't read this reliably - enter manually" />
          </div>
          <div className="gpd-field">
            <span>Amount</span>
            <input type="number" value={invoice.amount} onChange={(e) => set('amount', e.target.value)} />
          </div>

          {formError && <p className="login-field" style={{ color: 'var(--crit)' }}>{formError}</p>}

          <button type="submit" className="gpd-save" disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'SAVE'}
          </button>
        </form>
      </div>

      {lightbox && activePhoto && (
        <div className="gpd-lightbox" onClick={() => setLightbox(false)}>
          <div className="gpd-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={activePhoto.url} alt={`Document ${activeIdx + 1} full size`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </div>
          <button className="gpd-lightbox-close" onClick={() => setLightbox(false)} aria-label="Close">✕</button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllGatePasses } from '../../lib/api';
import { MobileCardSkeleton, TableSkeleton } from '../../components/LoadingState';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AllEntries() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchAllGatePasses());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!fromDate && !toDate) return rows;
    return rows.filter((row) => {
      const created = row.createdAt.slice(0, 10); // "YYYY-MM-DD"
      if (fromDate && created < fromDate) return false;
      if (toDate && created > toDate) return false;
      return true;
    });
  }, [rows, fromDate, toDate]);

  function openDetail(row) {
    navigate(`/gatepass/detail/${row.gatePassId}`, { state: row });
  }

  return (
    <div className="table-page">
      <div className="table-toolbar">
        <label>
          <span>From Date</span>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label>
          <span>To Date</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
        <button type="button" className="table-search-btn" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="page-banner page-banner-error">{error}</p>}

      {loading && (
        <>
          <TableSkeleton columns={6} rows={6} />
          <MobileCardSkeleton cards={3} />
        </>
      )}

      {!loading && !error && (
        <>
          <div className="table-wrap table-desktop">
            <table className="data-table gp-entries-table">
              <thead>
                <tr>
                  <th className="col-sno">S. No.</th>
                  <th className="col-gp">Gate Pass No.</th>
                  <th className="col-docs">No. of Documents</th>
                  <th className="col-date">Entry Date</th>
                  <th className="col-guard">Guard Name</th>
                  <th className="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="table-empty">No gate passes yet.</td></tr>
                )}
                {filtered.map((row, i) => (
                  <tr key={row.gatePassId}>
                    <td className="col-sno">{i + 1}</td>
                    <td className="mono col-gp">{row.gatePassNo}</td>
                    <td className="col-docs">{row.photoCount}</td>
                    <td className="col-date">{formatDate(row.createdAt)}</td>
                    <td className="col-guard">{row.guardName}</td>
                    <td className="col-action">
                      <button type="button" className="table-action-btn" onClick={() => openDetail(row)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-card-list">
            {filtered.length === 0 && (
              <p className="table-empty">No gate passes yet.</p>
            )}
            {filtered.map((row, i) => (
              <article className="mobile-card" key={row.gatePassId}>
                <div className="mobile-card-top">
                  <span className="mobile-card-index">#{i + 1}</span>
                  <span className="mono mobile-card-id">{row.gatePassNo}</span>
                </div>
                <dl className="mobile-card-meta">
                  <div><dt>Documents</dt><dd>{row.photoCount}</dd></div>
                  <div><dt>Entry</dt><dd>{formatDate(row.createdAt)}</dd></div>
                  <div><dt>Guard</dt><dd>{row.guardName}</dd></div>
                </dl>
                <button type="button" className="table-action-btn mobile-card-action" onClick={() => openDetail(row)}>
                  View
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

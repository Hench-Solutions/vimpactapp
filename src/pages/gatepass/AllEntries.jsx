import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllGatePasses } from '../../lib/api';

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

  const filtered = useMemo(() => {
    if (!fromDate && !toDate) return rows;
    return rows.filter((row) => {
      const created = row.createdAt.slice(0, 10); // "YYYY-MM-DD"
      if (fromDate && created < fromDate) return false;
      if (toDate && created > toDate) return false;
      return true;
    });
  }, [rows, fromDate, toDate]);

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
        <button type="button" className="table-search-btn" onClick={load}>Refresh</button>
      </div>

      {loading && <p className="tag-modal-sub">Loading…</p>}
      {error && <p className="tag-modal-sub" style={{ color: 'var(--crit)' }}>{error}</p>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Gate Pass No.</th>
                <th>No. of Documents</th>
                <th>Entry Date</th>
                <th>Guard Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="tag-modal-sub" style={{ padding: 20 }}>No gate passes yet.</td></tr>
              )}
              {filtered.map((row, i) => (
                <tr key={row.gatePassId}>
                  <td>{i + 1}</td>
                  <td className="mono">{row.gatePassNo}</td>
                  <td className="num">{row.photoCount}</td>
                  <td>{formatDate(row.createdAt)}</td>
                  <td>{row.guardName}</td>
                  <td>
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => navigate(`/gatepass/detail/${row.gatePassId}`, { state: row })}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

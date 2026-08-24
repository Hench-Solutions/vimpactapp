import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GATE_PASS_ROWS } from '../../lib/gatePassData';

export default function AllEntries() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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
        <button type="button" className="table-search-btn">Search</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Gate Pass No.</th>
              <th>No. of Documents</th>
              <th>Entry Date</th>
              <th>Guard Name</th>
              <th>Inv No.</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {GATE_PASS_ROWS.map((row, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td className="mono">{row.gatePassNo}</td>
                <td className="num">{row.docs}</td>
                <td>{row.entryDate}</td>
                <td>{row.guard}</td>
                <td>{row.invNo}</td>
                <td>
                  <button
                    type="button"
                    className="table-action-btn"
                    onClick={() => navigate(`/gatepass/detail/${row.gatePassNo}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

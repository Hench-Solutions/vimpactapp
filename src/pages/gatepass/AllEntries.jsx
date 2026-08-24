import { useState } from 'react';

// Dummy data only, per instruction - wired to the real GatePass list API
// (GET /v1/GatePass/list, already live for the guard PWA) once this page
// is signed off. Guard Name / Inv No. aren't on that response yet - both
// are easy additions (Guard Name via a join to MstUser, Inv No. once
// OCR/reconciliation exists) when this page goes live for real.
const DUMMY_ROWS = [
  { gatePassNo: '240826001', docs: 3, entryDate: '24-Aug-2026', guard: 'Ramesh', invNo: 'VIJ/903/2026-27' },
  { gatePassNo: '240826002', docs: 1, entryDate: '24-Aug-2026', guard: 'Ramesh', invNo: '473' },
  { gatePassNo: '240826003', docs: 2, entryDate: '23-Aug-2026', guard: 'Suresh', invNo: '2026-27/303' },
  { gatePassNo: '240826004', docs: 1, entryDate: '23-Aug-2026', guard: 'Suresh', invNo: '917/26-27' },
  { gatePassNo: '240826005', docs: '', entryDate: '', guard: '', invNo: '' },
];

export default function AllEntries() {
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
            {DUMMY_ROWS.map((row, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td className="mono">{row.gatePassNo}</td>
                <td className="num">{row.docs}</td>
                <td>{row.entryDate}</td>
                <td>{row.guard}</td>
                <td>{row.invNo}</td>
                <td>
                  {row.gatePassNo && <button type="button" className="table-action-btn">View</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

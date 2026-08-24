import { useState } from 'react';

// Dummy data only, per instruction - wired to the real GatePass list API
// (GET /v1/GatePass/list, already live for the guard PWA) once this page
// is signed off.
const DUMMY_ROWS = [
  { gatePassNo: '240826001', invoiceNo: 'VIJ/903/2026-27', invoiceDate: '24-Aug-2026', invoiceAmt: '7,820.00', vendor: 'Flipkart India Pvt. Ltd.' },
  { gatePassNo: '240826002', invoiceNo: '473', invoiceDate: '24-Aug-2026', invoiceAmt: '44,202.00', vendor: 'Srinivasa Pet Bottles' },
  { gatePassNo: '240826003', invoiceNo: '2026-27/303', invoiceDate: '23-Aug-2026', invoiceAmt: '27,584.00', vendor: 'Liberty Packages' },
  { gatePassNo: '240826004', invoiceNo: '917/26-27', invoiceDate: '23-Aug-2026', invoiceAmt: '84,960.00', vendor: 'Hi Tech Plastics' },
  { gatePassNo: '240826005', invoiceNo: '', invoiceDate: '', invoiceAmt: '', vendor: '' },
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
              <th>Invoice No.</th>
              <th>Invoice Date</th>
              <th>Invoice Amt</th>
              <th>Vendor Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_ROWS.map((row, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td className="mono">{row.gatePassNo}</td>
                <td>{row.invoiceNo}</td>
                <td>{row.invoiceDate}</td>
                <td className="num">{row.invoiceAmt}</td>
                <td>{row.vendor}</td>
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

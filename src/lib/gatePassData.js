// Shared dummy data for the Gate Pass demo pages (All Entries + Detail).
// invNo/invoiceDate/invoiceName/amount present = "OCR succeeded" for that
// entry in the Detail page's simulation; empty = "OCR failed", so the
// demo can show both the auto-filled and the manual-entry path.
export const GATE_PASS_ROWS = [
  {
    gatePassNo: '240826001', docs: 3, entryDate: '24-Aug-2026', guard: 'Ramesh',
    invNo: 'VIJ/903/2026-27', invoiceDate: '2026-08-24', invoiceName: 'Flipkart India Pvt. Ltd.', amount: '7820.00',
  },
  {
    gatePassNo: '240826002', docs: 1, entryDate: '24-Aug-2026', guard: 'Ramesh',
    invNo: '473', invoiceDate: '2026-08-22', invoiceName: 'Srinivasa Pet Bottles', amount: '44202.00',
  },
  {
    gatePassNo: '240826003', docs: 2, entryDate: '23-Aug-2026', guard: 'Suresh',
    invNo: '', invoiceDate: '', invoiceName: '', amount: '', // OCR failed on this one
  },
  {
    gatePassNo: '240826004', docs: 1, entryDate: '23-Aug-2026', guard: 'Suresh',
    invNo: '917/26-27', invoiceDate: '2026-08-21', invoiceName: 'Hi Tech Plastics', amount: '84960.00',
  },
];

export function getGatePassRow(gatePassNo) {
  return GATE_PASS_ROWS.find((r) => r.gatePassNo === gatePassNo);
}

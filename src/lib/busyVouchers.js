// Dummy stand-in for GET /v1/Reconciliation/search-vouchers (doesn't exist
// yet). Real version queries TrnPurchaseVoucher by fuzzy Vendor Name +
// Invoice/Bill No, per the matching design already agreed:
// primary = Vendor + Bill No, confirm = Date (+/- a couple days) + Amount.
const BUSY_VOUCHERS = [
  { billNo: 'VIJ/903/2026-27', vendor: 'Flipkart India Pvt. Ltd. (Chennai)', date: '24-Aug-2026', amount: '7820.00' },
  { billNo: 'VIJ/903/2026-27', vendor: 'Flipkart India Pvt. Ltd. (Gurgaon)', date: '23-Aug-2026', amount: '7820.00' },
  { billNo: '473', vendor: 'Srinivasa Pet Bottles - S. Pally', date: '22-Aug-2026', amount: '44202.00' },
  { billNo: '917/26-27', vendor: 'Hi Tech Plastics', date: '21-Aug-2026', amount: '84960.00' },
];

// Demo-only fuzzy match: same Bill No always shown (so the "two vendors,
// one bill no" ambiguity from the screenshot is visible), plus anything
// whose vendor name loosely contains the typed name.
export function searchBusyVouchers({ vendor, invNo }) {
  const v = (vendor || '').toLowerCase();
  return BUSY_VOUCHERS.filter((row) => {
    const billMatch = invNo && row.billNo.toLowerCase() === invNo.toLowerCase();
    const vendorMatch = v && row.vendor.toLowerCase().includes(v.split(' ')[0].toLowerCase());
    return billMatch || vendorMatch;
  });
}

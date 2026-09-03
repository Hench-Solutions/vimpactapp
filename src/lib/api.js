// Everything that talks to the real middleware (VimpactCareApi) lives
// behind this one module, same convention as guard-pwa/src/lib/api.js.
// The Users endpoints don't require a token yet - this stage is
// capture-and-view only, no login/JWT wiring for vimpactapp itself.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5035';

async function unwrap(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message = data?.errorObj?.[0]?.errorMessage || 'Something went wrong. Please try again.';
    throw new Error(message);
  }
  return data.responseObj;
}

async function postJson(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  return unwrap(res);
}

export async function fetchUserList() {
  let res;
  try {
    res = await fetch(`${API_BASE}/v1/User/list`);
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  if (res.status === 204) return [];
  return unwrap(res);
}

export async function addUser(fields) {
  // fields: { Name, Mobile, Role, GateName?, Designation? }
  return postJson('/v1/User', { Mode: 'Add', ...fields });
}

export async function updateUser(userId, fields) {
  return postJson('/v1/User', { Mode: 'Update', UserId: userId, ...fields });
}

export async function loginUser(username, password) {
  // -> { userId, name, role, email, gateName, designation }
  return postJson('/v1/User', { Mode: 'Login', Username: username, Password: password });
}

// Server photo paths come back as "/gatepass/{no}/{file}" (relative to
// wwwroot) - same convention as guard-pwa's resolvePhotoUrl.
export function resolvePhotoUrl(relativePath) {
  return relativePath ? `${API_BASE}${relativePath}` : null;
}

export async function fetchAllGatePasses() {
  let res;
  try {
    res = await fetch(`${API_BASE}/v1/GatePass/all`);
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  if (res.status === 204) return [];
  return unwrap(res);
}

export async function fetchGatePassPhotos(gatePassId) {
  let res;
  try {
    res = await fetch(`${API_BASE}/v1/GatePass/${gatePassId}/photos`);
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  if (res.status === 204) return [];
  const photos = await unwrap(res);
  return photos.map((p) => ({ photoId: p.photoId, url: resolvePhotoUrl(p.url) }));
}

export async function runGatePassOcr(gatePassId) {
  // -> { gatePassId, invoiceNo, invoiceDate, vendorName, amount, ocrStatus }
  return postJson('/v1/GatePass/ocr', { GatePassId: gatePassId });
}

export async function saveGatePassInvoice(gatePassId, fields) {
  // fields: { InvoiceNo?, InvoiceDate?, VendorName?, Amount? }
  return postJson('/v1/GatePass/invoice', { GatePassId: gatePassId, ...fields });
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function unwrap(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message =
      data?.errorObj?.[0]?.errorMessage ||
      "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return data.responseObj;
}

async function postJson(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Cannot reach the server. Check your connection and try again.",
    );
  }
  return unwrap(res);
}

export async function fetchUserList() {
  let res;
  try {
    res = await fetch(`${API_BASE}/v1/User/list`);
  } catch {
    throw new Error(
      "Cannot reach the server. Check your connection and try again.",
    );
  }
  if (res.status === 204) return [];
  return unwrap(res);
}

export async function addUser(fields) {
  return postJson("/v1/User", { Mode: "Add", ...fields });
}

export async function updateUser(userId, fields) {
  return postJson("/v1/User", { Mode: "Update", UserId: userId, ...fields });
}

/** Activate / deactivate a user. actingUserId lets the API refuse self-deactivation. */
export async function setUserActive(userId, isActive, actingUserId) {
  return postJson("/v1/User", {
    Mode: "SetActive",
    UserId: userId,
    IsActive: isActive,
    ActingUserId: actingUserId ?? null,
  });
}

export async function loginUser(username, password) {
  return postJson("/v1/User", {
    Mode: "Login",
    Username: username,
    Password: password,
  });
}

/** Server paths are "/gatepass/{no}/{file}"; absolute URLs pass through. */
export function resolvePhotoUrl(relativePath) {
  if (!relativePath) return null;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  const base = API_BASE.replace(/\/+$/, "");
  const pathPart =
    relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${base}${pathPart}`;
}

export async function fetchAllGatePasses() {
  let res;
  try {
    res = await fetch(`${API_BASE}/v1/GatePass/all`);
  } catch {
    throw new Error(
      "Cannot reach the server. Check your connection and try again.",
    );
  }
  if (res.status === 204) return [];
  return unwrap(res);
}

export async function fetchGatePassPhotos(gatePassId) {
  let res;
  try {
    res = await fetch(`${API_BASE}/v1/GatePass/${gatePassId}/photos`);
  } catch {
    throw new Error(
      "Cannot reach the server. Check your connection and try again.",
    );
  }
  if (res.status === 204) return [];
  const photos = await unwrap(res);
  return photos.map((p) => ({
    photoId: p.photoId,
    url: resolvePhotoUrl(p.url),
  }));
}

export async function runGatePassOcr(gatePassId) {
  return postJson("/v1/GatePass/ocr", { GatePassId: gatePassId });
}

export async function saveGatePassInvoice(gatePassId, fields) {
  return postJson("/v1/GatePass/invoice", {
    GatePassId: gatePassId,
    ...fields,
  });
}

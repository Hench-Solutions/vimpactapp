// UI-only stand-in - Login.jsx does not call any API yet. Once the real
// Auth endpoint exists this becomes the same shape session.js already
// uses in guard-pwa (token from the server instead of a picked role).

const SESSION_KEY = 'vimpactapp:session';

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function startSession({ username, role }) {
  const session = { username, role, loggedInAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn() {
  return !!getSession();
}

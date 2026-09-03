// Session shape now comes from the real /v1/User Login response instead of
// the picked-role stand-in - see lib/api.js loginUser().

const SESSION_KEY = 'vimpactapp:session';

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function startSession(user) {
  const session = { ...user, loggedInAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn() {
  return !!getSession();
}

const SESSION_KEY = "vimpactapp:session";

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function startSession(user) {
  // Login returns `name`; keep `username` alias for older UI paths.
  const session = {
    ...user,
    username: user.username || user.name,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn() {
  return !!getSession();
}

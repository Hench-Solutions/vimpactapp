import { getSession } from '../../lib/session';

// Placeholder landing page - proves the shell (Sidebar + TopNav +
// content area) works. Real dashboard content comes once this UI is
// signed off and DB/API wiring starts.
export default function Dashboard() {
  const session = getSession();
  return (
    <div className="placeholder-page">
      <h2>Welcome, {session?.username}</h2>
      <p>You're signed in as <strong>{session?.role}</strong>. This is a placeholder - the sidebar on the left already reflects what this role would see.</p>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { getSession } from '../../lib/session';

const SHORTCUTS = [
  {
    to: '/gatepass/all',
    label: 'All Entries',
    hint: 'Browse and open gate passes',
  },
  {
    to: '/gatepass/review',
    label: 'Review Queue',
    hint: 'Coming next — OCR & sign-off',
    soon: true,
  },
  {
    to: '/users',
    label: 'Users',
    hint: 'Admin · manage staff & guards',
    adminOnly: true,
  },
];

export default function Dashboard() {
  const session = getSession();
  const isAdmin = session?.role === 'Admin';
  const items = SHORTCUTS.filter((s) => !s.adminOnly || isAdmin);

  return (
    <div className="dash-page">
      <header className="dash-hero">
        <p className="dash-eyebrow">Workspace</p>
        <h2>Welcome, {session?.name || session?.username}</h2>
        <p className="dash-sub">
          Signed in as <strong>{session?.role}</strong>. Use the sidebar or jump into a module
          below — the shell already mirrors what this role can open.
        </p>
      </header>

      <div className="dash-grid">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className={`dash-card ${item.soon ? 'soon' : ''}`}>
            <span className="dash-card-label">
              {item.label}
              {item.soon && <em>Soon</em>}
            </span>
            <span className="dash-card-hint">{item.hint}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

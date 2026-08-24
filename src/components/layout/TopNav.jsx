import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../../lib/session';

const BREADCRUMB = {
  '/dashboard': 'Dashboard',
  '/gatepass/review': 'Gate Pass · Review Queue',
  '/gatepass/all': 'Gate Pass · All Entries',
  '/users': 'User Management · Users',
  '/users/roles': 'User Management · Roles & Pages',
  '/reports/mis': 'Reports · MIS',
};

export default function TopNav({ collapsed, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <header className={`topnav ${collapsed ? 'collapsed' : ''}`}>
      <button className="topnav-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        ☰
      </button>

      <div className="topnav-crumb">
        <span>Home</span> / <strong>{BREADCRUMB[location.pathname] || 'Vimpact App'}</strong>
      </div>

      <div className="topnav-right">
        <button className="topnav-icon" aria-label="Notifications">
          🔔<span className="topnav-badge">3</span>
        </button>

        <div className="topnav-user" ref={ref} onClick={() => setOpen((o) => !o)}>
          <div className="topnav-avatar">{(session?.username || '?').charAt(0).toUpperCase()}</div>
          <span className="topnav-name">{session?.username || 'User'}</span>
          <span className="topnav-role-chip">{session?.role}</span>

          {open && (
            <div className="topnav-dropdown">
              <button onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

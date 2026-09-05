import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../../lib/session';
import DesignToggle from '../DesignToggle';

const BREADCRUMB = {
  '/dashboard': 'Dashboard',
  '/gatepass/review': 'Gate Pass · Review Queue',
  '/gatepass/all': 'Gate Pass · All Entries',
  '/users': 'User Management · Users',
  '/users/roles': 'User Management · Roles & Pages',
  '/reports/mis': 'Reports · MIS',
};

function displayName(session) {
  // Login API returns `name`; older mocks used `username`.
  return session?.name || session?.username || '';
}

export default function TopNav({ collapsed, onToggle, isMobile, mobileOpen }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const crumb = BREADCRUMB[location.pathname] || 'Vimpact App';
  const name = displayName(session);
  const initial = (name || 'U').charAt(0).toUpperCase();

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
      <button
        type="button"
        className="topnav-toggle"
        onClick={onToggle}
        aria-label={isMobile ? (mobileOpen ? 'Close menu' : 'Open menu') : 'Toggle sidebar'}
        aria-expanded={isMobile ? mobileOpen : !collapsed}
      >
        ☰
      </button>

      <div className="topnav-crumb">
        {!isMobile && <span>Home / </span>}
        <strong>{isMobile ? crumb.split(' · ').pop() : crumb}</strong>
      </div>

      <div className="topnav-right">
        <DesignToggle compact />
        <span className="topnav-sep" aria-hidden="true" />
        <button type="button" className="topnav-icon" aria-label="Notifications">
          🔔<span className="topnav-badge">3</span>
        </button>

        <div
          className={`topnav-user ${open ? 'open' : ''}`}
          ref={ref}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen((o) => !o);
            }
          }}
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={name ? `Account menu for ${name}` : 'Account menu'}
        >
          <div className="topnav-avatar" aria-hidden="true">{initial}</div>
          <span className="topnav-name">{name || 'User'}</span>
          {session?.role && <span className="topnav-role-chip">{session.role}</span>}
          <span className="topnav-caret" aria-hidden="true">▾</span>

          {open && (
            <div className="topnav-dropdown" role="menu">
              <button type="button" role="menuitem" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

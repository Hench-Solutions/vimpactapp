import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../../lib/session';
import { getMenuForRole } from '../../lib/mockData';
import logo from '../../assets/vimpact-logo.png';

export default function Sidebar({ collapsed }) {
  const [openSection, setOpenSection] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const menu = getMenuForRole(session?.role);

  useEffect(() => {
    for (const section of menu) {
      const active = section.items.some((i) => i.pageUrl && location.pathname.startsWith(i.pageUrl));
      if (active) {
        setOpenSection(section.pageId);
        return;
      }
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  function handleSectionClick(section) {
    const direct = section.items.length === 0 && section.pageUrl;
    if (direct) navigate(section.pageUrl);
    else setOpenSection((prev) => (prev === section.pageId ? null : section.pageId));
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <img src={logo} alt="Vimpact Care" className="sidebar-logo" />
        {!collapsed && <span className="sidebar-brand-text">Vimpact App</span>}
      </div>

      <nav className="sidebar-nav">
        {menu.map((section) => {
          const isDirect = section.items.length === 0 && !!section.pageUrl;
          const isOpen = openSection === section.pageId;
          const isDirectActive = isDirect && location.pathname.startsWith(section.pageUrl);

          return (
            <div className="sidebar-section" key={section.pageId}>
              <div
                className={`sidebar-title ${isOpen || isDirectActive ? 'open' : ''}`}
                onClick={() => handleSectionClick(section)}
              >
                <span>{section.section}</span>
                {!isDirect && <i className={`chev ${isOpen ? 'rot' : ''}`}>›</i>}
              </div>

              {!isDirect && (
                <div className={`sidebar-body ${isOpen ? 'open' : ''}`}>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.pageId}
                      to={item.pageUrl}
                      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <span className="dot" />
                      <span className="sidebar-link-text">{item.pageTitle}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <span>⎋</span>
        {!collapsed && <span className="sidebar-link-text">Log out</span>}
      </button>
    </aside>
  );
}

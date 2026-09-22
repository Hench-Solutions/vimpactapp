import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../../lib/session';
import { getMenuForRole } from '../../lib/menus';
import logo from '../../assets/vimpact-logo.png';
import { LogoutIcon } from '../Icons';

function pathMatches(pathname, target) {
  if (!target) return false;
  if (pathname === target) return true;
  // Prefix match only on path segment boundary (/users ≠ /usersX).
  return pathname.startsWith(`${target}/`);
}

export default function Sidebar({ collapsed, mobileOpen, onNavigate }) {
  const [openSection, setOpenSection] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const menu = getMenuForRole(session?.role);

  useEffect(() => {
    for (const section of menu) {
      if (section.items.length === 0 && section.pageUrl) {
        if (pathMatches(location.pathname, section.pageUrl)) {
          // oxlint-disable-next-line react/set-state-in-effect
          setOpenSection(section.pageId);
          return;
        }
      }
      const active = section.items.some(
        (i) => i.pageUrl && pathMatches(location.pathname, i.pageUrl),
      );
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
    if (direct) {
      navigate(section.pageUrl);
      onNavigate?.();
    } else {
      setOpenSection((prev) => (prev === section.pageId ? null : section.pageId));
    }
  }

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      aria-label="Main navigation"
    >
      <div className="sidebar-brand">
        <img src={logo} alt="Vimpact Care" className="sidebar-logo" />
        {!collapsed && <span className="sidebar-brand-text">Vimpact App</span>}
      </div>

      <nav className="sidebar-nav">
        {menu.map((section) => {
          const isDirect = section.items.length === 0 && !!section.pageUrl;
          const isOpen = openSection === section.pageId;
          const isDirectActive = isDirect && pathMatches(location.pathname, section.pageUrl);
          const hasActiveChild = section.items.some(
            (i) => i.pageUrl && pathMatches(location.pathname, i.pageUrl),
          );

          return (
            <div className="sidebar-section" key={section.pageId}>
              <div
                className={`sidebar-title ${isOpen || isDirectActive || hasActiveChild ? 'open' : ''} ${isDirectActive ? 'active' : ''} ${hasActiveChild ? 'child-active' : ''}`}
                onClick={() => handleSectionClick(section)}
                role="button"
                tabIndex={0}
                title={collapsed ? section.section : undefined}
                aria-current={isDirectActive ? 'page' : undefined}
                aria-expanded={!isDirect ? isOpen : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSectionClick(section);
                  }
                }}
              >
                <span className="sidebar-title-label">{section.section}</span>
                {!isDirect && <i className={`chev ${isOpen ? 'rot' : ''}`}>›</i>}
              </div>

              {!isDirect && (
                <div
                  className={`sidebar-body ${isOpen ? 'open' : ''}`}
                  hidden={!isOpen}
                  inert={!isOpen ? true : undefined}
                >
                  {section.items.map((item) => (
                    <NavLink
                      key={item.pageId}
                      to={item.pageUrl}
                      end
                      title={collapsed ? item.pageTitle : undefined}
                      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={() => onNavigate?.()}
                      tabIndex={isOpen ? undefined : -1}
                    >
                      <span className="dot" aria-hidden="true" />
                      <span className="sidebar-link-text">{item.pageTitle}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        <LogoutIcon size={16} />
        {!collapsed && <span className="sidebar-link-text">Log out</span>}
      </button>
    </aside>
  );
}

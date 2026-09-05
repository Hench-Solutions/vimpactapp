import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { isLoggedIn } from '../../lib/session';

const MOBILE_BP = 860;
const MOBILE_MQ = `(max-width: ${MOBILE_BP}px)`;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    return () => {
      mql.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  return isMobile;
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  // Close drawer on route change (mobile nav).
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  function handleToggle() {
    if (isMobile) setMobileOpen((o) => !o);
    else setCollapsed((c) => !c);
  }

  return (
    <div className={`app-wrapper ${mobileOpen ? 'nav-open' : ''}`}>
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar
        collapsed={!isMobile && collapsed}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />
      <div className={`main-content ${!isMobile && collapsed ? 'collapsed' : ''}`}>
        <TopNav
          collapsed={!isMobile && collapsed}
          onToggle={handleToggle}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

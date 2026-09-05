import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { isLoggedIn } from '../../lib/session';

const MOBILE_BP = 860;

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BP : false,
  );
  const location = useLocation();

  useEffect(() => {
    function onResize() {
      const mobile = window.innerWidth <= MOBILE_BP;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
        <TopNav collapsed={!isMobile && collapsed} onToggle={handleToggle} isMobile={isMobile} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

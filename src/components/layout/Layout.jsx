import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { isLoggedIn } from '../../lib/session';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  return (
    <div className="app-wrapper">
      <Sidebar collapsed={collapsed} />
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <TopNav collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

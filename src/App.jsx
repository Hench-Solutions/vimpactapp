import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import AllEntries from './pages/gatepass/AllEntries';
import GatePassDetail from './pages/gatepass/Detail';
import Users from './pages/users/Users';
import ComingSoon from './pages/ComingSoon';
import { isLoggedIn } from './lib/session';
import './App.css';

// Lazy: pulls in the Excel reader (xlsx), which only this page needs.
const LabelPrinting = lazy(() => import('./pages/dispatch/LabelPrinting'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gatepass/review" element={<ComingSoon />} />
          <Route path="/gatepass/all" element={<AllEntries />} />
          <Route path="/gatepass/detail/:gatePassId" element={<GatePassDetail />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/roles" element={<ComingSoon />} />
          <Route path="/dispatch/labels" element={<Suspense fallback={null}><LabelPrinting /></Suspense>} />
          <Route path="/reports/mis" element={<ComingSoon />} />
        </Route>
        <Route path="*" element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

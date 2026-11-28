import { lazy, Suspense } from "react";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout";
import { homeForRole } from "./lib/menus";
import { getSession, isLoggedIn } from "./lib/session";
import Login from "./pages/auth/Login";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/dashboard/Dashboard";
import AllEntries from "./pages/gatepass/AllEntries";
import GatePassDetail from "./pages/gatepass/Detail";
import Users from "./pages/users/Users";

import "./App.css";

// Lazy: pulls in the Excel reader (xlsx), which only this page needs.
const LabelPrinting = lazy(() => import("./pages/dispatch/LabelPrinting"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gatepass/review" element={<ComingSoon />} />
          <Route path="/gatepass/all" element={<AllEntries />} />
          <Route
            path="/gatepass/detail/:gatePassId"
            element={<GatePassDetail />}
          />
          <Route path="/users" element={<Users />} />
          <Route path="/users/roles" element={<ComingSoon />} />
          <Route
            path="/dispatch/labels"
            element={
              <Suspense fallback={null}>
                <LabelPrinting />
              </Suspense>
            }
          />
          <Route path="/reports/mis" element={<ComingSoon />} />
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to={isLoggedIn() ? homeForRole(getSession()?.role) : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

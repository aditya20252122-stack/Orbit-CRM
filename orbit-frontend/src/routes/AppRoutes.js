import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/Auth/LoginPage";
import SignupPage from "../pages/Auth/SignupPage";

import DashboardPage from "../pages/Dashboard/DashboardPage";
import LeadsPage from "../pages/Leads/LeadsPage";

// ✅ NEW PAGES
import AgentsPage from "../pages/Agents/AgentsPage";
import ContactsPage from "../pages/Contacts/ContactsPage";
import ManagerPage from "../pages/Manager/ManagerPage";
import ReportsPage from "../pages/Reports/ReportsPage";

// A wrapper component for routes that require authentication and role permissions
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole") || "ADMIN";

  if (!token) {
    return <Navigate to="/loginpage" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/leads" replace />;
  }

  return children;
};

// A wrapper component for routes that should only be accessible when not logged in
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole") || "ADMIN";
  
  if (token) {
    const defaultRoute = userRole === "ADMIN" ? "/dashboard" : "/leads";
    return <Navigate to={defaultRoute} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>

      {/* DEFAULT ROUTE */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* AUTH */}
      <Route
        path="/loginpage"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signuppage"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* PROTECTED ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leads"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
            <LeadsPage />
          </ProtectedRoute>
        }
      />

      {/* ✅ NEW ROUTES */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ManagerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agents"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <AgentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contacts"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ContactsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/loginpage" />} />

    </Routes>
  );
}

export default AppRoutes;
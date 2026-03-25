import React, { useState, useEffect, Suspense } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";

// Loading System
import { LoadingProvider, AppLoader } from "./components/loading";

// Employee Auth & Dashboard
import EmployeeRegister from "./pages/auth/EmployeeRegister.jsx";
import EmployeeLogin from "./pages/auth/EmployeeLogin.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx"; // ✅ existing
import ResetPassword from "./pages/auth/ResetPassword.jsx";   // ✅ existing
import EmployeeDashboard from "./pages/dashboard/Employee/EmployeeDashboard.jsx";

// Admin Auth & Dashboard
import AdminLogin from "./pages/auth/AdminLogin.jsx";
import AdminDashboard from "./pages/dashboard/Admin/AdminDashboard.jsx";
import AdminPolicy from "./pages/dashboard/Admin/AdminPolicy.jsx";

// Agent Auth & Dashboard
import AgentRegister from "./pages/auth/AgentRegister.jsx";
import AgentLogin from "./pages/auth/AgentLogin.jsx";
import AgentDashboard from "./pages/dashboard/Agent/AgentDashboard.jsx";

// HR Auth & Dashboard
import HrLogin from "./pages/auth/HRLogin.jsx";
import HrDashboard from "./pages/dashboard/Hr/HRDashboard.jsx";

// 🔒 PrivateRoute wrapper for authenticated routes
function PrivateRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;
  if (role && userRole?.toLowerCase() !== role.toLowerCase()) return <Navigate to="/" replace />;

  return children;
}

// 🚀 App Initialization Loader
function AppInitializer({ children }) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  useEffect(() => {
    let isMounted = true;

    // Failsafe for mobile browsers: never block UI indefinitely during boot.
    const failSafeTimer = setTimeout(() => {
      if (isMounted) {
        setIsAppReady(true);
      }
    }, 2500);

    const initApp = async () => {
      try {
        setLoadingMessage("Checking authentication...");

        // Small delay for smooth UX (prevents flash)
        await new Promise(resolve => setTimeout(resolve, 400));

        setLoadingMessage("Loading application...");
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error("App initialization failed:", error);
      } finally {
        if (isMounted) {
          setIsAppReady(true);
        }
      }
    };

    initApp();

    return () => {
      isMounted = false;
      clearTimeout(failSafeTimer);
    };
  }, []);

  return (
    <>
      <AppLoader 
        isVisible={!isAppReady} 
        message={loadingMessage}
        brandName="InsurAI"
      />
      {isAppReady && children}
    </>
  );
}

function App() {
  return (
    <LoadingProvider>
      <Router>
        <AppInitializer>
          <Routes>
        {/* Homepage */}
        <Route path="/" element={<Homepage />} />

        {/* Employee Routes */}
        <Route path="/employee/register" element={<EmployeeRegister />} />
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/forgot-password" element={<ForgotPassword />} /> {/* ✅ */}
        <Route path="/employee/reset-password/:token" element={<ResetPassword />} /> {/* ✅ */}
        <Route
          path="/employee/dashboard"
          element={
            <PrivateRoute role="employee">
              <EmployeeDashboard />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/policy"
          element={
            <PrivateRoute role="admin">
              <AdminPolicy />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/register-agent"
          element={
            <PrivateRoute role="admin">
              <AgentRegister onBack={() => window.history.back()} />
            </PrivateRoute>
          }
        />

        {/* Agent Routes */}
        <Route path="/agent/login" element={<AgentLogin />} />
        <Route
          path="/agent/dashboard"
          element={
            <PrivateRoute role="agent">
              <AgentDashboard />
            </PrivateRoute>
          }
        />

        {/* HR Routes */}
        <Route path="/hr/login" element={<HrLogin />} />
        <Route
          path="/hr/dashboard"
          element={
            <PrivateRoute role="hr">
              <HrDashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
        </AppInitializer>
      </Router>
    </LoadingProvider>
  );
}

export default App;

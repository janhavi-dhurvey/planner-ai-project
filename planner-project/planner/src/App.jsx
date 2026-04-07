import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar"; // Ensure path is correct

/* =========================================
LAZY LOAD PAGES
========================================= */

const Home = lazy(() => import("./pages/home/Home"));
const Chatbot = lazy(() => import("./pages/chatbot/Chatbot"));
const Goals = lazy(() => import("./pages/goals/Goals"));
const Calendar = lazy(() => import("./pages/calendar/Calendar"));

const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));

/* =========================================
AUTH CHECK
========================================= */

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/* =========================================
PROTECTED ROUTE
========================================= */

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

/* =========================================
PUBLIC ROUTE
========================================= */

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

/* =========================================
LOADING SCREEN
========================================= */

const LoadingScreen = () => (
  <div
    style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "18px",
      fontWeight: "600",
      fontFamily: "Inter, sans-serif"
    }}
  >
    Loading AI Planner...
  </div>
);

/* =========================================
NAVBAR WRAPPER
========================================= */

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div style={{ paddingTop: hideNavbar ? "0" : "80px", minHeight: "100vh" }}>
        {children}
      </div>
    </>
  );
};

/* =========================================
APP
========================================= */

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Layout>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route
              path="/login"
              element={<PublicRoute><Login /></PublicRoute>}
            />

            <Route
              path="/signup"
              element={<PublicRoute><Signup /></PublicRoute>}
            />

            {/* PROTECTED ROUTES */}
            <Route
              path="/"
              element={<ProtectedRoute><Home /></ProtectedRoute>}
            />

            <Route
              path="/chatbot"
              element={<ProtectedRoute><Chatbot /></ProtectedRoute>}
            />

            <Route
              path="/goals"
              element={<ProtectedRoute><Goals /></ProtectedRoute>}
            />

            <Route
              path="/calendar"
              element={<ProtectedRoute><Calendar /></ProtectedRoute>}
            />

            {/* DEFAULT */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
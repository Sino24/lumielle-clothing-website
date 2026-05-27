// src/components/UserProtectedRoute.tsx

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserProtectedRoute: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", minHeight: "60vh",
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.78rem", letterSpacing: "0.1em", color: "#7A746C", gap: "1rem",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{
          width: 24, height: 24, borderRadius: "50%", display: "inline-block",
          border: "2px solid rgba(26,23,20,0.12)", borderTopColor: "#C9A96E",
          animation: "spin 0.8s linear infinite",
        }} />
        Loading…
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default UserProtectedRoute;
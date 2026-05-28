// src/components/UserProtectedRoute.tsx

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Inline skeleton that mirrors the AccountPage layout ──
const AuthLoadingSkeleton: React.FC = () => (
  <>
    <style>{`
      @keyframes acc-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .aps-sk {
        background: linear-gradient(
          90deg,
          rgba(26,23,20,0.06) 25%,
          rgba(26,23,20,0.11) 50%,
          rgba(26,23,20,0.06) 75%
        );
        background-size: 200% 100%;
        animation: acc-shimmer 1.4s ease infinite;
        border-radius: 2px;
      }
      .aps-sk-light {
        background: linear-gradient(
          90deg,
          rgba(255,255,255,0.08) 25%,
          rgba(255,255,255,0.15) 50%,
          rgba(255,255,255,0.08) 75%
        );
        background-size: 200% 100%;
        animation: acc-shimmer 1.4s ease infinite;
        border-radius: 2px;
      }
    `}</style>

    <div style={{ paddingTop: "var(--nav-height, 76px)", minHeight: "100vh", background: "#F8F5F0" }}>

      {/* Hero strip */}
      <div style={{
        width: "100%", minHeight: 130, background: "#1A1714",
        display: "flex", alignItems: "center",
        gap: "1.5rem", padding: "2rem max(2rem, 5vw)", boxSizing: "border-box",
      }}>
        <div className="aps-sk-light" style={{ width: 68, height: 68, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
          <div className="aps-sk-light" style={{ height: 26, width: "min(220px, 55%)" }} />
          <div className="aps-sk-light" style={{ height: 13, width: "min(320px, 80%)", opacity: 0.6 }} />
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        width: "100%", background: "#fff",
        borderBottom: "1px solid rgba(26,23,20,0.10)",
        display: "flex", gap: "0.5rem",
        padding: "0.75rem max(2rem, 5vw)", boxSizing: "border-box",
      }}>
        {[130, 110, 110, 100].map((w, i) => (
          <div key={i} className="aps-sk" style={{ height: 36, width: w, flexShrink: 0 }} />
        ))}
      </div>

      {/* Content blocks */}
      <div style={{
        maxWidth: 1400, margin: "0 auto",
        padding: "2.5rem max(2rem, 5vw) 5rem", boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: "1rem",
      }}>
        <div className="aps-sk" style={{ height: 160 }} />
        <div className="aps-sk" style={{ height: 90 }} />
        <div className="aps-sk" style={{ height: 90 }} />
      </div>
    </div>
  </>
);

const UserProtectedRoute: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingSkeleton />;

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default UserProtectedRoute;
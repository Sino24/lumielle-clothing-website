// src/pages/Admin/AdminDashboard.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/AdminStyle/adminDashbord.css";
import { AdminSkeleton } from "../components/AdminSkeleton";

interface Product {
  _id: string;
  name: string;
  price: string;
  img: string;
  images: string[];
  category: string;
  colors: { label: string; hex: string }[];
}

interface AdminInfo {
  name: string;
  email: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [products,      setProducts]      = useState<Product[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [adminLoading,  setAdminLoading]  = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [adminInfo,     setAdminInfo]     = useState<AdminInfo | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // ── Fetch admin profile ────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { setAdminLoading(false); return; }

    fetch(`${API_BASE}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) {
          setAdminInfo({
            name:  data.name,
            email: data.email || "",
            role:  data.role  || "admin",
          });
        }
      })
      .catch(() => {})
      .finally(() => setAdminLoading(false));
  }, [API_BASE]);

  // ── Fetch products ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [API_BASE]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const totalProducts = products.length;
  const categories    = Array.from(new Set(products.map((p) => p.category)));
  const avgPrice      =
    products.length === 0
      ? 0
      : Math.round(
          products.reduce(
            (sum, p) => sum + (parseFloat(p.price.replace(/[^0-9.]/g, "")) || 0),
            0
          ) / products.length
        );

  const recent = [...products].slice(0, 5);

  const navItems = [
    { path: "/admin",                 label: "Dashboard",       icon: "🏠", desc: "Overview & stats" },
    { path: "/admin/products",        label: "Products",        icon: "👕", desc: `${totalProducts} items in store` },
    { path: "/admin/lookbook",        label: "Lookbook",        icon: "🖼️", desc: "Manage editorial images" },
    { path: "/admin/about",           label: "About",           icon: "ℹ️", desc: "Edit about page content" },
    { path: "/admin/contact",         label: "Messages",        icon: "📬", desc: "View contact messages" },
    { path: "/admin/hero",            label: "Hero",            icon: "🎬", desc: "Manage hero section" },
    { path: "/admin/client-projects", label: "Client Projects", icon: "💼", desc: "Manage client project listings" },
    { path: "/admin/users",           label: "Users",           icon: "👤", desc: "View & manage registered users" },
    { path: "/admin/orders",          label: "Orders",          icon: "📦", desc: "View & manage orders" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Generate up-to-2-letter monogram from full name
  const initials =
    adminInfo?.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") ?? "A";

  return (
    <div className="adm-page">
      <div className="adm-content">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="adm-page-hd">

          {/* LEFT — title + subtitle + profile card */}
          <div className="adm-page-hd-left">
            <h1 className="adm-page-title">Admin Dashboard</h1>
            <p className="adm-page-sub">Manage your clothing store</p>

            {/* Profile identity block */}
            <div className="adm-identity">
              {adminLoading ? (

                /* ── Skeleton while loading ── */
                <div className="adm-identity-skeleton">
                  <div className="adm-sk adm-sk-avatar-lg" />
                  <div className="adm-identity-sk-lines">
                    <div className="adm-sk adm-sk-id-name"  />
                    <div className="adm-sk adm-sk-id-email" />
                    <div className="adm-sk adm-sk-id-role"  />
                  </div>
                </div>

              ) : adminInfo ? (

                /*
                 * ── Live profile card ──
                 *
                 * DOM order matters for the layout:
                 *  1. .adm-profile-bar   — gold bar (align-self:stretch, no padding)
                 *  2. .adm-profile-inner — flex row: avatar | info column
                 *  3. .adm-profile-online — absolute dot, top-right of card
                 *
                 * All padding lives on .adm-profile-inner so the bar stays flush
                 * to the card's left edge.
                 */
                <div className="adm-profile">

                  {/* 1. Gold left-edge bar */}
                  <div className="adm-profile-bar" />

                  {/* 2. Content row: avatar + info side-by-side */}
                  <div className="adm-profile-inner">

                    {/* Monogram avatar circle */}
                    <div className="adm-profile-avatar" aria-hidden="true">
                      {initials}
                    </div>

                    {/* Text column: name / email / role */}
                    <div className="adm-profile-info">
                      <span className="adm-profile-name">{adminInfo.name}</span>
                      {adminInfo.email && (
                        <span className="adm-profile-email">{adminInfo.email}</span>
                      )}
                      <span className="adm-profile-role">{adminInfo.role}</span>
                    </div>

                  </div>

                  {/* 3. Online dot — positioned absolute inside card */}
                  <span className="adm-profile-online" title="Active" />

                </div>

              ) : null}
            </div>
          </div>

          {/* RIGHT — action buttons */}
          <div className="adm-page-hd-right">
            <button
              className="adm-btn gold"
              onClick={() => navigate("/admin/products")}
            >
              + Add Product
            </button>

            <button
              className="adm-btn logout"
              onClick={() => setConfirmLogout(true)}
            >
              <svg
                width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* ── Navigation ─────────────────────────────────────────────────────── */}
        <nav className="adm-nav-links" aria-label="Admin navigation">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`adm-nav-btn${isActive(item.path) ? " active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="adm-nav-btn-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        {loading ? (
          <AdminSkeleton variant="dashboard" />
        ) : error ? (
          <div className="adm-error">
            <div className="adm-error-icon">⚠️</div>
            <div className="adm-error-title">Could not connect</div>
            <div className="adm-error-msg">{error}</div>
            <button className="adm-btn gold" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="adm-stats">
              <div className="adm-stat">
                <span className="adm-stat-emoji">👕</span>
                <div className="adm-stat-num">{totalProducts}</div>
                <div className="adm-stat-label">Total Products</div>
              </div>
              <div className="adm-stat">
                <span className="adm-stat-emoji">🗂️</span>
                <div className="adm-stat-num">{categories.length}</div>
                <div className="adm-stat-label">Categories</div>
              </div>
              <div className="adm-stat">
                <span className="adm-stat-emoji">💰</span>
                <div className="adm-stat-num">₹{avgPrice.toLocaleString()}</div>
                <div className="adm-stat-label">Avg Price</div>
              </div>
              <div className="adm-stat">
                <span className="adm-stat-emoji">🖼️</span>
                <div className="adm-stat-num">
                  {products.reduce((s, p) => s + 1 + (p.images?.length || 0), 0)}
                </div>
                <div className="adm-stat-label">Total Images</div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="adm-section-label">Manage</div>
            <div className="adm-links">
              {navItems
                .filter((item) => item.path !== "/admin")
                .map((item) => (
                  <button
                    className="adm-link-card"
                    key={item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="adm-link-icon">{item.icon}</span>
                    <div>
                      <div className="adm-link-title">{item.label}</div>
                      <div className="adm-link-desc">{item.desc}</div>
                    </div>
                    <span className="adm-link-arrow">›</span>
                  </button>
                ))}
            </div>

            {/* Recent Products */}
            <div className="adm-section-label" style={{ marginTop: "2.5rem" }}>
              Recent Products
            </div>
            <div className="adm-recent">
              {recent.length === 0 ? (
                <div className="adm-empty">
                  No products yet.{" "}
                  <button
                    className="adm-empty-link"
                    onClick={() => navigate("/admin/products")}
                  >
                    Add one →
                  </button>
                </div>
              ) : (
                recent.map((p) => (
                  <div
                    className="adm-recent-row"
                    key={p._id}
                    onClick={() => navigate("/admin/products")}
                  >
                    <div className="adm-recent-thumb">
                      {p.img ? <img src={p.img} alt={p.name} /> : "👕"}
                    </div>
                    <div className="adm-recent-meta">
                      <div className="adm-recent-name">{p.name}</div>
                      <div className="adm-recent-cat">{p.category}</div>
                    </div>
                    <div className="adm-recent-price">{p.price}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Logout Confirm Modal ────────────────────────────────────────────── */}
      {confirmLogout && (
        <>
          <div
            className="adm-logout-backdrop"
            onClick={() => setConfirmLogout(false)}
          />
          <div className="adm-logout-modal">
            <div className="adm-logout-modal-ico">
              <svg
                width="28" height="28" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <div className="adm-logout-modal-title">Log out?</div>
            <div className="adm-logout-modal-msg">
              You'll need to sign in again to access the admin panel.
            </div>
            <div className="adm-logout-modal-actions">
              <button
                className="adm-logout-cancel"
                onClick={() => setConfirmLogout(false)}
              >
                Cancel
              </button>
              <button className="adm-logout-confirm" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
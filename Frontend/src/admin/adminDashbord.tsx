// src/pages/Admin/AdminDashboard.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/AdminStyle/adminDashbord.css";

interface Product {
  _id: string;
  name: string;
  price: string;
  img: string;
  images: string[];
  category: string;
  colors: { label: string; hex: string }[];
}

const AdminDashboard: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

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

  const totalProducts = products.length;
  const categories    = Array.from(new Set(products.map((p) => p.category)));
  const avgPrice      =
    products.length === 0
      ? 0
      : Math.round(
          products.reduce(
            (sum, p) =>
              sum + (parseFloat(p.price.replace(/[^0-9.]/g, "")) || 0),
            0
          ) / products.length
        );

  const recent = [...products].slice(0, 5);

  // Nav items — used for both the top nav bar and quick-link cards
  const navItems = [
    {
      path:   "/admin",
      label:  "Dashboard",
      icon:   "🏠",
      desc:   "Overview & stats",
    },
    {
      path:   "/admin/products",
      label:  "Products",
      icon:   "👕",
      desc:   `${totalProducts} items in store`,
    },
    {
      path:   "/admin/lookbook",
      label:  "Lookbook",
      icon:   "🖼️",
      desc:   "Manage editorial images",
    },
    {
      path:   "/admin/about",
      label:  "About",
      icon:   "ℹ️",
      desc:   "Edit about page content",
    },
    {
      path:   "/admin/contact",
      label:  "Messages",
      icon:   "📬",
      desc:   "View contact messages",
    },
    {
      path:   "/admin/hero",
      label:  "Hero",
      icon:   "🎬",
      desc:   "Manage hero section",
    },
    {
      path:   "/admin/client-projects",
      label:  "Client Projects",
      icon:   "💼",
      desc:   "Manage client project listings",
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="adm-page">
      <div className="adm-content">

        {/* ── Header ── */}
        <div className="adm-page-hd">
          <div>
            <h1 className="adm-page-title">Admin Dashboard</h1>
            <p className="adm-page-sub">Manage your clothing store</p>
          </div>
          <button
            className="adm-btn gold"
            onClick={() => navigate("/admin/products")}
          >
            + Add Product
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="adm-nav-links" aria-label="Admin navigation">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`adm-nav-btn ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="adm-nav-btn-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* ── Body ── */}
        {loading ? (
          <div className="adm-loading">
            <div className="adm-spin" />
            <span>Loading store data…</span>
          </div>
        ) : error ? (
          <div className="adm-error">
            <div className="adm-error-icon">⚠️</div>
            <div className="adm-error-title">Could not connect</div>
            <div className="adm-error-msg">{error}</div>
            <button
              className="adm-btn gold"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* ── Stats ── */}
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
                  {products.reduce(
                    (s, p) => s + 1 + (p.images?.length || 0),
                    0
                  )}
                </div>
                <div className="adm-stat-label">Total Images</div>
              </div>
            </div>

            {/* ── Quick Links ── */}
            <div className="adm-section-label">Manage</div>

            <div className="adm-links">
              {navItems
                .filter((item) => item.path !== "/admin") // exclude Dashboard itself
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

            {/* ── Recent Products ── */}
            <div className="adm-section-label" style={{ marginTop: "2.5rem" }}>
              Recent Products
            </div>

            <div className="adm-recent">
              {recent.length === 0 ? (
                <div className="adm-empty">
                  No products yet.
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
                      {p.img ? (
                        <img src={p.img} alt={p.name} />
                      ) : (
                        "👕"
                      )}
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
    </div>
  );
};

export default AdminDashboard;
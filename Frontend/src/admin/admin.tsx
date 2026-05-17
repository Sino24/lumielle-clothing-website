
// src/pages/Admin/AdminDashboard.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminStyle/admin.css";

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
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";

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

  const categories = Array.from(
    new Set(products.map((p) => p.category))
  );

  const avgPrice =
    products.length === 0
      ? 0
      : Math.round(
          products.reduce(
            (sum, p) =>
              sum +
              (parseFloat(
                p.price.replace(/[^0-9.]/g, "")
              ) || 0),
            0
          ) / products.length
        );

  const recent = [...products].slice(0, 5);

  return (
    <div className="adm-page">

      <div className="adm-content">

        {/* HEADER */}
        <div className="adm-page-hd">

          <div>
            <h1 className="adm-page-title">
              Admin Dashboard
            </h1>

            <p className="adm-page-sub">
              Manage your clothing store
            </p>
          </div>

          <button
            className="adm-btn gold"
            onClick={() => navigate("/admin/products")}
          >
            + Add Product
          </button>

        </div>


        {/* NAVIGATION */}
        <div className="adm-nav-links">

          <button
            className="adm-nav-btn active"
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </button>

          <button
            className="adm-nav-btn"
            onClick={() => navigate("/admin/products")}
          >
            Manage Products
          </button>

          <button className="adm-nav-btn">
            Orders
          </button>

          <button className="adm-nav-btn">
            Customers
          </button>

          <button className="adm-nav-btn"
             onClick={() => navigate("/admin/content")}
         
            >
                 Manage Content
          </button>

        </div>


        {loading ? (

          <div className="adm-loading">
            <div className="adm-spin" />
            <span>Loading store data…</span>
          </div>

        ) : error ? (

          <div className="adm-error">

            <div className="adm-error-icon">
              ⚠️
            </div>

            <div className="adm-error-title">
              Could not connect
            </div>

            <div className="adm-error-msg">
              {error}
            </div>

            <button
              className="adm-btn gold"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>

          </div>

        ) : (

          <>
            {/* STATS */}
            <div className="adm-stats">

              <div className="adm-stat">
                <span className="adm-stat-emoji">👕</span>

                <div className="adm-stat-num">
                  {totalProducts}
                </div>

                <div className="adm-stat-label">
                  Total Products
                </div>
              </div>

              <div className="adm-stat">
                <span className="adm-stat-emoji">🗂️</span>

                <div className="adm-stat-num">
                  {categories.length}
                </div>

                <div className="adm-stat-label">
                  Categories
                </div>
              </div>

              <div className="adm-stat">
                <span className="adm-stat-emoji">💰</span>

                <div className="adm-stat-num">
                  ₹{avgPrice.toLocaleString()}
                </div>

                <div className="adm-stat-label">
                  Avg Price
                </div>
              </div>

              <div className="adm-stat">
                <span className="adm-stat-emoji">🖼️</span>

                <div className="adm-stat-num">
                  {
                    products.reduce(
                      (s, p) =>
                        s +
                        1 +
                        (p.images?.length || 0),
                      0
                    )
                  }
                </div>

                <div className="adm-stat-label">
                  Total Images
                </div>
              </div>

            </div>


            {/* QUICK LINKS */}
            <div className="adm-section-label">
              Manage
            </div>

            <div className="adm-links">

              {[
                {
                  icon: "👕",
                  label: "Products",
                  desc: `${totalProducts} items in store`,
                  action: () =>
                    navigate("/admin/products"),
                },

                {
                  icon: "📦",
                  label: "Orders",
                  desc: "View & manage orders",
                  action: () => {},
                },

                {
                  icon: "👤",
                  label: "Customers",
                  desc: "Customer accounts",
                  action: () => {},
                },

                {
                  icon: "⚙️",
                  label: "Settings",
                  desc: "Store configuration",
                  action: () => {},
                },

              ].map((l) => (

                <button
                  className="adm-link-card"
                  key={l.label}
                  onClick={l.action}
                >

                  <span className="adm-link-icon">
                    {l.icon}
                  </span>

                  <div>

                    <div className="adm-link-title">
                      {l.label}
                    </div>

                    <div className="adm-link-desc">
                      {l.desc}
                    </div>

                  </div>

                  <span className="adm-link-arrow">
                    ›
                  </span>

                </button>

              ))}

            </div>


            {/* RECENT */}
            <div
              className="adm-section-label"
              style={{ marginTop: "2.5rem" }}
            >
              Recent Products
            </div>

            <div className="adm-recent">

              {recent.length === 0 ? (

                <div className="adm-empty">

                  No products yet.

                  <button
                    className="adm-empty-link"
                    onClick={() =>
                      navigate("/admin/products")
                    }
                  >
                    Add one →
                  </button>

                </div>

              ) : (

                recent.map((p) => (

                  <div
                    className="adm-recent-row"
                    key={p._id}
                    onClick={() =>
                      navigate("/admin/products")
                    }
                  >

                    <div className="adm-recent-thumb">

                      {p.img ? (
                        <img
                          src={p.img}
                          alt={p.name}
                        />
                      ) : (
                        "👕"
                      )}

                    </div>

                    <div className="adm-recent-meta">

                      <div className="adm-recent-name">
                        {p.name}
                      </div>

                      <div className="adm-recent-cat">
                        {p.category}
                      </div>

                    </div>

                    <div className="adm-recent-price">
                      {p.price}
                    </div>

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

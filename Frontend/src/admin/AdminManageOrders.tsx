// src/pages/Admin/AdminManageOrders.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/AdminStyle/AdminManageOrders.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
  "Content-Type": "application/json",
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  productId: string;
  name: string;
  price: string;
  img: string;
  size: string;
  quantity: number;
}

interface OrderAddress {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  address?: OrderAddress;
  createdAt: string;
}

type ToastType = "success" | "error" | "info";
interface Toast { id: number; msg: string; type: ToastType; }

type SortField = "createdAt" | "total" | "status";
type SortDir   = "asc" | "desc";
type StatusFilter = "all" | Order["status"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: "Pending",   color: "#9a6e1a", bg: "rgba(201,169,110,0.13)", border: "rgba(201,169,110,0.4)" },
  confirmed: { label: "Confirmed", color: "#2c6b4f", bg: "rgba(44,107,79,0.10)",  border: "rgba(44,107,79,0.35)"  },
  shipped:   { label: "Shipped",   color: "#1d5a8a", bg: "rgba(29,90,138,0.10)",  border: "rgba(29,90,138,0.35)"  },
  delivered: { label: "Delivered", color: "#1a5c35", bg: "rgba(26,92,53,0.10)",   border: "rgba(26,92,53,0.35)"   },
  cancelled: { label: "Cancelled", color: "#9a2020", bg: "rgba(154,32,32,0.10)",  border: "rgba(154,32,32,0.35)"  },
};

const ALL_STATUSES: Order["status"][] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconSort = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/>
  </svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconTruck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconUser = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconPackage = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
  </svg>
);
const IconEdit = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
const AdminManageOrders: React.FC = () => {
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [expandedId,    setExpandedId]    = useState<string | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<string | null>(null);
  const [editTarget,    setEditTarget]    = useState<Order | null>(null);
  const [editStatus,    setEditStatus]    = useState<Order["status"]>("pending");
  const [updating,      setUpdating]      = useState(false);
  const [toasts,        setToasts]        = useState<Toast[]>([]);
  const [search,        setSearch]        = useState("");
  const [sortField,     setSortField]     = useState<SortField>("createdAt");
  const [sortDir,       setSortDir]       = useState<SortDir>("desc");
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("all");
  const toastId = useRef(0);

  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/cart/admin/orders`, { headers: getAuthHeader() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Update status ──────────────────────────────────────────────────────────
  const updateStatus = async () => {
    if (!editTarget) return;
    setUpdating(true);
    try {
      const r = await fetch(`${API_BASE}/api/cart/admin/orders/${editTarget._id}`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({ status: editStatus }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setOrders((prev) =>
        prev.map((o) => o._id === editTarget._id ? { ...o, status: editStatus } : o)
      );
      showToast("Order status updated", "success");
      setEditTarget(null);
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

// ── Delete ─────────────────────────────────────────────────────────────────
const deleteOrder = async (id: string) => {
  try {
    const r = await fetch(`${API_BASE}/api/cart/admin/orders/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    const data = await r.json().catch(() => null);

    console.log("DELETE STATUS:", r.status);
    console.log("DELETE RESPONSE:", data);

    // Already deleted
    if (r.status === 404) {
      setOrders((prev) => prev.filter((o) => o._id !== id));
      showToast("Order already deleted", "info");
      setDeleteTarget(null);
      return;
    }

    if (!r.ok) {
      throw new Error(data?.message || `HTTP ${r.status}`);
    }

    // Remove from UI
    setOrders((prev) => prev.filter((o) => o._id !== id));

    showToast("Order deleted", "success");
  } catch (err) {
    console.error("DELETE ERROR:", err);
    showToast("Failed to delete order", "error");
  } finally {
    setDeleteTarget(null);
  }
};
  // ── Sort toggle ────────────────────────────────────────────────────────────
  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  // ── Derived list ───────────────────────────────────────────────────────────
  const filtered = orders
    .filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        o._id.toLowerCase().includes(q) ||
        (o.userName || "").toLowerCase().includes(q) ||
        (o.userEmail || "").toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q));
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortField === "createdAt") {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortDir === "asc" ? diff : -diff;
      }
      if (sortField === "total") {
        return sortDir === "asc" ? a.total - b.total : b.total - a.total;
      }
      return sortDir === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalRevenue   = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const pendingCount   = orders.filter(o => o.status === "pending").length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const thisMonth      = orders.filter((o) => {
    const d = new Date(o.createdAt), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const parsePrice = (str: string) =>
    parseInt(str.replace(/[₹,\s]/g, ""), 10) || 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="amo-page">
      <div className="amo-content">

        {/* PAGE HEADER */}
        <div className="amo-page-hd">
          <div>
            <h1 className="amo-page-title">Orders</h1>
            <p className="amo-page-sub">
              {loading ? "Loading…" : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button className="amo-btn ghost" onClick={fetchOrders} type="button">🔄 Refresh</button>
        </div>

        {/* STATS */}
        {!loading && orders.length > 0 && (
          <div className="amo-stats">
            <div className="amo-stat">
              <div className="amo-stat-num">{orders.length}</div>
              <div className="amo-stat-label">Total Orders</div>
            </div>
            <div className="amo-stat">
              <div className="amo-stat-num amo-stat-num--gold">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </div>
              <div className="amo-stat-label">Revenue</div>
            </div>
            <div className="amo-stat">
              <div className="amo-stat-num amo-stat-num--warn">{pendingCount}</div>
              <div className="amo-stat-label">Pending</div>
            </div>
            <div className="amo-stat">
              <div className="amo-stat-num amo-stat-num--success">{deliveredCount}</div>
              <div className="amo-stat-label">Delivered</div>
            </div>
            <div className="amo-stat">
              <div className="amo-stat-num">{thisMonth}</div>
              <div className="amo-stat-label">This Month</div>
            </div>
          </div>
        )}

        {/* STATUS FILTER TABS */}
        {!loading && orders.length > 0 && (
          <div className="amo-status-tabs">
            <button
              className={`amo-status-tab${statusFilter === "all" ? " active" : ""}`}
              onClick={() => setStatusFilter("all")}
              type="button"
            >
              All
              <span className="amo-status-tab-count">{orders.length}</span>
            </button>
            {ALL_STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const cnt = orders.filter((o) => o.status === s).length;
              return (
                <button
                  key={s}
                  className={`amo-status-tab${statusFilter === s ? " active" : ""}`}
                  onClick={() => setStatusFilter(s)}
                  style={statusFilter === s ? { borderColor: cfg.border, color: cfg.color } : {}}
                  type="button"
                >
                  {cfg.label}
                  <span className="amo-status-tab-count" style={statusFilter === s ? { background: cfg.bg, color: cfg.color } : {}}>
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* SEARCH + SORT TOOLBAR */}
        {!loading && orders.length > 0 && (
          <div className="amo-toolbar">
            <div className="amo-search-wrap">
              <span className="amo-search-icon"><IconSearch /></span>
              <input
                className="amo-search"
                type="text"
                placeholder="Search by order ID, customer, or product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="amo-search-clear" onClick={() => setSearch("")} type="button">✕</button>
              )}
            </div>
            <div className="amo-sort-pills">
              <span className="amo-sort-label"><IconSort /> Sort:</span>
              {([
                ["createdAt", "Date"],
                ["total",     "Amount"],
                ["status",    "Status"],
              ] as [SortField, string][]).map(([f, label]) => (
                <button
                  key={f}
                  className={`amo-sort-pill${sortField === f ? " active" : ""}`}
                  onClick={() => toggleSort(f)}
                  type="button"
                >
                  {label}
                  {sortField === f && (
                    <span className="amo-sort-arrow">{sortDir === "asc" ? " ↑" : " ↓"}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ORDER LIST */}
        {loading ? (
          <div className="amo-loading-state">
            <div className="amo-spin" />
            <div className="amo-load-text">Loading orders…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="amo-empty-state">
            <div className="amo-empty-icon">{search ? "🔍" : "📦"}</div>
            <div className="amo-empty-title">{search ? "No results found" : "No orders yet"}</div>
            <div className="amo-empty-desc">
              {search
                ? `No orders match "${search}"`
                : statusFilter !== "all"
                ? `No ${STATUS_CONFIG[statusFilter].label.toLowerCase()} orders.`
                : "Orders placed via WhatsApp will appear here."}
            </div>
          </div>
        ) : (
          <div className="amo-list">

            {/* TABLE HEADER */}
            <div className="amo-list-hd">
              <div className="amo-col-id">Order ID</div>
              <div className="amo-col-customer">Customer</div>
              <div className="amo-col-items">Items</div>
              <div className="amo-col-total">Total</div>
              <div className="amo-col-status">Status</div>
              <div className="amo-col-date">Date</div>
              <div className="amo-col-actions" />
            </div>

            {filtered.map((order, idx) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              return (
                <div
                  key={order._id}
                  className={`amo-order${expandedId === order._id ? " amo-order--open" : ""}`}
                  style={{ animationDelay: `${idx * 25}ms` }}
                >
                  {/* ROW */}
                  <div
                    className="amo-order-row"
                    onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  >
                    <div className="amo-col-id">
                      <span className="amo-order-id">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="amo-col-customer">
                      <span className="amo-customer-name">{order.userName || "Guest"}</span>
                      {order.userEmail && (
                        <span className="amo-customer-email">{order.userEmail}</span>
                      )}
                    </div>
                    <div className="amo-col-items">
                      <div className="amo-items-preview">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="amo-item-thumb" title={item.name}>
                            {item.img
                              ? <img src={item.img} alt={item.name} />
                              : <span>👕</span>}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="amo-item-thumb amo-item-thumb--more">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="amo-col-total">
                      <span className="amo-total-val">₹{order.total.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="amo-col-status">
                      <span
                        className="amo-status-pill"
                        style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <div className="amo-col-date amo-muted">{fmtDate(order.createdAt)}</div>
                    <div className="amo-col-actions">
                      <button
                        className="amo-btn gold sm"
                        title="Update status"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTarget(order);
                          setEditStatus(order.status);
                        }}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className="amo-btn danger sm"
                        title="Delete order"
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(order._id); }}
                      >
                        <IconTrash />
                      </button>
                      <span className="amo-chevron-wrap">
                        <IconChevron open={expandedId === order._id} />
                      </span>
                    </div>
                  </div>

                  {/* EXPANDED DETAIL PANEL */}
                  {expandedId === order._id && (
                    <div className="amo-detail">
                      <div className="amo-detail-grid">

                        {/* LEFT: Order meta */}
                        <div className="amo-detail-section">
                          <div className="amo-detail-section-title">Order Info</div>
                          <div className="amo-detail-rows">
                            <div className="amo-detail-row">
                              <span className="amo-detail-icon"><IconPackage /></span>
                              <span className="amo-detail-val">
                                Order <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                              </span>
                            </div>
                            {order.userName && (
                              <div className="amo-detail-row">
                                <span className="amo-detail-icon"><IconUser /></span>
                                <span className="amo-detail-val">{order.userName}</span>
                              </div>
                            )}
                            {order.userEmail && (
                              <div className="amo-detail-row">
                                <span className="amo-detail-icon">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                                  </svg>
                                </span>
                                <a className="amo-detail-val amo-link" href={`mailto:${order.userEmail}`}>
                                  {order.userEmail}
                                </a>
                              </div>
                            )}
                            <div className="amo-detail-row">
                              <span className="amo-detail-icon"><IconCalendar /></span>
                              <span className="amo-detail-val">{fmtDate(order.createdAt)}</span>
                            </div>
                          </div>

                          {/* Delivery Address */}
                          {order.address && (
                            <>
                              <div className="amo-detail-section-title" style={{ marginTop: "1.25rem" }}>
                                <IconMapPin /> Delivery Address
                              </div>
                              <div className="amo-addr-block">
                                <span className="amo-addr-label-tag">{order.address.label}</span>
                                <p className="amo-addr-text">
                                  {order.address.line1}
                                  {order.address.line2 ? `, ${order.address.line2}` : ""}
                                </p>
                                <p className="amo-addr-text">
                                  {order.address.city}, {order.address.state} — {order.address.pincode}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* RIGHT: Items */}
                        <div className="amo-detail-section">
                          <div className="amo-detail-section-title">
                            <IconTruck /> Items ({order.items.length})
                          </div>
                          <div className="amo-order-items">
                            {order.items.map((item, i) => (
                              <div key={i} className="amo-order-item">
                                <div className="amo-order-item-img">
                                  {item.img
                                    ? <img src={item.img} alt={item.name} />
                                    : <span>👕</span>}
                                </div>
                                <div className="amo-order-item-info">
                                  <p className="amo-order-item-name">{item.name}</p>
                                  <p className="amo-order-item-meta">
                                    Size: {item.size} · Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="amo-order-item-price">
                                  {item.price}
                                  {item.quantity > 1 && (
                                    <span className="amo-order-item-line">
                                      ₹{(parsePrice(item.price) * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="amo-order-total-row">
                            <span>Order Total</span>
                            <strong>₹{order.total.toLocaleString("en-IN")}</strong>
                          </div>
                        </div>

                      </div>

                      {/* Detail footer */}
                      <div className="amo-detail-footer">
                        <div className="amo-detail-status-row">
                          <span className="amo-detail-status-label">Current status:</span>
                          <span
                            className="amo-status-pill"
                            style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <div className="amo-detail-footer-actions">
                          <button
                            className="amo-btn gold sm"
                            type="button"
                            onClick={() => { setEditTarget(order); setEditStatus(order.status); }}
                          >
                            ✏ Update Status
                          </button>
                          <button
                            className="amo-btn danger sm"
                            type="button"
                            onClick={() => setDeleteTarget(order._id)}
                          >
                            Delete Order
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* RESULT COUNT */}
        {!loading && search && filtered.length > 0 && (
          <p className="amo-result-count">
            Showing {filtered.length} of {orders.length} orders
          </p>
        )}

      </div>

      {/* ── UPDATE STATUS MODAL ── */}
      <div className={`amo-overlay${editTarget ? " open" : ""}`}>
        <div className="amo-modal">
          <div className="amo-modal-body">
            <div className="amo-confirm-ico">📦</div>
            <div className="amo-confirm-title">Update Order Status</div>
            {editTarget && (
              <p className="amo-confirm-msg">
                Order <strong>#{editTarget._id.slice(-8).toUpperCase()}</strong>
              </p>
            )}
            <div className="amo-status-select-wrap">
              {ALL_STATUSES.map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    type="button"
                    className={`amo-status-option${editStatus === s ? " selected" : ""}`}
                    style={editStatus === s ? { background: cfg.bg, borderColor: cfg.border, color: cfg.color } : {}}
                    onClick={() => setEditStatus(s)}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="amo-modal-ft">
            <button className="amo-btn ghost" type="button" onClick={() => setEditTarget(null)}>
              Cancel
            </button>
            <button
              className="amo-btn gold"
              type="button"
              disabled={updating}
              onClick={updateStatus}
            >
              {updating ? "Saving…" : "Save Status"}
            </button>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      <div className={`amo-overlay${deleteTarget ? " open" : ""}`}>
        <div className="amo-modal">
          <div className="amo-modal-body">
            <div className="amo-confirm-ico">🗑️</div>
            <div className="amo-confirm-title">Delete this order?</div>
            <div className="amo-confirm-msg">
              This will permanently remove the order record. This cannot be undone.
            </div>
          </div>
          <div className="amo-modal-ft">
            <button className="amo-btn ghost" type="button" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button
              className="amo-btn danger"
              type="button"
              onClick={() => deleteTarget && deleteOrder(deleteTarget)}
            >
              Delete Order
            </button>
          </div>
        </div>
      </div>

      {/* ── TOASTS ── */}
      <div className="amo-toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`amo-toast ${t.type}`}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageOrders;
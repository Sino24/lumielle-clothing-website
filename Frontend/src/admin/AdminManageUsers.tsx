// src/pages/Admin/AdminManageUsers.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/AdminStyle/AdminManageUsers.css";
import { AdminSkeleton } from "../components/AdminSkeleton";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
  "Content-Type": "application/json",
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface Address {
  _id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  createdAt: string;
  role?: string;
}

type ToastType = "success" | "error" | "info";
interface Toast { id: number; msg: string; type: ToastType; }

type SortField = "name" | "email" | "createdAt";
type SortDir   = "asc" | "desc";

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
const IconMapPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconMail = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
  </svg>
);
const IconPhone = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.51 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.05 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconHome = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
const AdminManageUsers: React.FC = () => {
  const [users,        setUsers]        = useState<User[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toasts,       setToasts]       = useState<Toast[]>([]);
  const [search,       setSearch]       = useState("");
  const [sortField,    setSortField]    = useState<SortField>("createdAt");
  const [sortDir,      setSortDir]      = useState<SortDir>("desc");
  const toastId = useRef(0);

  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/auth/users`, { headers: getAuthHeader() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setUsers(await r.json());
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteUser = async (id: string) => {
    try {
      const r = await fetch(`${API_BASE}/api/auth/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setUsers((p) => p.filter((u) => u._id !== id));
      showToast("User deleted", "success");
    } catch {
      showToast("Failed to delete user", "error");
    }
    setDeleteTarget(null);
  };

  // ── Sort toggle ────────────────────────────────────────────────────────────
  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  // ── Derived list ───────────────────────────────────────────────────────────
  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || "").includes(q)
      );
    })
    .sort((a, b) => {
      let av = a[sortField] as string;
      let bv = b[sortField] as string;
      if (sortField === "createdAt") {
        av = new Date(av).getTime().toString();
        bv = new Date(bv).getTime().toString();
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const totalAddresses = users.reduce((n, u) => n + (u.addresses?.length ?? 0), 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="amu-page">
      <div className="amu-content">

        {/* PAGE HEADER */}
        <div className="amu-page-hd">
          <div>
            <h1 className="amu-page-title">Users</h1>
            <p className="amu-page-sub">
              {loading ? "Loading…" : `${users.length} registered account${users.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button className="amu-btn ghost" onClick={fetchUsers}>🔄 Refresh</button>
        </div>

        {/* STATS */}
        {!loading && users.length > 0 && (
          <div className="amu-stats">
            <div className="amu-stat">
              <div className="amu-stat-num">{users.length}</div>
              <div className="amu-stat-label">Total Users</div>
            </div>
            <div className="amu-stat">
              <div className="amu-stat-num">
                {users.filter((u) => {
                  const d = new Date(u.createdAt);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <div className="amu-stat-label">This Month</div>
            </div>
            <div className="amu-stat">
              <div className="amu-stat-num">{users.filter((u) => u.phone).length}</div>
              <div className="amu-stat-label">With Phone</div>
            </div>
            <div className="amu-stat">
              <div className="amu-stat-num">{totalAddresses}</div>
              <div className="amu-stat-label">Saved Addresses</div>
            </div>
          </div>
        )}

        {/* SEARCH + SORT BAR */}
        {!loading && users.length > 0 && (
          <div className="amu-toolbar">
            <div className="amu-search-wrap">
              <span className="amu-search-icon"><IconSearch /></span>
              <input
                className="amu-search"
                type="text"
                placeholder="Search by name, email or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="amu-search-clear" onClick={() => setSearch("")} type="button">✕</button>
              )}
            </div>
            <div className="amu-sort-pills">
              <span className="amu-sort-label"><IconSort /> Sort:</span>
              {(["name", "email", "createdAt"] as SortField[]).map((f) => (
                <button
                  key={f}
                  className={`amu-sort-pill${sortField === f ? " active" : ""}`}
                  onClick={() => toggleSort(f)}
                  type="button"
                >
                  {f === "createdAt" ? "Date Joined" : f.charAt(0).toUpperCase() + f.slice(1)}
                  {sortField === f && (
                    <span className="amu-sort-arrow">{sortDir === "asc" ? " ↑" : " ↓"}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* USER LIST */}
        {loading ? (
         <AdminSkeleton variant="users" />
        ) : filtered.length === 0 ? (
          <div className="amu-empty-state">
            <div className="amu-empty-icon">{search ? "🔍" : "👤"}</div>
            <div className="amu-empty-title">{search ? "No results found" : "No users yet"}</div>
            <div className="amu-empty-desc">
              {search ? `No users match "${search}"` : "Registered users will appear here."}
            </div>
          </div>
        ) : (
          <div className="amu-list">

            {/* TABLE HEADER */}
            <div className="amu-list-hd">
              <div className="amu-col-avatar" />
              <div className="amu-col-name">Name</div>
              <div className="amu-col-email">Email</div>
              <div className="amu-col-phone">Phone</div>
              <div className="amu-col-date">Joined</div>
              <div className="amu-col-addr">Addresses</div>
              <div className="amu-col-actions" />
            </div>

            {filtered.map((u, idx) => (
              <div
                key={u._id}
                className={`amu-user${expandedId === u._id ? " amu-user--open" : ""}`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {/* ROW */}
                <div
                  className="amu-user-row"
                  onClick={() => setExpandedId(expandedId === u._id ? null : u._id)}
                >
                  <div className="amu-col-avatar">
                    <div className="amu-avatar">
                      {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                  </div>
                  <div className="amu-col-name">
                    <span className="amu-user-name">{u.name}</span>
                    {u.role === "admin" && <span className="amu-role-badge">Admin</span>}
                  </div>
                  <div className="amu-col-email amu-muted">{u.email}</div>
                  <div className="amu-col-phone amu-muted">{u.phone || <span className="amu-nil">—</span>}</div>
                  <div className="amu-col-date amu-muted">{fmtDate(u.createdAt)}</div>
                  <div className="amu-col-addr">
                    {u.addresses?.length > 0
                      ? <span className="amu-addr-count">{u.addresses.length}</span>
                      : <span className="amu-nil">0</span>}
                  </div>
                  <div className="amu-col-actions">
                    <button
                      className="amu-btn danger sm"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(u._id); }}
                      title="Delete user"
                      type="button"
                    >
                      <IconTrash />
                    </button>
                    <span className="amu-chevron-wrap">
                      <IconChevron open={expandedId === u._id} />
                    </span>
                  </div>
                </div>

                {/* EXPANDED DETAIL PANEL */}
                {expandedId === u._id && (
                  <div className="amu-detail">

                    {/* INFO GRID */}
                    <div className="amu-detail-grid">
                      <div className="amu-detail-section">
                        <div className="amu-detail-section-title">Contact</div>
                        <div className="amu-detail-rows">
                          <div className="amu-detail-row">
                            <span className="amu-detail-icon"><IconMail /></span>
                            <a className="amu-detail-val amu-link" href={`mailto:${u.email}`}>{u.email}</a>
                          </div>
                          {u.phone && (
                            <div className="amu-detail-row">
                              <span className="amu-detail-icon"><IconPhone /></span>
                              <span className="amu-detail-val">{u.phone}</span>
                            </div>
                          )}
                          <div className="amu-detail-row">
                            <span className="amu-detail-icon"><IconCalendar /></span>
                            <span className="amu-detail-val">Joined {fmtDate(u.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* ADDRESSES */}
                      <div className="amu-detail-section amu-detail-section--addr">
                        <div className="amu-detail-section-title">
                          Saved Addresses
                          <span className="amu-addr-badge">{u.addresses?.length ?? 0}</span>
                        </div>
                        {(!u.addresses || u.addresses.length === 0) ? (
                          <p className="amu-no-addr">No addresses saved.</p>
                        ) : (
                          <div className="amu-addr-cards">
                            {u.addresses.map((addr) => (
                              <div key={addr._id} className={`amu-addr-card${addr.isDefault ? " amu-addr-card--default" : ""}`}>
                                <div className="amu-addr-card-top">
                                  <span className="amu-addr-label-icon">
                                    {addr.label === "Home" ? <IconHome /> : addr.label === "Office" ? <IconBriefcase /> : <IconMapPin />}
                                  </span>
                                  <span className="amu-addr-label">{addr.label}</span>
                                  {addr.isDefault && <span className="amu-default-badge">Default</span>}
                                </div>
                                <p className="amu-addr-line">
                                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                                </p>
                                <p className="amu-addr-line">
                                  {addr.city}, {addr.state} — {addr.pincode}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DETAIL FOOTER ACTIONS */}
                    <div className="amu-detail-footer">
                      <a className="amu-btn ghost sm" href={`mailto:${u.email}`}>✉ Send Email</a>
                      <button
                        className="amu-btn danger sm"
                        type="button"
                        onClick={() => setDeleteTarget(u._id)}
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* RESULT COUNT */}
        {!loading && search && filtered.length > 0 && (
          <p className="amu-result-count">
            Showing {filtered.length} of {users.length} users
          </p>
        )}

      </div>

      {/* DELETE CONFIRM MODAL */}
      <div className={`amu-overlay${deleteTarget ? " open" : ""}`}>
        <div className="amu-modal">
          <div className="amu-modal-body">
            <div className="amu-confirm-ico">👤</div>
            <div className="amu-confirm-title">Delete this user?</div>
            <div className="amu-confirm-msg">
              This will permanently remove the account and all associated data. This cannot be undone.
            </div>
          </div>
          <div className="amu-modal-ft">
            <button className="amu-btn ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="amu-btn danger" onClick={() => deleteTarget && deleteUser(deleteTarget)}>
              Delete User
            </button>
          </div>
        </div>
      </div>

      {/* TOASTS */}
      <div className="amu-toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`amu-toast ${t.type}`}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageUsers;
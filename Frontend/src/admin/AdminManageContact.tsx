// src/pages/Admin/AdminManageContact.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/AdminStyle/AdminManageContact.css";
import { AdminSkeleton } from "../components/AdminSkeleton";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
  "Content-Type": "application/json",
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface ContactMsg {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: string;
}

type ToastType = "success" | "error" | "info";
interface Toast { id: number; msg: string; type: ToastType; }

// ── Component ─────────────────────────────────────────────────────────────────
const AdminManageContact: React.FC = () => {
  const [contacts,    setContacts]    = useState<ContactMsg[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [deleteTarget,setDeleteTarget]= useState<string | null>(null);
  const [toasts,      setToasts]      = useState<Toast[]>([]);
  const toastId = useRef(0);

  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/contact`, { headers: getAuthHeader() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setContacts(await r.json());
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: ContactMsg["status"]) => {
    try {
      await fetch(`${API_BASE}/api/contact/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({ status }),
      });
      setContacts((p) => p.map((c) => c._id === id ? { ...c, status } : c));
      showToast("Status updated", "success");
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/contact/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      setContacts((p) => p.filter((c) => c._id !== id));
      showToast("Message deleted", "success");
    } catch {
      showToast("Failed to delete", "error");
    }
    setDeleteTarget(null);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const STATUS_LABEL: Record<ContactMsg["status"], string> = {
    unread: "Unread",
    read: "Read",
    replied: "Replied",
  };

  const unreadCount = contacts.filter((c) => c.status === "unread").length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    
    <div className="amc-page">
      <div className="amc-content">
      


        {/* PAGE HEADER */}
        <div className="amc-page-hd">
          <div>
            <h1 className="amc-page-title">Messages</h1>
            <p className="amc-page-sub">
              {unreadCount > 0
                ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                : "All messages read"}
            </p>
          </div>
          <button className="amc-btn ghost" onClick={fetchContacts}>🔄 Refresh</button>
        </div>

        {/* STATS ROW */}
        {!loading && contacts.length > 0 && (
          <div className="amc-stats">
            {(["unread", "read", "replied"] as ContactMsg["status"][]).map((s) => {
              const count = contacts.filter((c) => c.status === s).length;
              return (
                <div className="amc-stat" key={s}>
                  <div className="amc-stat-num">{count}</div>
                  <div className="amc-stat-label">{STATUS_LABEL[s]}</div>
                </div>
              );
            })}
            <div className="amc-stat">
              <div className="amc-stat-num">{contacts.length}</div>
              <div className="amc-stat-label">Total</div>
            </div>
          </div>
        )}

        {/* MESSAGE LIST */}
        {loading ? (
        <AdminSkeleton variant="contact" />
        ) : contacts.length === 0 ? (
          <div className="amc-empty-state">
            <div className="amc-empty-icon">✉️</div>
            <div className="amc-empty-title">No messages yet</div>
            <div className="amc-empty-desc">Messages from your contact form will appear here.</div>
          </div>
        ) : (
          <div className="amc-list">
            {contacts.map((c) => (
              <div key={c._id} className={`amc-msg${c.status === "unread" ? " amc-msg--unread" : ""}`}>

                {/* ROW HEADER */}
                <div className="amc-msg-head" onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}>
                  <div className="amc-msg-avatar">{c.name[0].toUpperCase()}</div>
                  <div className="amc-msg-meta">
                    <div className="amc-msg-name">{c.name}</div>
                    <div className="amc-msg-email">{c.email}</div>
                  </div>
                  <div className="amc-msg-preview">
                    {c.message.length > 80 ? c.message.slice(0, 80) + "…" : c.message}
                  </div>
                  <div className="amc-msg-right">
                    <span className="amc-msg-date">{fmtDate(c.createdAt)}</span>
                    <span className={`amc-status-pill amc-status-pill--${c.status}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                    <span className="amc-chevron">{expandedId === c._id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* EXPANDED BODY */}
                {expandedId === c._id && (
                  <div className="amc-msg-body">
                    <p className="amc-msg-text">{c.message}</p>
                    <div className="amc-msg-actions">
                      <select className="amc-select" value={c.status}
                        onChange={(e) => updateStatus(c._id, e.target.value as ContactMsg["status"])}>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>
                      <a className="amc-btn ghost sm" href={`mailto:${c.email}`}>Reply via Email</a>
                      <button className="amc-btn danger sm" onClick={() => setDeleteTarget(c._id)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE CONFIRM MODAL */}
      <div className={`amc-overlay${deleteTarget ? " open" : ""}`}>
        <div className="amc-modal">
          <div className="amc-modal-body">
            <div className="amc-confirm-ico">🗑️</div>
            <div className="amc-confirm-title">Delete this message?</div>
            <div className="amc-confirm-msg">This cannot be undone.</div>
          </div>
          <div className="amc-modal-ft">
            <button className="amc-btn ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="amc-btn danger" onClick={() => deleteTarget && deleteContact(deleteTarget)}>Delete</button>
          </div>
        </div>
      </div>

      {/* TOASTS */}
      <div className="amc-toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`amc-toast ${t.type}`}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageContact;
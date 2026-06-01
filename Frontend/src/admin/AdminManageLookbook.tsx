// src/pages/Admin/AdminManageLookbook.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/AdminStyle/AdminManageLookbook.css";
import { AdminSkeleton } from "../components/AdminSkeleton";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
  "Content-Type": "application/json",
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface LookEntry {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  isVisible: boolean;
}

const LOOK_BLANK: Omit<LookEntry, "_id"> = {
  title: "", subtitle: "", imageUrl: "", order: 0, isVisible: true,
};

type ToastType = "success" | "error" | "info";
interface Toast { id: number; msg: string; type: ToastType; }

// ── Component ─────────────────────────────────────────────────────────────────
const AdminManageLookbook: React.FC = () => {
  const [looks,        setLooks]        = useState<LookEntry[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editLook,     setEditLook]     = useState<LookEntry | null>(null);
  const [form,         setForm]         = useState<Omit<LookEntry, "_id">>({ ...LOOK_BLANK });
  const [saving,       setSaving]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toasts,       setToasts]       = useState<Toast[]>([]);
  const toastId = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLooks = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/lookbook/all`, { headers: getAuthHeader() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setLooks(await r.json());
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchLooks(); }, [fetchLooks]);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditLook(null);
    setForm({ ...LOOK_BLANK });
    setModalOpen(true);
  };

  const openEdit = (l: LookEntry) => {
    setEditLook(l);
    setForm({ title: l.title, subtitle: l.subtitle, imageUrl: l.imageUrl, order: l.order, isVisible: l.isVisible });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditLook(null); setForm({ ...LOOK_BLANK }); };

  // ── Save ───────────────────────────────────────────────────────────────────
  const saveLook = async () => {
    if (!form.imageUrl) { showToast("Image is required", "error"); return; }
    setSaving(true);
    try {
      const url    = editLook ? `${API_BASE}/api/lookbook/${editLook._id}` : `${API_BASE}/api/lookbook`;
      const method = editLook ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: getAuthHeader(), body: JSON.stringify(form) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      showToast(editLook ? "Look updated!" : "Look added!", "success");
      closeModal();
      fetchLooks();
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteLook = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/lookbook/${id}`, { method: "DELETE", headers: getAuthHeader() });
      setLooks((p) => p.filter((l) => l._id !== id));
      showToast("Look deleted", "success");
    } catch {
      showToast("Failed to delete", "error");
    }
    setDeleteTarget(null);
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  const uploadImage = async (file: File) => {
    setUploading(true);
    showToast("Uploading…", "info");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: fd });
      const d = await r.json();
      const url = d.imageUrl ?? d.url ?? d.secure_url ?? "";
      if (!url) throw new Error("No URL returned");
      setForm((p) => ({ ...p, imageUrl: url }));
      showToast("Image uploaded!", "success");
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) uploadImage(file);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="alb-page">
      <div className="alb-content">

        {/* PAGE HEADER */}
        <div className="alb-page-hd">
          <div>
            <h1 className="alb-page-title">Lookbook</h1>
            <p className="alb-page-sub">
              {looks.length} look{looks.length !== 1 ? "s" : ""} published
            </p>
          </div>
          <div className="alb-page-actions">
            <button className="alb-btn ghost" onClick={fetchLooks}>🔄 Refresh</button>
            <button className="alb-btn gold" onClick={openAdd}>+ Add Look</button>
          </div>
        </div>

        {/* GRID */}
        <div className="alb-grid">
          {loading ? (
    <AdminSkeleton variant="lookbook" />
          ) : looks.length === 0 ? (
            <div className="alb-empty-state">
              <div className="alb-empty-icon">🖼️</div>
              <div className="alb-empty-title">No looks yet</div>
              <div className="alb-empty-desc">Start by adding your first lookbook entry.</div>
              <button className="alb-btn gold" onClick={openAdd}>+ Add Look</button>
            </div>
          ) : (
            looks.map((l) => (
              <div key={l._id} className={`alb-card${!l.isVisible ? " alb-card--hidden" : ""}`}>

                <div className="alb-card-img-wrap">
                  {l.imageUrl
                    ? <img src={l.imageUrl} alt={l.title} />
                    : <div className="alb-img-placeholder">🖼</div>}
                  {!l.isVisible && <div className="alb-hidden-badge">Hidden</div>}
                  <div className="alb-card-overlay">
                    <button className="alb-ov-btn" onClick={() => openEdit(l)}>✏️</button>
                    <button className="alb-ov-btn del" onClick={() => setDeleteTarget(l._id)}>🗑️</button>
                  </div>
                </div>

                <div className="alb-card-body">
                  <div className="alb-card-order">#{l.order}</div>
                  <div className="alb-card-title">{l.title || "Untitled"}</div>
                  {l.subtitle && <div className="alb-card-sub">{l.subtitle}</div>}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      <div className={`alb-overlay${modalOpen ? " open" : ""}`} onClick={closeModal}>
        <div className="alb-modal" onClick={(e) => e.stopPropagation()}>
          <div className="alb-modal-hd">
            <div className="alb-modal-title">{editLook ? "Edit Look" : "Add Look"}</div>
            <button className="alb-modal-close" onClick={closeModal}>✕</button>
          </div>

          <div className="alb-modal-body">
            <div className="alb-form-grid">

              {/* Image URL + upload */}
              <div className="alb-form-group alb-form-full">
                <label className="alb-label">Image <span className="alb-req">*</span></label>
                <input className="alb-input" value={form.imageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="Paste image URL (https://…)"
                  disabled={uploading} />

                <div className={`alb-upload-box${uploading ? " uploading" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => !uploading && fileRef.current?.click()}>
                  <input ref={fileRef} type="file" accept="image/*" hidden disabled={uploading}
                    onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
                  <div className="alb-upload-content">
                    {uploading
                      ? <><span className="alb-upload-spinner" /><span className="alb-upload-text">Uploading…</span></>
                      : <><span className="alb-upload-icon">📤</span><span className="alb-upload-text">Click or drag & drop to upload</span></>
                    }
                  </div>
                </div>

                {form.imageUrl && (
                  <div className="alb-img-preview-wrap">
                    <img className="alb-img-preview" src={form.imageUrl} alt="Preview" />
                    <button className="alb-preview-remove"
                      onClick={(e) => { e.preventDefault(); setForm((p) => ({ ...p, imageUrl: "" })); }}>✕</button>
                  </div>
                )}
              </div>

              <div className="alb-form-group">
                <label className="alb-label">Title (optional)</label>
                <input className="alb-input" value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Summer Edit" />
              </div>

              <div className="alb-form-group">
                <label className="alb-label">Subtitle (optional)</label>
                <input className="alb-input" value={form.subtitle}
                  onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Season 01" />
              </div>

              <div className="alb-form-group">
                <label className="alb-label">Display Order</label>
                <input className="alb-input" type="number" value={form.order}
                  onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))} />
              </div>

              <div className="alb-form-group">
                <label className="alb-label">Visibility</label>
                <select className="alb-select" value={form.isVisible ? "true" : "false"}
                  onChange={(e) => setForm((p) => ({ ...p, isVisible: e.target.value === "true" }))}>
                  <option value="true">Visible</option>
                  <option value="false">Hidden</option>
                </select>
              </div>

            </div>
          </div>

          <div className="alb-modal-ft">
            <button className="alb-btn ghost" onClick={closeModal}>Cancel</button>
            <button className="alb-btn gold" onClick={saveLook} disabled={saving || uploading}>
              {saving ? "Saving…" : uploading ? "Uploading…" : editLook ? "Update Look" : "Add Look"}
            </button>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRM ── */}
      <div className={`alb-overlay${deleteTarget ? " open" : ""}`}>
        <div className="alb-modal alb-modal--sm">
          <div className="alb-modal-body alb-modal-body--center">
            <div className="alb-confirm-ico">🗑️</div>
            <div className="alb-confirm-title">Delete this look?</div>
            <div className="alb-confirm-msg">This cannot be undone.</div>
          </div>
          <div className="alb-modal-ft">
            <button className="alb-btn ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="alb-btn danger" onClick={() => deleteTarget && deleteLook(deleteTarget)}>Delete</button>
          </div>
        </div>
      </div>

      {/* TOASTS */}
      <div className="alb-toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`alb-toast ${t.type}`}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageLookbook;
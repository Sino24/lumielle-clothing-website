
import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/AdminStyle/AdminManageClientProjects.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
  "Content-Type": "application/json",
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClientProject {
  _id: string;
  clientName: string;
  category: string;
  description: string;
  coverImage: string;
  images: string[];
  tags: string[];
  order: number;
  isVisible: boolean;
  isFeatured: boolean;
}

const BLANK_PROJECT: Omit<ClientProject, "_id"> = {
  clientName: "",
  category: "",
  description: "",
  coverImage: "",
  images: [],
  tags: [],
  order: 0,
  isVisible: true,
  isFeatured: false,
};

type ToastType = "success" | "error" | "info";
interface Toast { id: number; msg: string; type: ToastType; }
type ModalMode = "create" | "edit";

// ── Component ─────────────────────────────────────────────────────────────────
const AdminManageClientProjects: React.FC = () => {
  const [projects, setProjects]   = useState<ClientProject[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [toasts,   setToasts]     = useState<Toast[]>([]);
  const [modal,    setModal]      = useState<{ mode: ModalMode; project: Omit<ClientProject, "_id"> & { _id?: string } } | null>(null);
  const [saving,   setSaving]     = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [tagInput, setTagInput]   = useState("");
  const [imgInput, setImgInput]   = useState("");
  const [uploading, setUploading] = useState(false);
  const toastId = useRef(0);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/client-projects/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
      });
      const d = await r.json();
      setProjects(Array.isArray(d) ? d : []);
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Open modal ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setModal({ mode: "create", project: { ...BLANK_PROJECT } });
    setTagInput("");
    setImgInput("");
  };

  const openEdit = (p: ClientProject) => {
    setModal({ mode: "edit", project: { ...p } });
    setTagInput("");
    setImgInput("");
  };

  const closeModal = () => { setModal(null); setTagInput(""); setImgInput(""); };

  // ── Field setters ──────────────────────────────────────────────────────────
  const setField = <K extends keyof Omit<ClientProject, "_id">>(key: K, val: any) =>
    setModal((m) => m ? { ...m, project: { ...m.project, [key]: val } } : m);

  // Tags
  const addTag = () => {
    const t = tagInput.trim();
    if (!t || modal?.project.tags.includes(t)) return;
    setField("tags", [...(modal?.project.tags ?? []), t]);
    setTagInput("");
  };
  const removeTag = (t: string) =>
    setField("tags", modal?.project.tags.filter((x) => x !== t) ?? []);

  // Extra images
  const addImageUrl = () => {
    const u = imgInput.trim();
    if (!u) return;
    setField("images", [...(modal?.project.images ?? []), u]);
    setImgInput("");
  };
  const removeImage = (idx: number) =>
    setField("images", modal?.project.images.filter((_, i) => i !== idx) ?? []);

  // ── Upload helper (uses existing /api/upload) ─────────────────────────────
  const uploadImage = async (file: File, field: "coverImage" | "images") => {
    setUploading(true);
    showToast("Uploading…", "info");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: fd,
      });
      const d = await r.json();
      const url = d.imageUrl ?? d.url ?? d.secure_url ?? "";
      if (!url) throw new Error("No URL returned");
      if (field === "coverImage") {
        setField("coverImage", url);
      } else {
        setField("images", [...(modal?.project.images ?? []), url]);
      }
      showToast("Image uploaded!", "success");
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setUploading(false);
    }
  };

  // ── Save (create or update) ────────────────────────────────────────────────
  const saveProject = async () => {
    if (!modal) return;
    if (!modal.project.clientName.trim()) {
      showToast("Client name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const isEdit = modal.mode === "edit" && modal.project._id;
      const url    = isEdit
        ? `${API_BASE}/api/client-projects/${modal.project._id}`
        : `${API_BASE}/api/client-projects`;
      const r = await fetch(url, {
        method:  isEdit ? "PUT" : "POST",
        headers: getAuthHeader(),
        body:    JSON.stringify(modal.project),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      showToast(isEdit ? "Project updated!" : "Project created!", "success");
      closeModal();
      fetchProjects();
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    setDeleting(id);
    try {
      await fetch(`${API_BASE}/api/client-projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
      });
      showToast("Project deleted", "success");
      fetchProjects();
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setDeleting(null);
    }
  };

  // ── Toggle visibility ──────────────────────────────────────────────────────
  const toggleVisibility = async (p: ClientProject) => {
    try {
      await fetch(`${API_BASE}/api/client-projects/${p._id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ isVisible: !p.isVisible }),
      });
      fetchProjects();
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    }
  };

  const toggleFeatured = async (p: ClientProject) => {
    try {
      await fetch(`${API_BASE}/api/client-projects/${p._id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ isFeatured: !p.isFeatured }),
      });
      fetchProjects();
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="acp-page">
      <div className="acp-content">

        {/* Header */}
        <div className="acp-page-hd">
          <div>
            <h1 className="acp-page-title">Client Projects</h1>
            <p className="acp-page-sub">Manage custom work showcase — jerseys, uniforms, brand apparel</p>
          </div>
          <div className="acp-page-actions">
            <button className="acp-btn ghost" onClick={fetchProjects} disabled={loading}>🔄 Refresh</button>
            <button className="acp-btn gold"  onClick={openCreate}>+ New Project</button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="acp-loading-state">
            <div className="acp-spin" />
            <div className="acp-load-text">Loading projects…</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="acp-empty">
            <p>No projects yet.</p>
            <button className="acp-btn gold" onClick={openCreate}>Create your first project</button>
          </div>
        ) : (
          <div className="acp-list">
            {projects.map((p) => (
              <div key={p._id} className={`acp-item ${!p.isVisible ? "acp-item--hidden" : ""}`}>

                {/* Cover thumbnail */}
                <div className="acp-item-thumb">
                  {p.coverImage
                    ? <img src={p.coverImage} alt={p.clientName} />
                    : <div className="acp-item-thumb-placeholder" />
                  }
                </div>

                {/* Info */}
                <div className="acp-item-info">
                  <div className="acp-item-top">
                    <span className="acp-item-name">{p.clientName}</span>
                    <div className="acp-item-badges">
                      {p.isFeatured && <span className="acp-badge acp-badge--gold">Featured</span>}
                      {!p.isVisible && <span className="acp-badge acp-badge--muted">Hidden</span>}
                    </div>
                  </div>
                  {p.category && <span className="acp-item-category">{p.category}</span>}
                  {p.tags.length > 0 && (
                    <div className="acp-item-tags">
                      {p.tags.map((t) => <span key={t} className="acp-tag">{t}</span>)}
                    </div>
                  )}
                  <span className="acp-item-imgs">{1 + p.images.length} image{(1 + p.images.length) !== 1 ? "s" : ""}</span>
                </div>

                {/* Actions */}
                <div className="acp-item-actions">
                  <button
                    className={`acp-action-btn ${p.isFeatured ? "acp-action-btn--active" : ""}`}
                    onClick={() => toggleFeatured(p)}
                    title={p.isFeatured ? "Unfeature" : "Feature"}
                  >⭐</button>
                  <button
                    className="acp-action-btn"
                    onClick={() => toggleVisibility(p)}
                    title={p.isVisible ? "Hide" : "Show"}
                  >{p.isVisible ? "👁" : "🙈"}</button>
                  <button
                    className="acp-action-btn"
                    onClick={() => openEdit(p)}
                    title="Edit"
                  >✏️</button>
                  <button
                    className="acp-action-btn acp-action-btn--danger"
                    onClick={() => deleteProject(p._id)}
                    disabled={deleting === p._id}
                    title="Delete"
                  >{deleting === p._id ? "…" : "🗑"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="acp-modal-backdrop" onClick={closeModal}>
          <div className="acp-modal" onClick={(e) => e.stopPropagation()}>

            <div className="acp-modal-hd">
              <h2 className="acp-modal-title">
                {modal.mode === "create" ? "New Project" : "Edit Project"}
              </h2>
              <button className="acp-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="acp-modal-body">

              {/* Basic info */}
              <div className="acp-panel">
                <div className="acp-panel-title">Project Info</div>
                <div className="acp-form-grid">

                  <div className="acp-form-group acp-form-full">
                    <label className="acp-label">Client Name *</label>
                    <input
                      className="acp-input"
                      value={modal.project.clientName}
                      onChange={(e) => setField("clientName", e.target.value)}
                      placeholder="FC Barcelona, Zara, St. Xavier's School…"
                    />
                  </div>

                  <div className="acp-form-group">
                    <label className="acp-label">Category</label>
                    <input
                      className="acp-input"
                      value={modal.project.category}
                      onChange={(e) => setField("category", e.target.value)}
                      placeholder="Football Jersey, Brand Uniform…"
                    />
                  </div>

                  <div className="acp-form-group">
                    <label className="acp-label">Display Order</label>
                    <input
                      className="acp-input"
                      type="number"
                      value={modal.project.order}
                      onChange={(e) => setField("order", Number(e.target.value))}
                    />
                  </div>

                  <div className="acp-form-group acp-form-full">
                    <label className="acp-label">Description</label>
                    <textarea
                      className="acp-textarea"
                      rows={3}
                      value={modal.project.description}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="Brief description of the project…"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="acp-form-group acp-form-full acp-toggle-row">
                    <label className="acp-toggle">
                      <input
                        type="checkbox"
                        checked={modal.project.isVisible}
                        onChange={(e) => setField("isVisible", e.target.checked)}
                      />
                      <span className="acp-toggle-track" />
                      <span className="acp-toggle-label">Visible on site</span>
                    </label>
                    <label className="acp-toggle">
                      <input
                        type="checkbox"
                        checked={modal.project.isFeatured}
                        onChange={(e) => setField("isFeatured", e.target.checked)}
                      />
                      <span className="acp-toggle-track" />
                      <span className="acp-toggle-label">Featured (large layout)</span>
                    </label>
                  </div>

                </div>
              </div>

              {/* Tags */}
              <div className="acp-panel">
                <div className="acp-panel-title">Tags</div>
                <div className="acp-tag-input-row">
                  <input
                    className="acp-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Sports, Corporate, Schools, Hospitality…"
                  />
                  <button className="acp-btn ghost" onClick={addTag}>Add</button>
                </div>
                {modal.project.tags.length > 0 && (
                  <div className="acp-tag-list">
                    {modal.project.tags.map((t) => (
                      <span key={t} className="acp-tag-chip">
                        {t}
                        <button onClick={() => removeTag(t)}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover image */}
              <div className="acp-panel">
                <div className="acp-panel-title">Cover Image</div>
                <div className="acp-form-group">
                  <label className="acp-label">Image URL</label>
                  <input
                    className="acp-input"
                    value={modal.project.coverImage}
                    onChange={(e) => setField("coverImage", e.target.value)}
                    placeholder="Paste URL or upload below"
                  />
                </div>
                <div
                  className="acp-upload-box"
                  style={{ opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? "none" : "auto" }}
                  onClick={() => document.getElementById("cp-cover-upload")?.click()}
                >
                  <input
                    id="cp-cover-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0], "coverImage"); }}
                  />
                  <div className="acp-upload-content">
                    <span className="acp-upload-icon">{uploading ? "⏳" : "📤"}</span>
                    <span className="acp-upload-text">
                      {uploading ? "Uploading…" : "Click to upload cover image"}
                    </span>
                  </div>
                </div>
                {modal.project.coverImage && (
                  <div className="acp-img-preview-wrap">
                    <img className="acp-img-preview" src={modal.project.coverImage} alt="Cover" />
                    <button className="acp-preview-remove" onClick={() => setField("coverImage", "")}>✕</button>
                  </div>
                )}
              </div>

              {/* Extra images */}
              <div className="acp-panel">
                <div className="acp-panel-title">Gallery Images</div>
                <div className="acp-tag-input-row">
                  <input
                    className="acp-input"
                    value={imgInput}
                    onChange={(e) => setImgInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                    placeholder="Paste image URL and press Enter"
                  />
                  <button className="acp-btn ghost" onClick={addImageUrl}>Add</button>
                </div>
                <div
                  className="acp-upload-box"
                  style={{ opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? "none" : "auto" }}
                  onClick={() => document.getElementById("cp-gallery-upload")?.click()}
                >
                  <input
                    id="cp-gallery-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0], "images"); }}
                  />
                  <div className="acp-upload-content">
                    <span className="acp-upload-icon">{uploading ? "⏳" : "🖼️"}</span>
                    <span className="acp-upload-text">
                      {uploading ? "Uploading…" : "Upload additional images"}
                    </span>
                  </div>
                </div>
                {modal.project.images.length > 0 && (
                  <div className="acp-gallery-strip">
                    {modal.project.images.map((img, idx) => (
                      <div key={idx} className="acp-gallery-thumb">
                        <img src={img} alt={`Gallery ${idx + 1}`} />
                        <button onClick={() => removeImage(idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal footer */}
            <div className="acp-modal-ft">
              <button className="acp-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="acp-btn gold" onClick={saveProject} disabled={saving}>
                {saving ? "Saving…" : modal.mode === "create" ? "Create Project" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="acp-toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`acp-toast ${t.type}`}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageClientProjects;
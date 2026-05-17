// src/pages/Admin/ContentManage.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/AdminStyle/AdminManageContent.css";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ContactMsg {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: string;
}

interface LookEntry {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  isVisible: boolean;
}

interface ValueItem { number: string; title: string; body: string; }

interface AboutData {
  headline: string;
  lead: string;
  storyHeading: string;
  storyBody: string;
  storyBody2: string;
  studioImageUrl: string;
  founderImageUrl: string;
  founderQuote: string;
  founderNote: string;
  founderName: string;
  email: string;
  phone: string;
  values: ValueItem[];
}

type Tab = "contacts" | "lookbook" | "about";
type ToastType = "success" | "error" | "info";
interface Toast { id: number; msg: string; type: ToastType; }

const ABOUT_BLANK: AboutData = {
  headline: "", lead: "", storyHeading: "", storyBody: "", storyBody2: "",
  studioImageUrl: "", founderImageUrl: "", founderQuote: "", founderNote: "",
  founderName: "", email: "", phone: "",
  values: [
    { number: "01", title: "", body: "" },
    { number: "02", title: "", body: "" },
    { number: "03", title: "", body: "" },
  ],
};

const LOOK_BLANK: Omit<LookEntry, "_id"> = {
  title: "", subtitle: "", imageUrl: "", order: 0, isVisible: true,
};

// ── Main Component ────────────────────────────────────────────────────────────
const ContentManage: React.FC = () => {
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

  const token = localStorage.getItem("adminToken") || "";
  const authHeader = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [tab, setTab] = useState<Tab>("contacts");

  // Contacts
  const [contacts, setContacts] = useState<ContactMsg[]>([]);
  const [contactLoading, setContactLoading] = useState(true);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  // Lookbook
  const [looks, setLooks] = useState<LookEntry[]>([]);
  const [lookLoading, setLookLoading] = useState(true);
  const [lookModal, setLookModal] = useState(false);
  const [editLook, setEditLook] = useState<LookEntry | null>(null);
  const [lookForm, setLookForm] = useState<Omit<LookEntry, "_id">>({ ...LOOK_BLANK });
  const [lookSaving, setLookSaving] = useState(false);
  const [lookUploading, setLookUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "look" | "contact" } | null>(null);

  // About
  const [about, setAbout] = useState<AboutData>({ ...ABOUT_BLANK });
  const [aboutLoading, setAboutLoading] = useState(true);
  const [aboutSaving, setAboutSaving] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchContacts = useCallback(async () => {
    setContactLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/contact`, { headers: authHeader });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setContacts(await r.json());
    } catch (e: unknown) { showToast((e as Error).message, "error"); }
    finally { setContactLoading(false); }
  }, [API_BASE]);

  const fetchLooks = useCallback(async () => {
    setLookLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/lookbook/all`, { headers: authHeader });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setLooks(await r.json());
    } catch (e: unknown) { showToast((e as Error).message, "error"); }
    finally { setLookLoading(false); }
  }, [API_BASE]);

  const fetchAbout = useCallback(async () => {
    setAboutLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/about`);
      const d = await r.json();
      setAbout({ ...ABOUT_BLANK, ...d });
    } catch (e: unknown) { showToast((e as Error).message, "error"); }
    finally { setAboutLoading(false); }
  }, [API_BASE]);

  useEffect(() => { fetchContacts(); fetchLooks(); fetchAbout(); }, []);

  // ── Contacts ─────────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: ContactMsg["status"]) => {
    try {
      await fetch(`${API_BASE}/api/contact/${id}/status`, {
        method: "PATCH",
        headers: authHeader,
        body: JSON.stringify({ status }),
      });
      setContacts((p) => p.map((c) => c._id === id ? { ...c, status } : c));
      showToast("Status updated", "success");
    } catch { showToast("Failed to update", "error"); }
  };

  const deleteContact = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/contact/${id}`, { method: "DELETE", headers: authHeader });
      setContacts((p) => p.filter((c) => c._id !== id));
      showToast("Message deleted", "success");
    } catch { showToast("Failed to delete", "error"); }
    setDeleteTarget(null);
  };

  // ── Lookbook ─────────────────────────────────────────────────────────────
  const openLookAdd = () => {
    setEditLook(null);
    setLookForm({ ...LOOK_BLANK });
    setLookModal(true);
  };

  const openLookEdit = (l: LookEntry) => {
    setEditLook(l);
    setLookForm({ title: l.title, subtitle: l.subtitle, imageUrl: l.imageUrl, order: l.order, isVisible: l.isVisible });
    setLookModal(true);
  };

  const saveLook = async () => {
    if (!lookForm.imageUrl) { showToast("Image is required", "error"); return; }
    setLookSaving(true);
    try {
      const url  = editLook ? `${API_BASE}/api/lookbook/${editLook._id}` : `${API_BASE}/api/lookbook`;
      const method = editLook ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: authHeader, body: JSON.stringify(lookForm) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      showToast(editLook ? "Look updated!" : "Look added!", "success");
      setLookModal(false);
      fetchLooks();
    } catch (e: unknown) { showToast((e as Error).message, "error"); }
    finally { setLookSaving(false); }
  };

  const deleteLook = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/lookbook/${id}`, { method: "DELETE", headers: authHeader });
      setLooks((p) => p.filter((l) => l._id !== id));
      showToast("Look deleted", "success");
    } catch { showToast("Failed to delete", "error"); }
    setDeleteTarget(null);
  };

  const uploadLookImage = async (file: File) => {
    setLookUploading(true);
    showToast("Uploading…", "info");
    try {
      const fd = new FormData(); fd.append("image", file);
      const r = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: fd });
      const d = await r.json();
      const url = d.imageUrl ?? d.url ?? d.secure_url ?? "";
      if (!url) throw new Error("No URL returned");
      setLookForm((p) => ({ ...p, imageUrl: url }));
      showToast("Image uploaded!", "success");
    } catch (e: unknown) { showToast((e as Error).message, "error"); }
    finally { setLookUploading(false); }
  };

  // ── About ─────────────────────────────────────────────────────────────────
  const setAboutField = (key: keyof AboutData, val: string) =>
    setAbout((p) => ({ ...p, [key]: val }));

  const setValueField = (i: number, key: keyof ValueItem, val: string) =>
    setAbout((p) => ({
      ...p,
      values: p.values.map((v, j) => j === i ? { ...v, [key]: val } : v),
    }));

  const addValue = () =>
    setAbout((p) => ({ ...p, values: [...p.values, { number: `0${p.values.length + 1}`, title: "", body: "" }] }));

  const removeValue = (i: number) =>
    setAbout((p) => ({ ...p, values: p.values.filter((_, j) => j !== i) }));

  const saveAbout = async () => {
    setAboutSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/about`, {
        method: "PUT",
        headers: authHeader,
        body: JSON.stringify(about),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      showToast("About page saved!", "success");
    } catch (e: unknown) { showToast((e as Error).message, "error"); }
    finally { setAboutSaving(false); }
  };

  const uploadAboutImage = async (file: File, field: "studioImageUrl" | "founderImageUrl") => {
    showToast("Uploading…", "info");
    try {
      const fd = new FormData(); fd.append("image", file);
      const r = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: fd });
      const d = await r.json();
      const url = d.imageUrl ?? d.url ?? d.secure_url ?? "";
      if (!url) throw new Error("No URL returned");
      setAboutField(field, url);
      showToast("Image uploaded!", "success");
    } catch (e: unknown) { showToast((e as Error).message, "error"); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const statusColor: Record<ContactMsg["status"], string> = {
    unread: "#c9a96e", read: "#6c9ec4", replied: "#2c4a3e",
  };

  const unreadCount = contacts.filter((c) => c.status === "unread").length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="cm-page">
      <div className="cm-content">

        {/* Header */}
        <div className="cm-hd">
          <div>
            <h1 className="cm-title">Content</h1>
            <p className="cm-sub">Manage contact messages, lookbook &amp; about page</p>
          </div>
          {tab === "contacts" && (
            <button className="cm-btn ghost" onClick={fetchContacts}>🔄 Refresh</button>
          )}
          {tab === "lookbook" && (
            <button className="cm-btn gold" onClick={openLookAdd}>+ Add Look</button>
          )}
          {tab === "about" && (
            <button className="cm-btn gold" onClick={saveAbout} disabled={aboutSaving}>
              {aboutSaving ? "Saving…" : "💾 Save Changes"}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="cm-tabs">
          <button className={`cm-tab ${tab === "contacts" ? "cm-tab--active" : ""}`} onClick={() => setTab("contacts")}>
            Messages {unreadCount > 0 && <span className="cm-badge">{unreadCount}</span>}
          </button>
          <button className={`cm-tab ${tab === "lookbook" ? "cm-tab--active" : ""}`} onClick={() => setTab("lookbook")}>
            Lookbook <span className="cm-badge cm-badge--muted">{looks.length}</span>
          </button>
          <button className={`cm-tab ${tab === "about" ? "cm-tab--active" : ""}`} onClick={() => setTab("about")}>
            About Page
          </button>
        </div>

        {/* ── CONTACTS TAB ── */}
        {tab === "contacts" && (
          <div className="cm-section">
            {contactLoading ? (
              <div className="cm-loading"><div className="cm-spin" /></div>
            ) : contacts.length === 0 ? (
              <div className="cm-empty">No messages yet.</div>
            ) : (
              <div className="cm-msg-list">
                {contacts.map((c) => (
                  <div key={c._id} className={`cm-msg ${c.status === "unread" ? "cm-msg--unread" : ""}`}>
                    <div className="cm-msg-head" onClick={() => setExpandedContact(expandedContact === c._id ? null : c._id)}>
                      <div className="cm-msg-left">
                        <div className="cm-msg-avatar">{c.name[0].toUpperCase()}</div>
                        <div>
                          <div className="cm-msg-name">{c.name}</div>
                          <div className="cm-msg-email">{c.email}</div>
                        </div>
                      </div>
                      <div className="cm-msg-right">
                        <span className="cm-msg-date">{fmtDate(c.createdAt)}</span>
                        <span className="cm-msg-status" style={{ background: statusColor[c.status] }}>
                          {c.status}
                        </span>
                        <span className="cm-msg-chevron">{expandedContact === c._id ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {expandedContact === c._id && (
                      <div className="cm-msg-body">
                        <p className="cm-msg-text">{c.message}</p>
                        <div className="cm-msg-actions">
                          <select
                            className="cm-select"
                            value={c.status}
                            onChange={(e) => updateStatus(c._id, e.target.value as ContactMsg["status"])}
                          >
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                          </select>
                          <a className="cm-btn ghost sm" href={`mailto:${c.email}`}>Reply via Email</a>
                          <button className="cm-btn danger sm" onClick={() => setDeleteTarget({ id: c._id, type: "contact" })}>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LOOKBOOK TAB ── */}
        {tab === "lookbook" && (
          <div className="cm-section">
            {lookLoading ? (
              <div className="cm-loading"><div className="cm-spin" /></div>
            ) : looks.length === 0 ? (
              <div className="cm-empty">No looks yet. Add your first one.</div>
            ) : (
              <div className="cm-look-grid">
                {looks.map((l) => (
                  <div key={l._id} className={`cm-look-card ${!l.isVisible ? "cm-look-card--hidden" : ""}`}>
                    <div className="cm-look-img">
                      {l.imageUrl ? <img src={l.imageUrl} alt={l.title} /> : <span>🖼</span>}
                      {!l.isVisible && <div className="cm-look-hidden-badge">Hidden</div>}
                    </div>
                    <div className="cm-look-info">
                      <div className="cm-look-title">{l.title || "Untitled"}</div>
                      {l.subtitle && <div className="cm-look-sub">{l.subtitle}</div>}
                      <div className="cm-look-order">Order: {l.order}</div>
                    </div>
                    <div className="cm-look-btns">
                      <button className="cm-btn ghost sm" onClick={() => openLookEdit(l)}>✏️ Edit</button>
                      <button className="cm-btn danger sm" onClick={() => setDeleteTarget({ id: l._id, type: "look" })}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ABOUT TAB ── */}
        {tab === "about" && (
          <div className="cm-section">
            {aboutLoading ? (
              <div className="cm-loading"><div className="cm-spin" /></div>
            ) : (
              <div className="cm-about-form">

                <div className="cm-about-section">
                  <div className="cm-about-section-title">Hero</div>
                  <div className="cm-about-grid">
                    <div className="cm-field cm-field--full">
                      <label className="cm-label">Headline</label>
                      <input className="cm-input" value={about.headline} onChange={(e) => setAboutField("headline", e.target.value)} placeholder="Crafted for those who wear their light" />
                    </div>
                    <div className="cm-field cm-field--full">
                      <label className="cm-label">Lead Paragraph</label>
                      <textarea className="cm-textarea" value={about.lead} onChange={(e) => setAboutField("lead", e.target.value)} rows={3} placeholder="Short intro paragraph…" />
                    </div>
                  </div>
                </div>

                <div className="cm-about-section">
                  <div className="cm-about-section-title">Contact Details</div>
                  <div className="cm-about-grid">
                    <div className="cm-field">
                      <label className="cm-label">Email</label>
                      <input className="cm-input" value={about.email} onChange={(e) => setAboutField("email", e.target.value)} placeholder="hello@lumielle.com" />
                    </div>
                    <div className="cm-field">
                      <label className="cm-label">Phone</label>
                      <input className="cm-input" value={about.phone} onChange={(e) => setAboutField("phone", e.target.value)} placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </div>

                <div className="cm-about-section">
                  <div className="cm-about-section-title">Our Story</div>
                  <div className="cm-about-grid">
                    <div className="cm-field cm-field--full">
                      <label className="cm-label">Story Heading (use \n for line break)</label>
                      <input className="cm-input" value={about.storyHeading} onChange={(e) => setAboutField("storyHeading", e.target.value)} placeholder="Designed with simplicity.\nBuilt with intention." />
                    </div>
                    <div className="cm-field cm-field--full">
                      <label className="cm-label">Story Paragraph 1</label>
                      <textarea className="cm-textarea" rows={3} value={about.storyBody} onChange={(e) => setAboutField("storyBody", e.target.value)} />
                    </div>
                    <div className="cm-field cm-field--full">
                      <label className="cm-label">Story Paragraph 2</label>
                      <textarea className="cm-textarea" rows={3} value={about.storyBody2} onChange={(e) => setAboutField("storyBody2", e.target.value)} />
                    </div>

                    {/* Studio image */}
                    <div className="cm-field cm-field--full">
                      <label className="cm-label">Studio Image</label>
                      <input className="cm-input" value={about.studioImageUrl} onChange={(e) => setAboutField("studioImageUrl", e.target.value)} placeholder="Paste URL or upload below" />
                      <label className="cm-upload-box">
                        <input type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files?.[0]) uploadAboutImage(e.target.files[0], "studioImageUrl"); }} />
                        <span>📤 Upload Studio Image</span>
                      </label>
                      {about.studioImageUrl && <img className="cm-img-preview" src={about.studioImageUrl} alt="Studio" />}
                    </div>
                  </div>
                </div>

                <div className="cm-about-section">
                  <div className="cm-about-section-title">Values</div>
                  {about.values.map((v, i) => (
                    <div key={i} className="cm-value-row">
                      <input className="cm-input cm-input--num" value={v.number} onChange={(e) => setValueField(i, "number", e.target.value)} placeholder="01" />
                      <input className="cm-input" value={v.title} onChange={(e) => setValueField(i, "title", e.target.value)} placeholder="Value title" />
                      <input className="cm-input cm-input--wide" value={v.body} onChange={(e) => setValueField(i, "body", e.target.value)} placeholder="Value description" />
                      <button className="cm-rm-btn" onClick={() => removeValue(i)}>✕</button>
                    </div>
                  ))}
                  <button className="cm-add-row-btn" onClick={addValue}>+ Add Value</button>
                </div>

                <div className="cm-about-section">
                  <div className="cm-about-section-title">Founder</div>
                  <div className="cm-about-grid">
                    <div className="cm-field cm-field--full">
                      <label className="cm-label">Founder Quote</label>
                      <input className="cm-input" value={about.founderQuote} onChange={(e) => setAboutField("founderQuote", e.target.value)} placeholder="Fashion should feel personal…" />
                    </div>
                    <div className="cm-field cm-field--full">
                      <label className="cm-label">Founder Note</label>
                      <textarea className="cm-textarea" rows={3} value={about.founderNote} onChange={(e) => setAboutField("founderNote", e.target.value)} />
                    </div>
                    <div className="cm-field">
                      <label className="cm-label">Founder / Brand Name</label>
                      <input className="cm-input" value={about.founderName} onChange={(e) => setAboutField("founderName", e.target.value)} placeholder="Lumielle Studio" />
                    </div>

                    <div className="cm-field cm-field--full">
                      <label className="cm-label">Founder Image</label>
                      <input className="cm-input" value={about.founderImageUrl} onChange={(e) => setAboutField("founderImageUrl", e.target.value)} placeholder="Paste URL or upload below" />
                      <label className="cm-upload-box">
                        <input type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files?.[0]) uploadAboutImage(e.target.files[0], "founderImageUrl"); }} />
                        <span>📤 Upload Founder Image</span>
                      </label>
                      {about.founderImageUrl && <img className="cm-img-preview cm-img-preview--portrait" src={about.founderImageUrl} alt="Founder" />}
                    </div>
                  </div>
                </div>

                <div className="cm-about-footer">
                  <button className="cm-btn gold" onClick={saveAbout} disabled={aboutSaving}>
                    {aboutSaving ? "Saving…" : "💾 Save All Changes"}
                  </button>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Look Modal ── */}
      {lookModal && (
        <div className="cm-overlay open" onClick={() => setLookModal(false)}>
          <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cm-modal-hd">
              <span className="cm-modal-title">{editLook ? "Edit Look" : "Add Look"}</span>
              <button className="cm-modal-close" onClick={() => setLookModal(false)}>✕</button>
            </div>
            <div className="cm-modal-body">
              <div className="cm-field">
                <label className="cm-label">Image URL</label>
                <input className="cm-input" value={lookForm.imageUrl} onChange={(e) => setLookForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://…" />
                <label className={`cm-upload-box ${lookUploading ? "cm-upload-box--loading" : ""}`}>
                  <input type="file" accept="image/*" hidden disabled={lookUploading}
                    onChange={(e) => { if (e.target.files?.[0]) uploadLookImage(e.target.files[0]); }} />
                  <span>{lookUploading ? "Uploading…" : "📤 Upload from gallery"}</span>
                </label>
                {lookForm.imageUrl && <img className="cm-img-preview cm-img-preview--portrait" src={lookForm.imageUrl} alt="Look preview" />}
              </div>
              <div className="cm-field">
                <label className="cm-label">Title (optional)</label>
                <input className="cm-input" value={lookForm.title} onChange={(e) => setLookForm((p) => ({ ...p, title: e.target.value }))} placeholder="Summer Edit" />
              </div>
              <div className="cm-field">
                <label className="cm-label">Subtitle (optional)</label>
                <input className="cm-input" value={lookForm.subtitle} onChange={(e) => setLookForm((p) => ({ ...p, subtitle: e.target.value }))} placeholder="Season 01" />
              </div>
              <div className="cm-field-row">
                <div className="cm-field">
                  <label className="cm-label">Display Order</label>
                  <input className="cm-input" type="number" value={lookForm.order} onChange={(e) => setLookForm((p) => ({ ...p, order: Number(e.target.value) }))} />
                </div>
                <div className="cm-field">
                  <label className="cm-label">Visibility</label>
                  <select className="cm-select" value={lookForm.isVisible ? "true" : "false"} onChange={(e) => setLookForm((p) => ({ ...p, isVisible: e.target.value === "true" }))}>
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="cm-modal-ft">
              <button className="cm-btn ghost" onClick={() => setLookModal(false)}>Cancel</button>
              <button className="cm-btn gold" onClick={saveLook} disabled={lookSaving || lookUploading}>
                {lookSaving ? "Saving…" : editLook ? "Update" : "Add Look"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="cm-overlay open">
          <div className="cm-modal cm-modal--sm">
            <div className="cm-modal-body" style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🗑️</div>
              <div className="cm-modal-title" style={{ marginBottom: "0.5rem" }}>Are you sure?</div>
              <p style={{ fontSize: "0.78rem", color: "var(--lum-muted)", margin: 0 }}>This cannot be undone.</p>
            </div>
            <div className="cm-modal-ft">
              <button className="cm-btn ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="cm-btn danger" onClick={() => {
                if (deleteTarget.type === "contact") deleteContact(deleteTarget.id);
                else deleteLook(deleteTarget.id);
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <div className="cm-toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`cm-toast ${t.type}`}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManage;
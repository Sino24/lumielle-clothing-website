// src/pages/Admin/AdminManageAbout.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/AdminStyle/AdminManageAbout.css";
import { AdminSkeleton } from "../components/AdminSkeleton";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
  "Content-Type": "application/json",
});

// ── Types ─────────────────────────────────────────────────────────────────────
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

type ToastType = "success" | "error" | "info";
interface Toast { id: number; msg: string; type: ToastType; }

// ── Component ─────────────────────────────────────────────────────────────────
const AdminManageAbout: React.FC = () => {
  const [about, setAbout]   = useState<AboutData>({ ...ABOUT_BLANK });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toasts,  setToasts]  = useState<Toast[]>([]);
  const toastId = useRef(0);

  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchAbout = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/about`);
      const d = await r.json();
      setAbout({ ...ABOUT_BLANK, ...d });
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchAbout(); }, [fetchAbout]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setField = (key: keyof AboutData, val: string) =>
    setAbout((p) => ({ ...p, [key]: val }));

  const setValueField = (i: number, key: keyof ValueItem, val: string) =>
    setAbout((p) => ({
      ...p,
      values: p.values.map((v, j) => j === i ? { ...v, [key]: val } : v),
    }));

  const addValue = () =>
    setAbout((p) => ({
      ...p,
      values: [...p.values, { number: `0${p.values.length + 1}`, title: "", body: "" }],
    }));

  const removeValue = (i: number) =>
    setAbout((p) => ({ ...p, values: p.values.filter((_, j) => j !== i) }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const saveAbout = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/about`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(about),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      showToast("About page saved!", "success");
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Image upload ───────────────────────────────────────────────────────────
  const uploadImage = async (file: File, field: "studioImageUrl" | "founderImageUrl") => {
    showToast("Uploading…", "info");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: fd });
      const d = await r.json();
      const url = d.imageUrl ?? d.url ?? d.secure_url ?? "";
      if (!url) throw new Error("No URL returned");
      setField(field, url);
      showToast("Image uploaded!", "success");
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="aba-page">
      <div className="aba-content">

        {/* PAGE HEADER */}
        <div className="aba-page-hd">
          <div>
            <h1 className="aba-page-title">About Page</h1>
            <p className="aba-page-sub">Edit your brand story, values &amp; founder section</p>
          </div>
          <div className="aba-page-actions">
            <button className="aba-btn ghost" onClick={fetchAbout}>🔄 Refresh</button>
            <button className="aba-btn gold" onClick={saveAbout} disabled={saving}>
              {saving ? "Saving…" : "💾 Save Changes"}
            </button>
          </div>
        </div>

        {loading ? (
         <AdminSkeleton variant="about" />
        ) : (
          <div className="aba-form">

            {/* ── Hero ── */}
            <div className="aba-panel">
              <div className="aba-panel-title">Hero</div>
              <div className="aba-form-grid">
                <div className="aba-form-group aba-form-full">
                  <label className="aba-label">Headline</label>
                  <input className="aba-input" value={about.headline}
                    onChange={(e) => setField("headline", e.target.value)}
                    placeholder="Crafted for those who wear their light" />
                </div>
                <div className="aba-form-group aba-form-full">
                  <label className="aba-label">Lead Paragraph</label>
                  <textarea className="aba-textarea" rows={3} value={about.lead}
                    onChange={(e) => setField("lead", e.target.value)}
                    placeholder="Short intro paragraph…" />
                </div>
              </div>
            </div>

            {/* ── Contact Details ── */}
            <div className="aba-panel">
              <div className="aba-panel-title">Contact Details</div>
              <div className="aba-form-grid">
                <div className="aba-form-group">
                  <label className="aba-label">Email</label>
                  <input className="aba-input" value={about.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="hello@drip.com" />
                </div>
                <div className="aba-form-group">
                  <label className="aba-label">Phone</label>
                  <input className="aba-input" value={about.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>

            {/* ── Our Story ── */}
            <div className="aba-panel">
              <div className="aba-panel-title">Our Story</div>
              <div className="aba-form-grid">
                <div className="aba-form-group aba-form-full">
                  <label className="aba-label">Story Heading</label>
                  <input className="aba-input" value={about.storyHeading}
                    onChange={(e) => setField("storyHeading", e.target.value)}
                    placeholder="Designed with simplicity. Built with intention." />
                </div>
                <div className="aba-form-group aba-form-full">
                  <label className="aba-label">Story Paragraph 1</label>
                  <textarea className="aba-textarea" rows={3} value={about.storyBody}
                    onChange={(e) => setField("storyBody", e.target.value)} />
                </div>
                <div className="aba-form-group aba-form-full">
                  <label className="aba-label">Story Paragraph 2</label>
                  <textarea className="aba-textarea" rows={3} value={about.storyBody2}
                    onChange={(e) => setField("storyBody2", e.target.value)} />
                </div>

                {/* Studio image */}
                <div className="aba-form-group aba-form-full">
                  <label className="aba-label">Studio Image URL</label>
                  <input className="aba-input" value={about.studioImageUrl}
                    onChange={(e) => setField("studioImageUrl", e.target.value)}
                    placeholder="Paste URL or upload below" />
                  <div className="aba-upload-box"
                    onClick={() => document.getElementById("studio-upload")?.click()}>
                    <input id="studio-upload" type="file" accept="image/*" hidden
                      onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0], "studioImageUrl"); }} />
                    <div className="aba-upload-content">
                      <span className="aba-upload-icon">📤</span>
                      <span className="aba-upload-text">Click to upload studio image</span>
                    </div>
                  </div>
                  {about.studioImageUrl && (
                    <div className="aba-img-preview-wrap">
                      <img className="aba-img-preview" src={about.studioImageUrl} alt="Studio" />
                      <button className="aba-preview-remove" onClick={() => setField("studioImageUrl", "")}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Values ── */}
            <div className="aba-panel">
              <div className="aba-panel-title">Values</div>
              {about.values.map((v, i) => (
                <div className="aba-value-row" key={i}>
                  <input className="aba-input aba-input-num" value={v.number}
                    onChange={(e) => setValueField(i, "number", e.target.value)}
                    placeholder="01" />
                  <input className="aba-input" value={v.title}
                    onChange={(e) => setValueField(i, "title", e.target.value)}
                    placeholder="Value title" />
                  <input className="aba-input aba-input-wide" value={v.body}
                    onChange={(e) => setValueField(i, "body", e.target.value)}
                    placeholder="Value description" />
                  <button className="aba-rm-btn" onClick={() => removeValue(i)}>✕</button>
                </div>
              ))}
              <button className="aba-add-row-btn" onClick={addValue}>+ Add Value</button>
            </div>

            {/* ── Founder ── */}
            <div className="aba-panel">
              <div className="aba-panel-title">Founder</div>
              <div className="aba-form-grid">
                <div className="aba-form-group aba-form-full">
                  <label className="aba-label">Founder Quote</label>
                  <input className="aba-input" value={about.founderQuote}
                    onChange={(e) => setField("founderQuote", e.target.value)}
                    placeholder="Fashion should feel personal…" />
                </div>
                <div className="aba-form-group aba-form-full">
                  <label className="aba-label">Founder Note</label>
                  <textarea className="aba-textarea" rows={3} value={about.founderNote}
                    onChange={(e) => setField("founderNote", e.target.value)} />
                </div>
                <div className="aba-form-group">
                  <label className="aba-label">Founder / Brand Name</label>
                  <input className="aba-input" value={about.founderName}
                    onChange={(e) => setField("founderName", e.target.value)}
                    placeholder="Drip Studio" />
                </div>
                <div className="aba-form-group aba-form-full">
                  <label className="aba-label">Founder Image URL</label>
                  <input className="aba-input" value={about.founderImageUrl}
                    onChange={(e) => setField("founderImageUrl", e.target.value)}
                    placeholder="Paste URL or upload below" />
                  <div className="aba-upload-box"
                    onClick={() => document.getElementById("founder-upload")?.click()}>
                    <input id="founder-upload" type="file" accept="image/*" hidden
                      onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0], "founderImageUrl"); }} />
                    <div className="aba-upload-content">
                      <span className="aba-upload-icon">📤</span>
                      <span className="aba-upload-text">Click to upload founder image</span>
                    </div>
                  </div>
                  {about.founderImageUrl && (
                    <div className="aba-img-preview-wrap aba-img-preview-wrap--portrait">
                      <img className="aba-img-preview" src={about.founderImageUrl} alt="Founder" />
                      <button className="aba-preview-remove" onClick={() => setField("founderImageUrl", "")}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Save */}
            <div className="aba-form-footer">
              <button className="aba-btn gold" onClick={saveAbout} disabled={saving}>
                {saving ? "Saving…" : "💾 Save All Changes"}
              </button>
            </div>

          </div>
        )}
      </div>

      {/* TOASTS */}
      <div className="aba-toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`aba-toast ${t.type}`}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageAbout;
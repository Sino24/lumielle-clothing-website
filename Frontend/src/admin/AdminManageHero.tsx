// src/pages/Admin/AdminManageHero.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/AdminStyle/AdminManageHero.css";
import { AdminSkeleton } from "../components/AdminSkeleton";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
  "Content-Type": "application/json",
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface HeroData {
  eyebrow:        string;
  titleLine1:     string;
  titleItalic:    string;
  titleLine2:     string;
  ctaText:        string;
  ctaLink:        string;
  imageUrl:       string;
  overlayOpacity: number;
}

const HERO_BLANK: HeroData = {
  eyebrow:        "Summer Collection 2026",
  titleLine1:     "Dressed in",
  titleItalic:    "quiet",
  titleLine2:     "confidence.",
  ctaText:        "Explore the collection",
  ctaLink:        "/product",
  imageUrl:       "",
  overlayOpacity: 58,
};

type ToastType = "success" | "error" | "info";
interface Toast { id: number; msg: string; type: ToastType; }

// ── Component ─────────────────────────────────────────────────────────────────
const AdminManageHero: React.FC = () => {
  const [hero,      setHero]      = useState<HeroData>({ ...HERO_BLANK });
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toasts,    setToasts]    = useState<Toast[]>([]);
  const toastId = useRef(0);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchHero = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/hero`);
      const d = await r.json();
      setHero({ ...HERO_BLANK, ...d });
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchHero(); }, [fetchHero]);

  // ── Field helper ───────────────────────────────────────────────────────────
  const setField = <K extends keyof HeroData>(key: K, val: HeroData[K]) =>
    setHero((p) => ({ ...p, [key]: val }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const saveHero = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/hero`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(hero),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      showToast("Hero saved successfully!", "success");
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Image upload — uses the same /api/upload route as About ───────────────
  const uploadImage = async (file: File) => {
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
      setField("imageUrl", url);
      showToast("Image uploaded!", "success");
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setUploading(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const overlayRgba = `rgba(26,23,20,${(hero.overlayOpacity / 100).toFixed(2)})`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="amh-page">
      <div className="amh-content">

        {/* Page header */}
        <div className="amh-page-hd">
          <div>
            <h1 className="amh-page-title">Home Hero</h1>
            <p className="amh-page-sub">Edit the hero banner — image, headline copy &amp; CTA</p>
          </div>
          <div className="amh-page-actions">
            <button className="amh-btn ghost" onClick={fetchHero} disabled={loading}>
              🔄 Refresh
            </button>
            <button className="amh-btn gold" onClick={saveHero} disabled={saving || loading}>
              {saving ? "Saving…" : "💾 Save Changes"}
            </button>
          </div>
        </div>

        {loading ? (
       <AdminSkeleton variant="hero" />
        ) : (
          <div className="amh-form">

            {/* ── Live Preview ── */}
            <div className="amh-panel">
              <div className="amh-panel-title">Live Preview</div>
              <p className="amh-preview-label">How the hero will appear on the homepage</p>
              <div className="amh-live-preview">
                {hero.imageUrl && (
                  <img className="amh-live-preview__img" src={hero.imageUrl} alt="Hero preview" />
                )}
                <div
                  className="amh-live-preview__overlay"
                  style={{
                    background: `linear-gradient(to top, ${overlayRgba} 0%, rgba(26,23,20,0.06) 55%, transparent 100%)`,
                  }}
                />
                <div className="amh-live-preview__content">
                  {hero.eyebrow && (
                    <p className="amh-live-preview__eyebrow">{hero.eyebrow}</p>
                  )}
                  <h2 className="amh-live-preview__title">
                    {hero.titleLine1}{" "}
                    {hero.titleItalic && <em>{hero.titleItalic}</em>}
                    {hero.titleLine2  && <><br />{hero.titleLine2}</>}
                  </h2>
                  {hero.ctaText && (
                    <span className="amh-live-preview__cta">{hero.ctaText} →</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Background Image ── */}
            <div className="amh-panel">
              <div className="amh-panel-title">Background Image</div>
              <div className="amh-form-grid">

                <div className="amh-form-group amh-form-full">
                  <label className="amh-label">Image URL</label>
                  <input
                    className="amh-input"
                    value={hero.imageUrl}
                    onChange={(e) => setField("imageUrl", e.target.value)}
                    placeholder="Paste URL or upload below"
                  />
                </div>

                <div className="amh-form-group amh-form-full">
                  <div
                    className="amh-upload-box"
                    onClick={() => document.getElementById("hero-img-upload")?.click()}
                    style={{ opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? "none" : "auto" }}
                  >
                    <input
                      id="hero-img-upload"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }}
                    />
                    <div className="amh-upload-content">
                      <span className="amh-upload-icon">{uploading ? "⏳" : "📤"}</span>
                      <span className="amh-upload-text">
                        {uploading ? "Uploading…" : "Click to upload hero background"}
                      </span>
                    </div>
                  </div>

                  {hero.imageUrl && (
                    <div className="amh-preview-wrap" style={{ width: "100%" }}>
                      <img
                        className="amh-preview-img amh-preview-full"
                        src={hero.imageUrl}
                        alt="Hero background"
                      />
                      <button
                        className="amh-preview-remove"
                        onClick={() => setField("imageUrl", "")}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Overlay slider */}
                <div className="amh-form-group amh-form-full">
                  <label className="amh-label">Overlay Darkness — {hero.overlayOpacity}%</label>
                  <div className="amh-slider-row">
                    <input
                      className="amh-slider"
                      type="range"
                      min={0}
                      max={90}
                      step={1}
                      value={hero.overlayOpacity}
                      onChange={(e) => setField("overlayOpacity", Number(e.target.value))}
                    />
                    <span className="amh-slider-val">{hero.overlayOpacity}%</span>
                  </div>
                  <p className="amh-hint">Controls how dark the gradient is over the image.</p>
                </div>

              </div>
            </div>

            {/* ── Headline Copy ── */}
            <div className="amh-panel">
              <div className="amh-panel-title">Headline Copy</div>
              <div className="amh-form-grid">

                <div className="amh-form-group amh-form-full">
                  <label className="amh-label">Eyebrow Text</label>
                  <input
                    className="amh-input"
                    value={hero.eyebrow}
                    onChange={(e) => setField("eyebrow", e.target.value)}
                    placeholder="Summer Collection 2026"
                  />
                  <p className="amh-hint">Small uppercase label shown above the title.</p>
                </div>

                <div className="amh-form-group">
                  <label className="amh-label">Title — Line 1</label>
                  <input
                    className="amh-input"
                    value={hero.titleLine1}
                    onChange={(e) => setField("titleLine1", e.target.value)}
                    placeholder="Dressed in"
                  />
                </div>

                <div className="amh-form-group">
                  <label className="amh-label">Title — Italic Word</label>
                  <input
                    className="amh-input"
                    value={hero.titleItalic}
                    onChange={(e) => setField("titleItalic", e.target.value)}
                    placeholder="quiet"
                  />
                  <p className="amh-hint">Rendered in gold italic. Leave blank to skip.</p>
                </div>

                <div className="amh-form-group amh-form-full">
                  <label className="amh-label">Title — Line 2</label>
                  <input
                    className="amh-input"
                    value={hero.titleLine2}
                    onChange={(e) => setField("titleLine2", e.target.value)}
                    placeholder="confidence."
                  />
                </div>

              </div>
            </div>

            {/* ── CTA ── */}
            <div className="amh-panel">
              <div className="amh-panel-title">Call to Action</div>
              <div className="amh-form-grid">

                <div className="amh-form-group">
                  <label className="amh-label">Button Label</label>
                  <input
                    className="amh-input"
                    value={hero.ctaText}
                    onChange={(e) => setField("ctaText", e.target.value)}
                    placeholder="Explore the collection"
                  />
                </div>

                <div className="amh-form-group">
                  <label className="amh-label">Button Link</label>
                  <input
                    className="amh-input"
                    value={hero.ctaLink}
                    onChange={(e) => setField("ctaLink", e.target.value)}
                    placeholder="/product"
                  />
                  <p className="amh-hint">Internal path (e.g. /product) or full URL.</p>
                </div>

              </div>
            </div>

            {/* Footer save */}
            <div className="amh-form-footer">
              <button className="amh-btn gold" onClick={saveHero} disabled={saving}>
                {saving ? "Saving…" : "💾 Save All Changes"}
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Toasts */}
      <div className="amh-toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`amh-toast ${t.type}`}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageHero;
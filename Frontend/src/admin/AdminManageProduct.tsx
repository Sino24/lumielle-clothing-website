// src/pages/Admin/ProductManage.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/AdminStyle/AdminManageProduct.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ColorEntry { label: string; hex: string; }

interface Product {
  _id: string;
  name: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  img: string;
  images: string[];
  category: string;
  colors: ColorEntry[];
  sizes: string[];
  description: string;
  details: string[];
  careInstructions: string[];
  createdAt: string;
}

type ToastType = "success" | "error" | "info";
interface Toast { id: number; msg: string; type: ToastType; }

const BLANK: Omit<Product, "_id" | "createdAt"> = {
  name: "", price: "", originalPrice: "", badge: "",
  img: "", images: [], category: "", colors: [], sizes: [],
  description: "", details: [], careInstructions: [],
};

// ─── Image Upload Helper ──────────────────────────────────────────────────────
async function uploadToCloudinary(file: File, apiBase: string): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`${apiBase}/api/upload`, { method: "POST", body: formData });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${response.status} – ${text}`);
  }
  const data = await response.json();
  const url = data.imageUrl ?? data.url ?? data.secure_url ?? "";
  if (!url) throw new Error("Server did not return an image URL");
  return url as string;
}

// ─── CategorySelect ───────────────────────────────────────────────────────────
interface CategorySelectProps {
  value: string;
  existingCategories: string[];
  onChange: (val: string) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value, existingCategories, onChange,
}) => {
  const [mode, setMode] = useState<"select" | "new">(
    // If the current value is already in the list (or empty), use select mode
    value === "" || existingCategories.includes(value) ? "select" : "new"
  );
  const [newVal, setNewVal] = useState(mode === "new" ? value : "");
  const newInputRef = useRef<HTMLInputElement>(null);

  // Switch to new mode and focus the input
  const switchToNew = () => {
    setMode("new");
    setNewVal("");
    onChange("");
    setTimeout(() => newInputRef.current?.focus(), 50);
  };

  // Switch back to select mode
  const switchToSelect = () => {
    setMode("select");
    setNewVal("");
    onChange("");
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "__new__") {
      switchToNew();
    } else {
      onChange(v);
    }
  };

  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewVal(e.target.value);
    onChange(e.target.value);
  };

  if (mode === "new") {
    return (
      <div className="pm-cat-new-wrap">
        <input
          ref={newInputRef}
          className="pm-input pm-cat-new-input"
          placeholder="Type new category name…"
          value={newVal}
          onChange={handleNewChange}
        />
        {existingCategories.length > 0 && (
          <button
            type="button"
            className="pm-cat-back-btn"
            onClick={switchToSelect}
            title="Pick from existing categories"
          >
            ← Existing
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pm-cat-select-wrap">
      <select
        className="pm-input pm-cat-select"
        value={value}
        onChange={handleSelectChange}
      >
        <option value="">— Select a category —</option>
        {existingCategories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
        <option value="__new__">＋ Add new category…</option>
      </select>
    </div>
  );
};

// ─── ImageField ───────────────────────────────────────────────────────────────
interface ImageFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (url: string) => void;
  onUploading?: (state: boolean) => void;
  showToast: (msg: string, type: ToastType) => void;
  apiBase: string;
  placeholder?: string;
}

const ImageField: React.FC<ImageFieldProps> = ({
  label, required, value, onChange, onUploading, showToast, apiBase, placeholder,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    onUploading?.(true);
    showToast("Uploading image…", "info");
    try {
      const url = await uploadToCloudinary(file, apiBase);
      onChange(url);
      showToast("Image uploaded!", "success");
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setUploading(false);
      onUploading?.(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div className="pm-form-group">
      <label className="pm-label">
        {label} {required && <span className="pm-req">*</span>}
      </label>
      <input
        className="pm-input"
        placeholder={placeholder ?? "Paste image URL (https://…)"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={uploading}
      />
      <div
        className={`pm-upload-box${uploading ? " uploading" : ""}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }}
        />
        <div className="pm-upload-content">
          {uploading
            ? <><span className="pm-upload-spinner" /><span className="pm-upload-text">Uploading…</span></>
            : <><span className="pm-upload-icon">📤</span><span className="pm-upload-text">Click or drag & drop to upload</span></>
          }
        </div>
      </div>
      {value && (
        <div className="pm-upload-preview">
          <img src={value} alt="Preview" onError={(e) => (e.currentTarget.style.display = "none")} />
          <button
            className="pm-preview-remove"
            title="Remove image"
            onClick={(e) => { e.preventDefault(); onChange(""); }}
          >✕</button>
        </div>
      )}
    </div>
  );
};

// ─── MultiImageField ──────────────────────────────────────────────────────────
interface MultiImageFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
  showToast: (msg: string, type: ToastType) => void;
  apiBase: string;
}

const MultiImageField: React.FC<MultiImageFieldProps> = ({
  images, onChange, showToast, apiBase,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleFiles = async (files: FileList) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setUploading(true);
    setUploadingCount(imageFiles.length);
    showToast(`Uploading ${imageFiles.length} image(s)…`, "info");
    const results: string[] = [];
    let failed = 0;
    for (const file of imageFiles) {
      try { results.push(await uploadToCloudinary(file, apiBase)); }
      catch { failed++; }
    }
    if (results.length) onChange([...images, ...results]);
    if (failed) showToast(`${failed} image(s) failed to upload`, "error");
    else showToast(`${results.length} image(s) uploaded!`, "success");
    setUploading(false);
    setUploadingCount(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const setUrl    = (i: number, v: string) => { const a = [...images]; a[i] = v; onChange(a); };
  const addRow    = () => onChange([...images, ""]);
  const removeRow = (i: number) => onChange(images.filter((_, j) => j !== i));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="pm-form-section">
      <div className="pm-section-title">Additional Images (Gallery)</div>
      {images.map((img, i) => (
        <div className="pm-img-row" key={i}>
          <div className="pm-img-preview">
            {img
              ? <img src={img} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
              : <span>🖼</span>}
          </div>
          <input
            className="pm-input"
            placeholder={`Gallery image ${i + 1} URL`}
            value={img}
            onChange={(e) => setUrl(i, e.target.value)}
          />
          <button className="pm-rm-btn" onClick={() => removeRow(i)}>✕</button>
        </div>
      ))}
      <div
        className={`pm-upload-box pm-upload-multi${uploading ? " uploading" : ""}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }}
        />
        <div className="pm-upload-content">
          {uploading
            ? <><span className="pm-upload-spinner" /><span className="pm-upload-text">Uploading {uploadingCount} image(s)…</span></>
            : <><span className="pm-upload-icon">🖼️</span><span className="pm-upload-text">Select multiple images from gallery</span><span className="pm-upload-hint">Or drag & drop · Ctrl+click to select many</span></>
          }
        </div>
      </div>
      <button className="pm-add-row-btn" onClick={addRow}>+ Add URL manually</button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductManage: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editId,       setEditId]       = useState<string | null>(null);
  const [form,         setForm]         = useState({ ...BLANK });
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toasts,    setToasts]    = useState<Toast[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [mainImgUploading, setMainImgUploading] = useState(false);
  const toastId = useRef(0);

  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/products`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setProducts(await r.json());
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, showToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Derive unique categories from existing products
  const existingCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const filterCategories   = ["all", ...existingCategories];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchC = catFilter === "all" || p.category === catFilter;
    return matchQ && matchC;
  });

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditId(null);
    setForm({ ...BLANK, images: [], colors: [], sizes: [], details: [], careInstructions: [] });
    setSizeInput("");
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p._id);
    setForm({
      name: p.name, price: p.price, originalPrice: p.originalPrice || "",
      badge: p.badge || "", img: p.img, images: [...(p.images || [])],
      category: p.category,
      colors: p.colors ? p.colors.map((c) => ({ ...c })) : [],
      sizes: [...(p.sizes || [])], description: p.description,
      details: [...(p.details || [])], careInstructions: [...(p.careInstructions || [])],
    });
    setSizeInput("");
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditId(null); };

  const setF = (key: keyof typeof BLANK, val: unknown) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const addColor = () => setF("colors", [...form.colors, { label: "", hex: "#000000" }]);
  const setColorField = (i: number, field: "label" | "hex", v: string) =>
    setF("colors", form.colors.map((c, j) => (j === i ? { ...c, [field]: v } : c)));
  const removeColor = (i: number) => setF("colors", form.colors.filter((_, j) => j !== i));

  const addSize = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = sizeInput.trim().toUpperCase();
      if (v && !form.sizes.includes(v)) setF("sizes", [...form.sizes, v]);
      setSizeInput("");
    }
  };
  const removeSize = (s: string) => setF("sizes", form.sizes.filter((x) => x !== s));

  const setListItem = (key: "details" | "careInstructions", i: number, v: string) => {
    const a = [...(form[key] as string[])]; a[i] = v; setF(key, a);
  };
  const addListItem    = (key: "details" | "careInstructions") => setF(key, [...(form[key] as string[]), ""]);
  const removeListItem = (key: "details" | "careInstructions", i: number) =>
    setF(key, (form[key] as string[]).filter((_, j) => j !== i));

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name || !form.price || !form.img || !form.category || !form.description) {
      showToast("Please fill all required fields", "error"); return;
    }
    if (mainImgUploading) {
      showToast("Please wait for image upload to finish", "info"); return;
    }
    setSaving(true);
    const payload = {
      ...form,
      images: form.images.filter(Boolean),
      details: form.details.filter(Boolean),
      careInstructions: form.careInstructions.filter(Boolean),
    };
    try {
      const r = await fetch(
        editId ? `${API_BASE}/api/products/${editId}` : `${API_BASE}/api/products`,
        { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      showToast(editId ? "Product updated!" : "Product created!", "success");
      closeModal();
      fetchProducts();
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = (id: string) => { setDeleteTarget(id); setConfirmOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const r = await fetch(`${API_BASE}/api/products/${deleteTarget}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      showToast("Product deleted", "success");
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget));
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="pm-page">
      <div className="pm-content">

        {/* PAGE HEADER */}
        <div className="pm-page-hd">
          <div>
            <h1 className="pm-page-title">Products</h1>
            <p className="pm-page-sub">Manage inventory · {products.length} total</p>
          </div>
          <div className="pm-page-actions">
            <button className="pm-btn ghost" onClick={fetchProducts}>🔄 Refresh</button>
            <button className="pm-btn gold"  onClick={openAdd}>+ Add Product</button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="pm-toolbar">
          <div className="pm-search-wrap">
            <span className="pm-search-ico">🔍</span>
            <input
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="pm-filter-select"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            {filterCategories.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
            ))}
          </select>
          <span className="pm-results-info">{filtered.length} / {products.length}</span>
        </div>

        {/* GRID */}
        <div className="pm-grid">
          {loading ? (
            <div className="pm-loading-state">
              <div className="pm-spin" />
              <div className="pm-load-text">Loading products…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="pm-empty-state">
              <div className="pm-empty-icon">👕</div>
              <div className="pm-empty-title">
                {search || catFilter !== "all" ? "No results found" : "No products yet"}
              </div>
              <div className="pm-empty-desc">
                {search || catFilter !== "all"
                  ? "Try a different search or filter."
                  : "Start by adding your first product."}
              </div>
              {!search && catFilter === "all" && (
                <button className="pm-btn gold" onClick={openAdd}>+ Add Product</button>
              )}
            </div>
          ) : (
            filtered.map((p) => (
              <div className="pm-card" key={p._id}>
                <div className="pm-card-img-wrap">
                  {p.img
                    ? <img src={p.img} alt={p.name} />
                    : <div className="pm-img-placeholder">👕</div>}
                  {p.badge && <div className="pm-card-badge">{p.badge}</div>}
                  <div className="pm-card-overlay">
                    <button className="pm-ov-btn"     title="Edit"   onClick={() => openEdit(p)}>✏️</button>
                    <button className="pm-ov-btn del" title="Delete" onClick={() => confirmDelete(p._id)}>🗑️</button>
                  </div>
                </div>

                <div className="pm-card-body">
                  <div className="pm-card-cat">{p.category}</div>
                  <div className="pm-card-name">{p.name}</div>
                  <div className="pm-card-pricing">
                    <span className="pm-card-price">{p.price}</span>
                    {p.originalPrice && <span className="pm-card-orig">{p.originalPrice}</span>}
                  </div>
                  {p.colors && p.colors.length > 0 && (
                    <div className="pm-card-swatches">
                      {p.colors.slice(0, 5).map((c, i) => (
                        <span key={i} className="pm-swatch" style={{ background: c.hex }} title={c.label} />
                      ))}
                      {p.colors.length > 5 && <span className="pm-swatch-more">+{p.colors.length - 5}</span>}
                    </div>
                  )}
                </div>

                <div className="pm-card-foot">
                  <div className="pm-size-tags">
                    {(p.sizes || []).slice(0, 4).map((s) => (
                      <span key={s} className="pm-size-tag">{s}</span>
                    ))}
                    {(p.sizes || []).length > 4 && <span className="pm-size-tag">+{p.sizes.length - 4}</span>}
                  </div>
                  <div className="pm-img-count">🖼 {1 + (p.images?.length || 0)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      <div className={`pm-overlay${modalOpen ? " open" : ""}`} onClick={closeModal}>
        <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="pm-modal-hd">
            <div className="pm-modal-title">{editId ? "Edit Product" : "New Product"}</div>
            <button className="pm-modal-close" onClick={closeModal}>✕</button>
          </div>

          <div className="pm-modal-body">
            <div className="pm-form-grid">

              <div className="pm-form-group">
                <label className="pm-label">Name <span className="pm-req">*</span></label>
                <input
                  className="pm-input"
                  placeholder="e.g. Classic Linen Shirt"
                  value={form.name}
                  onChange={(e) => setF("name", e.target.value)}
                />
              </div>

              {/* ── Category with dropdown + new option ── */}
              <div className="pm-form-group">
                <label className="pm-label">
                  Category <span className="pm-req">*</span>
                </label>
                <CategorySelect
                  value={form.category}
                  existingCategories={existingCategories}
                  onChange={(val) => setF("category", val)}
                />
                {/* Show the resolved value as a pill when something is selected */}
                {form.category && (
                  <div className="pm-cat-preview">
                    <span className="pm-cat-pill">{form.category}</span>
                    {existingCategories.includes(form.category)
                      ? <span className="pm-cat-hint existing">existing</span>
                      : <span className="pm-cat-hint new-cat">new category</span>
                    }
                  </div>
                )}
              </div>

              <div className="pm-form-group">
                <label className="pm-label">Price <span className="pm-req">*</span></label>
                <input
                  className="pm-input"
                  placeholder="₹1,299"
                  value={form.price}
                  onChange={(e) => setF("price", e.target.value)}
                />
              </div>

              <div className="pm-form-group">
                <label className="pm-label">Original Price</label>
                <input
                  className="pm-input"
                  placeholder="₹1,999 (strike-through)"
                  value={form.originalPrice}
                  onChange={(e) => setF("originalPrice", e.target.value)}
                />
              </div>

              <div className="pm-form-group">
                <label className="pm-label">Badge</label>
                <input
                  className="pm-input"
                  placeholder="SALE, NEW, HOT…"
                  value={form.badge}
                  onChange={(e) => setF("badge", e.target.value)}
                />
              </div>

              <div className="pm-form-group pm-form-full">
                <label className="pm-label">Description <span className="pm-req">*</span></label>
                <textarea
                  className="pm-textarea"
                  placeholder="Product description…"
                  value={form.description}
                  onChange={(e) => setF("description", e.target.value)}
                />
              </div>

              <div className="pm-form-full">
                <ImageField
                  label="Main Product Image"
                  required
                  value={form.img}
                  onChange={(url) => setF("img", url)}
                  onUploading={setMainImgUploading}
                  showToast={showToast}
                  apiBase={API_BASE}
                  placeholder="Paste main image URL (https://…)"
                />
              </div>

              <MultiImageField
                images={form.images}
                onChange={(imgs) => setF("images", imgs)}
                showToast={showToast}
                apiBase={API_BASE}
              />

              {/* Colors */}
              <div className="pm-form-section">
                <div className="pm-section-title">Colors</div>
                {form.colors.map((c, i) => (
                  <div className="pm-color-row" key={i}>
                    <div className="pm-color-swatch" style={{ background: c.hex }}>
                      <input type="color" value={c.hex} onChange={(e) => setColorField(i, "hex", e.target.value)} />
                    </div>
                    <input className="pm-input" placeholder="Label (e.g. Midnight Black)" value={c.label} onChange={(e) => setColorField(i, "label", e.target.value)} />
                    <input className="pm-input pm-hex-in" placeholder="#000000" value={c.hex} onChange={(e) => setColorField(i, "hex", e.target.value)} />
                    <button className="pm-rm-btn" onClick={() => removeColor(i)}>✕</button>
                  </div>
                ))}
                <button className="pm-add-row-btn" onClick={addColor}>+ Add Color</button>
              </div>

              {/* Sizes */}
              <div className="pm-form-section">
                <div className="pm-section-title">Sizes</div>
                <div className="pm-tags-wrap" onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}>
                  {form.sizes.map((s) => (
                    <span key={s} className="pm-size-chip">
                      {s}<span className="pm-chip-x" onClick={() => removeSize(s)}>✕</span>
                    </span>
                  ))}
                  <input
                    className="pm-tag-input"
                    placeholder="Type size + Enter"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={addSize}
                  />
                </div>
                <div className="pm-hint">Press Enter or comma to add a size</div>
              </div>

              {/* Details */}
              <div className="pm-form-section">
                <div className="pm-section-title">Product Details</div>
                {form.details.map((d, i) => (
                  <div className="pm-img-row" key={i}>
                    <input className="pm-input" placeholder={`Detail ${i + 1}`} value={d} onChange={(e) => setListItem("details", i, e.target.value)} />
                    <button className="pm-rm-btn" onClick={() => removeListItem("details", i)}>✕</button>
                  </div>
                ))}
                <button className="pm-add-row-btn" onClick={() => addListItem("details")}>+ Add Detail</button>
              </div>

              {/* Care Instructions */}
              <div className="pm-form-section">
                <div className="pm-section-title">Care Instructions</div>
                {form.careInstructions.map((c, i) => (
                  <div className="pm-img-row" key={i}>
                    <input className="pm-input" placeholder={`Care step ${i + 1}`} value={c} onChange={(e) => setListItem("careInstructions", i, e.target.value)} />
                    <button className="pm-rm-btn" onClick={() => removeListItem("careInstructions", i)}>✕</button>
                  </div>
                ))}
                <button className="pm-add-row-btn" onClick={() => addListItem("careInstructions")}>+ Add Care Instruction</button>
              </div>

            </div>
          </div>

          <div className="pm-modal-ft">
            <button className="pm-btn ghost" onClick={closeModal}>Cancel</button>
            <button
              className="pm-btn gold"
              onClick={handleSave}
              disabled={saving || mainImgUploading}
            >
              {saving ? "Saving…" : mainImgUploading ? "Uploading…" : editId ? "Update Product" : "Create Product"}
            </button>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRM ── */}
      <div className={`pm-overlay${confirmOpen ? " open" : ""}`}>
        <div className="pm-modal pm-confirm-modal">
          <div className="pm-modal-body">
            <div className="pm-confirm-ico">🗑️</div>
            <div className="pm-confirm-title">Delete Product?</div>
            <div className="pm-confirm-msg">
              This action cannot be undone. The product will be permanently removed from your store.
            </div>
          </div>
          <div className="pm-modal-ft">
            <button className="pm-btn ghost"  onClick={() => setConfirmOpen(false)}>Cancel</button>
            <button className="pm-btn danger" onClick={handleDelete}>Yes, Delete</button>
          </div>
        </div>
      </div>

      {/* ── TOASTS ── */}
      <div className="pm-toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`pm-toast ${t.type}`}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManage;
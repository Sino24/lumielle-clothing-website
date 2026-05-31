// src/pages/ProductDetail.tsx

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/PageStyle/ProductDetail.css";
import { useCart } from "../context/CartContext";
import { PageSkeleton } from "../components/SkeletonLoader";

interface ColorEntry {
  label: string;
  hex: string;
}

interface ProductData {
  _id: string;
  name: string;
  price: string;
  originalPrice?: string;
  badge?: string | null;
  category: string;
  description: string;
  details: string[];
  careInstructions: string[];
  colors: ColorEntry[];
  sizes: string[];
  images: string[];
  img: string;
}

type PageState = "loading" | "found" | "notfound";

// ── Share Menu Component ────────────────────────────────────────────────────
function ShareMenu({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUrl = window.location.href;
  const shareText = `Check out ${productName} on Lumielle`;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1800);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = currentUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1800);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleInstagram = async () => {
    // Instagram doesn't support direct URL sharing via web;
    // copy the link so user can paste it in their story/bio/DM
    try {
      await navigator.clipboard.writeText(currentUrl);
    } catch {
      /* noop */
    }
    window.open("https://www.instagram.com", "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: currentUrl,
        });
        setOpen(false);
      } catch {
        /* user cancelled */
      }
    }
  };

  const hasNativeShare = Boolean(navigator.share);

  return (
    <div className="pd__share-wrap" ref={menuRef}>
      <button
        className="pd__share-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Share this product"
        aria-expanded={open}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>

      {open && (
        <div className="pd__share-dropdown" role="menu">
          <button
            className={`pd__share-item ${copied ? "pd__share-item--copied" : ""}`}
            onClick={handleCopyLink}
            role="menuitem"
          >
            {copied ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Link copied!
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy link
              </>
            )}
          </button>

          <button className="pd__share-item" onClick={handleWhatsApp} role="menuitem">
            {/* WhatsApp icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.528 5.855L0 24l6.335-1.51A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.807 9.807 0 01-5.001-1.371l-.36-.214-3.727.888.926-3.638-.234-.374A9.784 9.784 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
            </svg>
            WhatsApp
          </button>

          <button className="pd__share-item" onClick={handleInstagram} role="menuitem">
            {/* Instagram icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Instagram
            <span className="pd__share-item-hint">(copies link)</span>
          </button>

          {hasNativeShare && (
            <>
              <div className="pd__share-divider" />
              <button className="pd__share-item" onClick={handleNativeShare} role="menuitem">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                More options
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
function ProductDetail() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { addToCart } = useCart();

  const [pageState, setPageState]         = useState<PageState>("loading");
  const [product, setProduct]             = useState<ProductData | null>(null);
  const [related, setRelated]             = useState<ProductData[]>([]);

  const [activeImg, setActiveImg]         = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize]   = useState<string | null>(null);
  const [qty, setQty]                     = useState(1);
  const [openTab, setOpenTab]             = useState<"details" | "care">("details");
  const [addedToCart, setAddedToCart]     = useState(false);

  useEffect(() => {
    if (!id) {
      setPageState("notfound");
      return;
    }

    setPageState("loading");
    setActiveImg(0);
    setSelectedColor(0);
    setSelectedSize(null);
    setQty(1);

    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setPageState("notfound");
          return;
        }

        const data: ProductData = await res.json();

        const allRes = await fetch(`${API_BASE}/api/products`, {
          signal: controller.signal,
        });
        const allProducts: ProductData[] = await allRes.json();

        const relatedProducts = allProducts
          .filter((p) => p.category === data.category && p._id !== data._id)
          .slice(0, 3);

        setProduct(data);
        setRelated(relatedProducts);
        setPageState("found");

      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error(error);
        setPageState("notfound");
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, [id, API_BASE]);

  const handleAddToCart = useCallback(() => {
    if (!selectedSize || !product) return;
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      img: product.img,
      size: selectedSize,
      quantity: qty,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  }, [selectedSize, product, qty, addToCart]);

  const handleGoToCart = useCallback(() => {
    if (selectedSize && product) {
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        img: product.img,
        size: selectedSize,
        quantity: qty,
      });
    }
    navigate("/cart");
  }, [selectedSize, product, qty, addToCart, navigate]);

  if (pageState === "loading") return <PageSkeleton />;

  if (pageState === "notfound" || !product) {
    return (
      <main className="pd-missing">
        <p>Product not found.</p>
        <Link to="/products">← Back to collection</Link>
      </main>
    );
  }

  const allImages =
    product.images && product.images.length > 0
      ? [product.img, ...product.images]
      : [product.img];

  const currentImageUrl = allImages[activeImg];

  const savingAmount = (() => {
    if (!product.originalPrice) return null;
    const orig = parseInt(product.originalPrice.replace(/[₹,\s]/g, ""), 10);
    const curr = parseInt(product.price.replace(/[₹,\s]/g, ""), 10);
    if (isNaN(orig) || isNaN(curr)) return null;
    return (orig - curr).toLocaleString("en-IN");
  })();

  return (
    <main className="pd">

      {/* ── Breadcrumb ── */}
      <nav className="pd__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">·</span>
        <Link to="/product">Collection</Link>
        <span aria-hidden="true">·</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="pd__layout">

        {/* ── Gallery ── */}
        <div className="pd__gallery">
          <div className="pd__main-img-wrap">
            <img
              key={currentImageUrl}
              src={currentImageUrl}
              alt={product.name}
              className="pd__main-img"
            />
            {product.badge && (
              <span
                className={`pd__badge pd__badge--${product.badge
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {product.badge}
              </span>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="pd__thumbs" role="list">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  role="listitem"
                  className={`pd__thumb ${activeImg === i ? "pd__thumb--active" : ""}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

          {allImages.length > 1 && (
            <div className="pd__dots" aria-hidden="true">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  className={`pd__dot ${activeImg === i ? "pd__dot--active" : ""}`}
                  onClick={() => setActiveImg(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Info panel ── */}
        <div className="pd__info">

          {/* Category row + share button */}
          <div className="pd__meta-row">
            <p className="pd__category">{product.category}</p>
            <ShareMenu productName={product.name} />
          </div>

          <h1 className="pd__name">{product.name}</h1>

          <div className="pd__pricing">
            <span className="pd__price">{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="pd__original">{product.originalPrice}</span>
                {savingAmount && (
                  <span className="pd__saving">Save ₹{savingAmount}</span>
                )}
              </>
            )}
          </div>

          <p className="pd__tax-note">
            Inclusive of all taxes · Free shipping above ₹999
          </p>

          <div className="pd__rule" />

          <p className="pd__description">{product.description}</p>

          {product.colors && product.colors.length > 0 && (
            <div className="pd__option-group">
              <p className="pd__option-label">
                Colour —
                <span className="pd__option-value">
                  {" "}{product.colors[selectedColor]?.label}
                </span>
              </p>
              <div className="pd__colors">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    className={`pd__color-swatch ${
                      selectedColor === i ? "pd__color-swatch--active" : ""
                    }`}
                    style={{ background: c.hex }}
                    onClick={() => setSelectedColor(i)}
                    title={c.label}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="pd__option-group">
              <p className="pd__option-label">
                Size
                {selectedSize && (
                  <span className="pd__option-value"> — {selectedSize}</span>
                )}
              </p>
              <div className="pd__sizes">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`pd__size-btn ${
                      selectedSize === size ? "pd__size-btn--active" : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="pd__size-hint">Please select a size to continue</p>
              )}
            </div>
          )}

          <div className="pd__actions">
            <div className="pd__actions-primary">
              <div className="pd__qty">
                <button
                  className="pd__qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="pd__qty-value">{qty}</span>
                <button
                  className="pd__qty-btn"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className={`pd__add-btn ${
                  addedToCart ? "pd__add-btn--success" : ""
                } ${!selectedSize ? "pd__add-btn--disabled" : ""}`}
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                {addedToCart ? "✓ Added to Cart" : "Add to Cart"}
              </button>
            </div>

            <button className="pd__go-cart-btn" onClick={handleGoToCart}>
              Go to Cart →
            </button>
          </div>

          <div className="pd__tabs">
            <div className="pd__tab-headers">
              <button
                className={`pd__tab-btn ${
                  openTab === "details" ? "pd__tab-btn--active" : ""
                }`}
                onClick={() => setOpenTab("details")}
              >
                Product Details
              </button>
              <button
                className={`pd__tab-btn ${
                  openTab === "care" ? "pd__tab-btn--active" : ""
                }`}
                onClick={() => setOpenTab("care")}
              >
                Care Instructions
              </button>
            </div>

            <div className="pd__tab-content">
              {openTab === "details" && (
                <ul className="pd__detail-list">
                  {product.details?.map((d, i) => (
                    <li key={i}>
                      <span className="pd__detail-dot">—</span>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
              {openTab === "care" && (
                <ul className="pd__detail-list">
                  {product.careInstructions?.map((c, i) => (
                    <li key={i}>
                      <span className="pd__detail-dot">—</span>
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Related ── */}
      {related.length > 0 && (
        <section className="pd__related">
          <span className="pd__related-eyebrow">You might also like</span>
          <h2 className="pd__related-title">
            From the same <em>collection</em>
          </h2>
          <div className="pd__related-grid">
            {related.map((rp) => (
              <article
                key={rp._id}
                className="pd__related-card"
                onClick={() => {
                  navigate(`/products/${rp._id}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <div className="pd__related-img-wrap">
                  <img src={rp.img} alt={rp.name} />
                  {rp.badge && (
                    <span
                      className={`pd__badge pd__badge--${rp.badge
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {rp.badge}
                    </span>
                  )}
                </div>
                <div className="pd__related-info">
                  <span className="pd__related-name">{rp.name}</span>
                  <span className="pd__related-price">{rp.price}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}

export default ProductDetail;
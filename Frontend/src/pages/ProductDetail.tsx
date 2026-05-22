// src/pages/ProductDetail.tsx

import { useEffect, useState, useCallback } from "react";
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

// Three explicit states — no ambiguity between "loading" and "not found"
type PageState = "loading" | "found" | "notfound";

function ProductDetail() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { addToCart } = useCart();

  // ── Single state enum drives the render — no race between booleans ──
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

    // ── Reset UI and set loading FIRST — before any async work ──
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

        // Set product + related together, then flip state to "found"
        // so the component never renders product content with stale/null data
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

  // ── Handlers defined before early returns (rules of hooks) ──
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

  // ── Render guards — ordered by the single enum, no boolean conflicts ──
  if (pageState === "loading") return <PageSkeleton />;

  if (pageState === "notfound" || !product) {
    return (
      <main className="pd-missing">
        <p>Product not found.</p>
        <Link to="/products">← Back to collection</Link>
      </main>
    );
  }

  // pageState === "found" && product is guaranteed non-null below

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

          <p className="pd__category">{product.category}</p>
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
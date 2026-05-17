// src/pages/ProductDetail.tsx

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/PageStyle/ProductDetail.css";
import { useCart } from "../context/CartContext";

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

function ProductDetail() {
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct]   = useState<ProductData | null>(null);
  const [related, setRelated]   = useState<ProductData[]>([]);
  const [loading, setLoading]   = useState(true);

  const [activeImg,      setActiveImg]      = useState(0);
  const [selectedColor,  setSelectedColor]  = useState(0);
  const [selectedSize,   setSelectedSize]   = useState<string | null>(null);
  const [qty,            setQty]            = useState(1);
  const [openTab,        setOpenTab]        = useState<"details" | "care">("details");
  const [addedToCart,    setAddedToCart]    = useState(false);
  const [zoomActive,     setZoomActive]     = useState(false);
  const [zoomPos,        setZoomPos]        = useState({ x: 50, y: 50 });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);

        const allRes = await fetch(`${API_BASE}/api/products`);
        const allProducts = await allRes.json();
        const relatedProducts = allProducts
          .filter(
            (p: ProductData) =>
              p.category === data.category && p._id !== data._id
          )
          .slice(0, 3);
        setRelated(relatedProducts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ── Add to Cart ───────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!selectedSize || !product) return;

    addToCart({
      _id:      product._id,
      name:     product.name,
      price:    product.price,
      img:      product.img,
      size:     selectedSize,
      quantity: qty,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  // ── Go to Cart ────────────────────────────────────────────────────────
  const handleGoToCart = () => {
    if (selectedSize && product) {
      addToCart({
        _id:      product._id,
        name:     product.name,
        price:    product.price,
        img:      product.img,
        size:     selectedSize,
        quantity: qty,
      });
    }
    navigate("/cart");
  };

  // ── Zoom ──────────────────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (loading) {
    return (
      <main className="pd-missing">
        <div className="pd-missing__spin" />
      </main>
    );
  }

  if (!product) {
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

  return (
    <main className="pd">

      {/* Breadcrumb */}
      <nav className="pd__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">·</span>
        <Link to="/products">Collection</Link>
        <span aria-hidden="true">·</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="pd__layout">

        {/* ── Gallery ── */}
        <div className="pd__gallery">

          {/* Thumbnails */}
          <div className="pd__thumbs" role="list">
            {allImages.map((img, i) => (
              <button
                key={i}
                role="listitem"
                className={`pd__thumb ${activeImg === i ? "pd__thumb--active" : ""}`}
                onClick={() => { setActiveImg(i); setZoomActive(false); }}
              >
                <img src={img} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>

          {/* Main image + zoom */}
          <div
            className="pd__main-img-wrap"
            onMouseEnter={() => setZoomActive(true)}
            onMouseLeave={() => setZoomActive(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              key={currentImageUrl}
              src={currentImageUrl}
              alt={product.name}
              className={`pd__main-img ${zoomActive ? "pd__main-img--faded" : ""}`}
            />

            <div
              className={`pd__zoom-overlay ${zoomActive ? "pd__zoom-overlay--active" : ""}`}
              style={{
                backgroundImage: `url("${currentImageUrl}")`,
                backgroundSize: "250%",
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundRepeat: "no-repeat",
              }}
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

            <span
              className={`pd__zoom-hint ${zoomActive ? "pd__zoom-hint--hidden" : ""}`}
            >
              Hover to zoom
            </span>
          </div>

          {/* Mobile dots */}
          <div className="pd__dots">
            {allImages.map((_, i) => (
              <button
                key={i}
                className={`pd__dot ${activeImg === i ? "pd__dot--active" : ""}`}
                onClick={() => setActiveImg(i)}
              />
            ))}
          </div>
        </div>

        {/* ── Info panel ── */}
        <div className="pd__info">

          <p className="pd__category">{product.category}</p>
          <h1 className="pd__name">{product.name}</h1>

          {/* Pricing */}
          <div className="pd__pricing">
            <span className="pd__price">{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="pd__original">{product.originalPrice}</span>
                <span className="pd__saving">
                  Save ₹
                  {(
                    parseInt(product.originalPrice.replace(/[₹,]/g, "")) -
                    parseInt(product.price.replace(/[₹,]/g, ""))
                  ).toLocaleString("en-IN")}
                </span>
              </>
            )}
          </div>

          <p className="pd__tax-note">
            Inclusive of all taxes · Free shipping above ₹999
          </p>

          <div className="pd__rule" />

          <p className="pd__description">{product.description}</p>

          {/* Colors */}
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
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pd__option-group">
              <div className="pd__size-header">
                <p className="pd__option-label">
                  Size
                  {selectedSize && (
                    <span className="pd__option-value"> — {selectedSize}</span>
                  )}
                </p>
              </div>
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
                <p className="pd__size-hint">Please select a size</p>
              )}
            </div>
          )}

          {/* ── Actions ── */}
          <div className="pd__actions">

            {/* Row 1: Qty + Add to Cart */}
            <div className="pd__actions-primary">
              <div className="pd__qty">
                <button
                  className="pd__qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="pd__qty-value">{qty}</span>
                <button
                  className="pd__qty-btn"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <button
                className={`pd__add-btn ${addedToCart ? "pd__add-btn--success" : ""} ${
                  !selectedSize ? "pd__add-btn--disabled" : ""
                }`}
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                {addedToCart ? "✓ Added" : "Add to Cart"}
              </button>
            </div>

            {/* Row 2: Go to Cart — full width */}
            <button
              className="pd__go-cart-btn"
              onClick={handleGoToCart}
            >
              Go to Cart →
            </button>

          </div>

          {/* Tabs */}
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

      {/* Related */}
      {related.length > 0 && (
        <section className="pd__related">
          <p className="pd__related-eyebrow">You might also like</p>
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
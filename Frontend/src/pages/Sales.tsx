// src/pages/Sales.tsx

import { useEffect, useState, useMemo, } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/PageStyle/Sales.css";
import { PageSkeleton } from "../components/SkeletonLoader";

interface ColorEntry {
  label: string;
  hex: string;
}

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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Countdown Timer ────────────────────────────────────────────────────────
function useCountdown(targetDate: Date) {
  const calc = () => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86_400_000),
      hours:   Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000)  / 60_000),
      seconds: Math.floor((diff % 60_000)     / 1_000),
    };
  };

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc), 1000);
    return () => clearInterval(id);
  });
  return time;
}

// ── Offer coupon card ──────────────────────────────────────────────────────
interface CouponProps {
  code: string;
  label: string;
  description: string;
  minOrder?: string;
}

function CouponCard({ code, label, description, minOrder }: CouponProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="sales__coupon">
      <div className="sales__coupon-left">
        <span className="sales__coupon-label">{label}</span>
        <p className="sales__coupon-desc">{description}</p>
        {minOrder && (
          <p className="sales__coupon-min">Min. order {minOrder}</p>
        )}
      </div>
      <div className="sales__coupon-right">
        <span className="sales__coupon-code">{code}</span>
        <button
          className={`sales__coupon-copy ${copied ? "sales__coupon-copy--done" : ""}`}
          onClick={handleCopy}
          aria-label={`Copy coupon code ${code}`}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
function Sales() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sale ends in 3 days from now (replace with a real date in production)
  const saleEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 59, 0);
    return d;
  }, []);

  const countdown = useCountdown(saleEnd);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data: Product[] = await res.json();
        // Filter only products that have an originalPrice (i.e. on sale)
        const onSale = data.filter((p) => p.originalPrice);
        setProducts(onSale);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaleProducts();
  }, []);

  const discountPercent = (product: Product): number | null => {
    if (!product.originalPrice) return null;
    const orig = parseInt(product.originalPrice.replace(/[₹,\s]/g, ""), 10);
    const curr = parseInt(product.price.replace(/[₹,\s]/g, ""), 10);
    if (isNaN(orig) || isNaN(curr) || orig === 0) return null;
    return Math.round(((orig - curr) / orig) * 100);
  };

  const coupons: CouponProps[] = [
    {
      code: "LUMIELLE10",
      label: "10% Off",
      description: "On your first order",
      minOrder: "₹999",
    },
    {
      code: "SALE20",
      label: "Flat 20% Off",
      description: "On all sale items",
      minOrder: "₹1,499",
    },
    {
      code: "FREESHIP",
      label: "Free Shipping",
      description: "On orders above ₹999",
    },
  ];

  return (
    <main className="sales">

      {/* ── Hero ── */}
      <section className="sales__hero">
        <div className="sales__hero-inner">
          <p className="sales__eyebrow">Limited Time</p>
          <h1 className="sales__hero-title">
            The<br /><em>Season Sale</em>
          </h1>
          <p className="sales__hero-sub">
            Curated pieces at their best prices — thoughtfully reduced, never
            compromised.
          </p>
          <a href="#sale-grid" className="sales__hero-cta">
            Shop the Sale
          </a>
        </div>

        {/* Countdown */}
        <div className="sales__countdown-wrap">
          <p className="sales__countdown-label">Sale ends in</p>
          <div className="sales__countdown">
            {(
              [
                { value: countdown.days,    unit: "Days"    },
                { value: countdown.hours,   unit: "Hrs"     },
                { value: countdown.minutes, unit: "Min"     },
                { value: countdown.seconds, unit: "Sec"     },
              ] as const
            ).map(({ value, unit }, i) => (
              <div key={unit} className="sales__tick">
                <span className="sales__tick-num">
                  {String(value).padStart(2, "0")}
                </span>
                <span className="sales__tick-unit">{unit}</span>
                {i < 3 && <span className="sales__tick-sep" aria-hidden="true">:</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Coupons ── */}
      <section className="sales__coupons-section" aria-label="Discount codes">
        <p className="sales__section-eyebrow">Exclusive Offers</p>
        <h2 className="sales__section-title">Use a code at checkout</h2>
        <div className="sales__coupons-grid">
          {coupons.map((c) => (
            <CouponCard key={c.code} {...c} />
          ))}
        </div>
      </section>

      {/* ── Sale Grid ── */}
      <section
        className="sales__grid-section"
        id="sale-grid"
        aria-label="Sale products"
      >
        <div className="sales__grid-header">
          <p className="sales__section-eyebrow">Reduced to clear</p>
          <h2 className="sales__section-title">
            On Sale Now
            <span className="sales__grid-count">
              {!loading && `— ${products.length} ${products.length === 1 ? "piece" : "pieces"}`}
            </span>
          </h2>
        </div>

        {loading ? (
          <PageSkeleton />
        ) : products.length === 0 ? (
          <div className="sales__empty">
            <p className="sales__empty-title">No sale items right now.</p>
            <p className="sales__empty-sub">
              Check back soon — new offers drop regularly.
            </p>
            <Link className="sales__empty-btn" to="/products">
              Browse Full Collection
            </Link>
          </div>
        ) : (
          <div className="sales__grid">
            {products.map((product, i) => {
              const pct = discountPercent(product);
              return (
                <article
                  className="sales__card"
                  key={product._id}
                  style={{ "--i": i } as React.CSSProperties}
                  onMouseEnter={() => setHoveredId(product._id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Link
                    to={`/products/${product._id}`}
                    className="sales__card-img-link"
                    aria-label={product.name}
                  >
                    <div className="sales__card-img-wrap">
                      <img
                        src={product.img}
                        alt={product.name}
                        loading="lazy"
                        className="sales__card-img"
                      />

                      {/* Discount badge */}
                      {pct && (
                        <span className="sales__card-discount-badge">
                          −{pct}%
                        </span>
                      )}

                      <div
                        className={`sales__card-overlay ${
                          hoveredId === product._id
                            ? "sales__card-overlay--visible"
                            : ""
                        }`}
                      >
                        <button
                          className="sales__card-cta"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/products/${product._id}`);
                          }}
                        >
                          View Deal
                        </button>
                      </div>
                    </div>
                  </Link>

                  <div className="sales__card-info">
                    <span className="sales__card-category">
                      {product.category}
                    </span>
                    <Link
                      to={`/products/${product._id}`}
                      className="sales__card-name"
                    >
                      {product.name}
                    </Link>
                    <div className="sales__card-pricing">
                      <span className="sales__card-price">{product.price}</span>
                      {product.originalPrice && (
                        <span className="sales__card-original">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Bottom CTA ── */}
      <section className="sales__bottom">
        <p className="sales__bottom-text">
          Missed a size?&nbsp;<em>Join the waitlist.</em>
        </p>
        <Link className="sales__bottom-btn" to="/contact">
          Get Notified
        </Link>
      </section>

    </main>
  );
}

export default Sales;
// src/pages/Home.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/PageStyle/Home.css";

import heroFallback from "../assets/home.png";
import { ProductsSkeleton } from "../components/SkeletonLoader";

// ── Types ──────────────────────────────────────────────────────────────────
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

interface Product {
  _id: string;
  name: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  img: string;
  images: string[];
  category: string;
  sizes: string[];
  colors: { label: string; hex: string }[];
}

// ── Constants ──────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const HERO_DEFAULTS: HeroData = {
  eyebrow:        "Summer Collection 2026",
  titleLine1:     "Dressed in",
  titleItalic:    "quiet",
  titleLine2:     "confidence.",
  ctaText:        "Explore the collection",
  ctaLink:        "/product",
  imageUrl:       "",
  overlayOpacity: 58,
};

// ── Component ──────────────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();

  const [hero,     setHero]     = useState<HeroData>(HERO_DEFAULTS);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API_BASE}/api/hero`).then((r) => r.json()),
      fetch(`${API_BASE}/api/products`).then((r) => r.json()),
    ]).then(([heroRes, productsRes]) => {
      if (heroRes.status === "fulfilled") {
        setHero({ ...HERO_DEFAULTS, ...heroRes.value });
      }
      if (productsRes.status === "fulfilled" && Array.isArray(productsRes.value)) {
        setFeatured(productsRes.value.slice(0, 3));
      }
      setLoading(false);
    });
  }, []);

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product._id}`);
  };

  const heroImg    = hero.imageUrl || heroFallback;
  const overlayVal = `rgba(26,23,20,${(hero.overlayOpacity / 100).toFixed(2)})`;

  return (
    <main className="home">

      {/* ── Hero ── */}
      <section className="home__hero">
        <img
          className="home__hero-img"
          src={heroImg}
          alt="Lumielle editorial hero"
        />

        <div
          className="home__hero-overlay"
          style={{
            background: `linear-gradient(to top, ${overlayVal} 0%, rgba(26,23,20,0.08) 55%, transparent 100%)`,
          }}
          aria-hidden="true"
        />

        {/* Hero content — title top, rule+desc+cta bottom */}
        <div className="home__hero-content">

          {/* ── TOP: eyebrow + title ── */}
          <div className="home__hero-top">
            <p className="home__hero-eyebrow">{hero.eyebrow}</p>
            <h1 className="home__hero-title">
              {hero.titleLine1}{" "}
              {hero.titleItalic && <em>{hero.titleItalic}</em>}
              {hero.titleLine2 && (
                <>
                  <br />
                  {hero.titleLine2}
                </>
              )}
            </h1>
          </div>

          {/* ── BOTTOM: rule + description + CTA ── */}
          <div className="home__hero-bottom">
            <div className="home__hero-rule" />
            <p className="home__hero-desc">
              Timeless cuts. Considered fabrics. Made to last.
            </p>
            <Link
              className="home__hero-cta"
              to={hero.ctaLink || "/product"}
            >
              {hero.ctaText}&nbsp;&nbsp;→
            </Link>
          </div>

        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="home__featured">
        <p className="home__section-label">Curated for you</p>
        <h2 className="home__section-title">
          <em>Best</em> Sellers
        </h2>

        {loading ? (
           <ProductsSkeleton />
        ) : featured.length === 0 ? (
          <div className="home__empty">No products found.</div>
        ) : (
          <div className="home__featured-grid">
            {featured.map((product) => (
              <Link
                to={`/products/${product._id}`}
                key={product._id}
                className="home__product-card-link"
              >
                <article className="home__product-card">
                  <div className="home__product-img-wrap">
                    {product.img ? (
                      <img src={product.img} alt={product.name} loading="lazy" />
                    ) : (
                      <div className="home__img-placeholder">👕</div>
                    )}

                    {product.badge && (
                      <span className="home__product-badge">{product.badge}</span>
                    )}

                    <button
                      className="home__product-cart-btn"
                      onClick={(e) => handleBuyNow(e, product)}
                    >
                      Buy Now
                    </button>
                  </div>

                  <div className="home__product-info">
                    <span className="home__product-name">{product.name}</span>
                    <span className="home__product-price">{product.price}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Dark Banner ── */}
      <section className="home__banner">
        <p className="home__banner-text">
          Every thread tells a story.
          <br />
          Make yours <em>unforgettable.</em>
        </p>
        <Link className="home__banner-btn" to="/product">
          Shop All
        </Link>
      </section>

    </main>
  );
}

export default Home;
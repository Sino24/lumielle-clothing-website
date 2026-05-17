// src/pages/Home.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/PageStyle/Home.css";

import heroImage from "../assets/home.png";

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

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        setFeatured(data.slice(0, 3));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product._id}`);
  };

  return (
    <main className="home">

      {/* ── Hero ── */}
      <section className="home__hero">
        <img
          className="home__hero-img"
          src={heroImage}
          alt="Lumielle summer collection editorial"
        />
        <div className="home__hero-overlay" aria-hidden="true" />

        <div className="home__hero-content">
          <p className="home__hero-eyebrow">Summer Collection 2026</p>
          <h1 className="home__hero-title">
            Dressed in <em>quiet</em>
            <br />
            confidence.
          </h1>
          <Link className="home__hero-cta" to="/products">
            Explore the collection &nbsp;→
          </Link>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="home__featured">
        <p className="home__section-label">Curated for you</p>
        <h2 className="home__section-title">
          <em>Best</em> Sellers
        </h2>

        {loading ? (
          <div className="home__loading">
            <div className="home__spin" />
          </div>
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
                      <img
                        src={product.img}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="home__img-placeholder">👕</div>
                    )}

                    {product.badge && (
                      <span className="home__product-badge">
                        {product.badge}
                      </span>
                    )}

                    {/* Buy Now button */}
                    <button
                      className="home__product-cart-btn"
                      onClick={(e) => handleBuyNow(e, product)}
                    >
                      Buy Now
                    </button>
                  </div>

                  <div className="home__product-info">
                    <span className="home__product-name">
                      {product.name}
                    </span>
                    <span className="home__product-price">
                      {product.price}
                    </span>
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
        <Link className="home__banner-btn" to="/products">
          Shop All
        </Link>
      </section>

    </main>
  );
}

export default Home;
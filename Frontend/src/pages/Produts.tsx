// src/pages/Products.tsx

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/PageStyle/Products.css";

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

const ITEMS_PER_PAGE = 8;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const searchQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products]
  );

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false)
        );
      })
      .filter((p) =>
        activeCategory === "All" ? true : p.category === activeCategory
      );
  }, [products, searchQuery, activeCategory]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages || 1);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product._id}`);
  };

  return (
    <main className="products">

      {/* ── Hero — split layout ── */}
      <section className="products__hero">
        <div className="products__hero-left">
          <p className="products__eyebrow">The Collection</p>
          <h1 className="products__hero-title">
            All<br /><em>Essentials</em>
          </h1>
        </div>
        <div className="products__hero-right">
          <div className="products__hero-rule" />
          <p className="products__hero-desc">
            Timeless cuts. Considered fabrics. Made to last. Every piece
            designed for the way you actually live.
          </p>
        </div>
      </section>

      {/* ── Search Banner ── */}
      {searchQuery && (
        <div className="products__search-banner">
          <span className="products__search-banner-text">
            Results for <em>"{searchQuery}"</em>
            <span className="products__search-banner-count">
              — {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>
          </span>
          <button
            className="products__search-clear"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            Clear ×
          </button>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div
        className="products__filter-bar"
        role="tablist"
        aria-label="Filter by category"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            className={`products__filter-btn ${
              activeCategory === cat ? "products__filter-btn--active" : ""
            }`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
        <span className="products__filter-count">{filtered.length} items</span>
      </div>

      {/* ── Grid ── */}
      <section className="products__grid-section">
        {loading ? (
          <div className="products__loading">
            <div className="products__spin" />
          </div>
        ) : (
          <div className="products__grid">
            {paginated.map((product, i) => (
              <article
                className="products__card"
                key={product._id}
                style={{ "--i": i } as React.CSSProperties}
                onMouseEnter={() => setHoveredId(product._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link
                  to={`/products/${product._id}`}
                  className="products__card-img-link"
                >
                  <div className="products__card-img-wrap">
                    <img
                      src={product.img}
                      alt={product.name}
                      loading="lazy"
                      className="products__card-img"
                    />

                    {product.badge && (
                      <span
                        className={`products__card-badge products__card-badge--${product.badge
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {product.badge}
                      </span>
                    )}

                    <div
                      className={`products__card-overlay ${
                        hoveredId === product._id
                          ? "products__card-overlay--visible"
                          : ""
                      }`}
                    >
                      <button
                        className="products__card-cart-btn"
                        onClick={(e) => handleBuyNow(e, product)}
                      >
                        Buy Now
                      </button>

                      {product.colors && product.colors.length > 0 && (
                        <div className="products__card-colors">
                          {product.colors.map((color) => (
                            <span
                              key={color.hex}
                              className="products__card-color-dot"
                              style={{ background: color.hex }}
                              aria-label={color.label}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="products__card-info">
                  <div className="products__card-meta">
                    <span className="products__card-category">
                      {product.category}
                    </span>
                  </div>

                  <Link
                    to={`/products/${product._id}`}
                    className="products__card-name"
                  >
                    {product.name}
                  </Link>

                  <div className="products__card-pricing">
                    <span className="products__card-price">
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="products__card-original">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && paginated.length === 0 && (
          <div className="products__empty">
            {searchQuery ? (
              <>
                <p className="products__empty-title">
                  No results for "{searchQuery}"
                </p>
                <p className="products__empty-sub">
                  Try a different keyword or browse all collections.
                </p>
                <button className="products__empty-btn" onClick={clearSearch}>
                  Browse All
                </button>
              </>
            ) : (
              <p>No products found in this category.</p>
            )}
          </div>
        )}
      </section>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <nav className="products__pagination" aria-label="Pagination">
          <button
            className="products__page-btn products__page-btn--arrow"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={safePage === 1}
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`products__page-btn ${
                safePage === page ? "products__page-btn--active" : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="products__page-btn products__page-btn--arrow"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safePage === totalPages}
          >
            →
          </button>
        </nav>
      )}

      {/* ── Bottom Banner ── */}
      <section className="products__bottom-banner">
        <p className="products__bottom-text">
          Can't decide?&nbsp;<em>Let the fabric decide.</em>
        </p>
        <Link className="products__bottom-btn" to="/lookbook">
          View Lookbook
        </Link>
      </section>

    </main>
  );
}

export default Products;
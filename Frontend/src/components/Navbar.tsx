// src/components/Navbar/Navbar.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import "../styles/ComponentStyle/Navbar.css";

import logo from "../assets/newlogo2.png";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductSuggestion {
  _id: string;
  name: string;
  category: string;
  img: string;
  price: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const MAX_SUGGESTIONS = 6;

// ─── Highlight matching text ──────────────────────────────────────────────────
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="navbar__suggestion-highlight">
        {text.slice(idx, idx + query.trim().length)}
      </mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

// ─── Suggestion Dropdown (standalone component, outside Navbar) ───────────────
interface SuggestionDropdownProps {
  refProp: React.RefObject<HTMLDivElement>;
  isMobile?: boolean;
  suggestOpen: boolean;
  suggestions: ProductSuggestion[];
  activeIndex: number;
  query: string;
  onSelect: (id: string) => void;
  onSeeAll: () => void;
  onHover: (index: number) => void;
}

function SuggestionDropdown({
  refProp,
  isMobile = false,
  suggestOpen,
  suggestions,
  activeIndex,
  query,
  onSelect,
  onSeeAll,
  onHover,
}: SuggestionDropdownProps) {
  if (!suggestOpen || suggestions.length === 0) return null;

  return (
    <div
      ref={refProp}
      className={`navbar__suggestions${isMobile ? " navbar__suggestions--mobile" : ""}`}
      role="listbox"
      aria-label="Search suggestions"
    >
      {suggestions.map((p, i) => (
        <button
          key={p._id}
          className={`navbar__suggestion-item${i === activeIndex ? " active" : ""}`}
          role="option"
          aria-selected={i === activeIndex}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(p._id);
          }}
          onMouseEnter={() => onHover(i)}
        >
          <div className="navbar__suggestion-img">
            {p.img ? (
              <img src={p.img} alt={p.name} />
            ) : (
              <span className="navbar__suggestion-img-placeholder">👕</span>
            )}
          </div>
          <div className="navbar__suggestion-info">
            <span className="navbar__suggestion-name">
              {highlightMatch(p.name, query)}
            </span>
            <span className="navbar__suggestion-cat">{p.category}</span>
          </div>
        </button>
      ))}
      <button
        className="navbar__suggestion-see-all"
        onMouseDown={(e) => {
          e.preventDefault();
          onSeeAll();
        }}
      >
        See all results for <strong>"{query.trim()}"</strong>
      </button>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState("");

  // ── Suggestion state ──────────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState<ProductSuggestion[]>([]);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestRef                    = useRef<HTMLDivElement>(null);
  const mobileSuggestRef              = useRef<HTMLDivElement>(null);

  const { cart }                     = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const navigate                     = useNavigate();
  const location                     = useLocation();
  const searchInputRef               = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef         = useRef<HTMLInputElement>(null);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => { closeMenu(); }, [location.pathname]);

  // ── Fetch product list once for suggestions ───────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ProductSuggestion[]) => setAllProducts(data))
      .catch(() => {/* silently fail */});
  }, []);

  // ── Filter suggestions whenever query changes ─────────────────────────────
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 1) {
      setSuggestions([]);
      setSuggestOpen(false);
      setActiveIndex(-1);
      return;
    }
    const matched = allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, MAX_SUGGESTIONS);
    setSuggestions(matched);
    setSuggestOpen(matched.length > 0);
    setActiveIndex(-1);
  }, [query, allProducts]);

  // ── Close suggestions on outside click ───────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = suggestRef.current?.contains(target);
      const insideMobile  = mobileSuggestRef.current?.contains(target);
      const inputDesktop  = searchInputRef.current?.contains(target);
      const inputMobile   = mobileSearchInputRef.current?.contains(target);
      if (!insideDesktop && !insideMobile && !inputDesktop && !inputMobile) {
        setSuggestOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && window.innerWidth <= 768) {
      mobileSearchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const submitSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      navigate(`/product?q=${encodeURIComponent(trimmed)}`);
      setSearchOpen(false);
      setMenuOpen(false);
      setQuery("");
      setSuggestOpen(false);
      setActiveIndex(-1);
    },
    [navigate]
  );

  const goToProduct = useCallback(
    (id: string) => {
      navigate(`/products/${id}`);
      setSearchOpen(false);
      setMenuOpen(false);
      setQuery("");
      setSuggestOpen(false);
      setActiveIndex(-1);
    },
    [navigate]
  );

  const handleDesktopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex]._id);
    } else {
      submitSearch(query);
    }
  };

  const handleMobileNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex]._id);
    } else {
      submitSearch(query);
    }
  };

  // ── Keyboard navigation for suggestions ──────────────────────────────────
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (suggestOpen) {
        setSuggestOpen(false);
        setActiveIndex(-1);
      } else {
        setSearchOpen(false);
        setQuery("");
      }
      return;
    }
    if (!suggestOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        goToProduct(suggestions[activeIndex]._id);
      }
    }
  };

  const toggleSearch = () => {
    setSearchOpen((v) => !v);
    if (searchOpen) {
      setQuery("");
      setSuggestOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const firstName = user?.name?.split(" ")[0] ?? "";
  const initials  = firstName.charAt(0).toUpperCase();

  return (
    <>
      <nav
        className={`navbar${scrolled ? " scrolled" : ""}${
          searchOpen ? " navbar--search-open" : ""
        }`}
      >
        {/* ── Brand ── */}
        <Link className="navbar__brand" to="/" aria-label="Lumielle home">
          <img className="navbar__logo-img" src={logo} alt="Lumielle logo" />
          <div className="navbar__brand-divider" aria-hidden="true" />
          <div className="navbar__brand-text">
            <span className="navbar__brand-name">
              <em>wear your light</em>
            </span>
            <span className="navbar__tagline">Pure Cotton · Made in India</span>
          </div>
          <span className="navbar__mobile-wordmark">
            Lumielle
            <span className="navbar__tagline">wear your light</span>
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div
          className={`navbar__links${searchOpen ? " navbar__links--hidden" : ""}`}
        >
          <Link className="navbar__link" to="/">Home</Link>
          <Link className="navbar__link" to="/product">Collections</Link>
          <Link className="navbar__link" to="/lookbook">Lookbook</Link>
          <Link className="navbar__link" to="/ClientProjects">Client Projects</Link>
          <Link className="navbar__link" to="/about">About</Link>
          <Link className="navbar__link" to="/contact">Contact</Link>
        </div>

        {/* ── Desktop Search Expand ── */}
        <div className="navbar__search-wrap">
          <form
            className={`navbar__search-form${
              searchOpen ? " navbar__search-form--open" : ""
            }`}
            onSubmit={handleDesktopSearchSubmit}
            role="search"
            autoComplete="off"
          >
            <input
              ref={searchInputRef}
              id="navbar-search-desktop"
              name="q"
              className="navbar__search-input"
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setSuggestOpen(true);
              }}
              aria-label="Search products"
              aria-autocomplete="list"
              aria-expanded={suggestOpen}
              autoComplete="off"
            />
          </form>
          <SuggestionDropdown
            refProp={suggestRef}
            suggestOpen={suggestOpen}
            suggestions={suggestions}
            activeIndex={activeIndex}
            query={query}
            onSelect={goToProduct}
            onSeeAll={() => submitSearch(query)}
            onHover={setActiveIndex}
          />
        </div>

        {/* ── Desktop Right Icons ── */}
        <div className="navbar__icons">
          <button
            className="navbar__icon-btn"
            aria-label={searchOpen ? "Close search" : "Open search"}
            onClick={toggleSearch}
          >
            {searchOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </button>

          {isLoggedIn ? (
            <Link
              to="/account"
              className="navbar__icon-btn navbar__user-btn"
              aria-label="My account"
            >
              <span className="navbar__avatar" title={user?.name ?? "Account"}>
                {initials}
                <span className="navbar__avatar-ring" aria-hidden="true" />
              </span>
            </Link>
          ) : (
            <Link to="/login" className="navbar__icon-btn" aria-label="Sign in">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}

          <Link
            to="/cart"
            className="navbar__icon-btn navbar__cart-link"
            aria-label={`Cart — ${cart.length} items`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cart.length > 0 && (
              <span className="navbar__cart-badge" aria-hidden="true">
                {cart.length}
              </span>
            )}
          </Link>
        </div>

        {/* ── Mobile Right Group ── */}
        <div className="navbar__mobile-right">

          {/* Mobile inline search bar */}
          <div className="navbar__mobile-search-wrap">
            <form
              className={`navbar__mobile-search-inline${searchOpen ? " open" : ""}`}
              onSubmit={handleMobileNavSearchSubmit}
              role="search"
              autoComplete="off"
            >
              <input
                ref={mobileSearchInputRef}
                id="navbar-search-mobile-inline"
                name="q"
                className="navbar__mobile-search-inline-input"
                type="search"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setSuggestOpen(true);
                }}
                aria-label="Search products"
                aria-autocomplete="list"
                aria-expanded={suggestOpen}
                autoComplete="off"
              />
            </form>
            <SuggestionDropdown
              refProp={mobileSuggestRef}
              isMobile
              suggestOpen={suggestOpen}
              suggestions={suggestions}
              activeIndex={activeIndex}
              query={query}
              onSelect={goToProduct}
              onSeeAll={() => submitSearch(query)}
              onHover={setActiveIndex}
            />
          </div>

          {/* Search toggle */}
          <button
            className="navbar__icon-btn"
            aria-label={searchOpen ? "Close search" : "Open search"}
            onClick={toggleSearch}
          >
            {searchOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </button>

          {isLoggedIn ? (
            <Link
              to="/account"
              className="navbar__icon-btn navbar__user-btn"
              aria-label="My account"
            >
              <span className="navbar__avatar" title={user?.name ?? "Account"}>
                {initials}
                <span className="navbar__avatar-ring" aria-hidden="true" />
              </span>
            </Link>
          ) : (
            <Link to="/login" className="navbar__icon-btn" aria-label="Sign in">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}

          <Link
            to="/cart"
            className="navbar__icon-btn navbar__cart-link"
            aria-label={`Cart — ${cart.length} items`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cart.length > 0 && (
              <span className="navbar__cart-badge" aria-hidden="true">
                {cart.length}
              </span>
            )}
          </Link>

          <button
            className={`navbar__hamburger${menuOpen ? " open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="navbar-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <div
        id="navbar-mobile-menu"
        className={`navbar__mobile-menu${menuOpen ? " open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <Link className="navbar__mobile-link" to="/"               onClick={closeMenu}>Home</Link>
        <Link className="navbar__mobile-link" to="/product"        onClick={closeMenu}>Collections</Link>
        <Link className="navbar__mobile-link" to="/lookbook"       onClick={closeMenu}>Lookbook</Link>
        <Link className="navbar__mobile-link" to="/ClientProjects" onClick={closeMenu}>Client Projects</Link>
        <Link className="navbar__mobile-link" to="/about"          onClick={closeMenu}>About</Link>
        <Link className="navbar__mobile-link" to="/contact"        onClick={closeMenu}>Contact</Link>

        {isLoggedIn && (
          <div className="navbar__mobile-account">
            <span className="navbar__mobile-account-name">Hi, {firstName}</span>
            <button className="navbar__mobile-logout" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Navbar;
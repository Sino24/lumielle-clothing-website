// src/components/Navbar/Navbar.tsx

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import "../styles/ComponentStyle/Navbar.css";

import logo from "../assets/newlogo2.png";

function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query,       setQuery]       = useState("");

  const { cart }              = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const navigate              = useNavigate();
  const searchInputRef        = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef  = useRef<HTMLInputElement>(null);
  const userMenuRef           = useRef<HTMLDivElement>(null);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Focus desktop input when search opens
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Focus mobile input when menu opens
  useEffect(() => {
    if (menuOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [menuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const submitSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    navigate(`/product?q=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
    setMenuOpen(false);
    setQuery("");
  };

  const handleDesktopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(query);
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(query);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setQuery("");
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const toggleSearch = () => {
    setSearchOpen((v) => !v);
    if (searchOpen) setQuery("");
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  // First name only for display
  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>

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
        </Link>

        {/* ── Desktop Links ── */}
        <div className={`navbar__links${searchOpen ? " navbar__links--hidden" : ""}`}>
          <Link className="navbar__link" to="/">Home</Link>
          <Link className="navbar__link" to="/product">Collections</Link>
          <Link className="navbar__link" to="/lookbook">Lookbook</Link>
          <Link className="navbar__link" to="/ClientProjects">Client Projects</Link>
          <Link className="navbar__link" to="/about">About</Link>
          <Link className="navbar__link" to="/contact">Contact</Link>
        </div>

        {/* ── Desktop Search Expand ── */}
        <form
          className={`navbar__search-form${searchOpen ? " navbar__search-form--open" : ""}`}
          onSubmit={handleDesktopSearchSubmit}
          role="search"
        >
          <input
            ref={searchInputRef}
            className="navbar__search-input"
            type="search"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            aria-label="Search products"
          />
        </form>

        {/* ── Right Icons ── */}
        <div className="navbar__icons">

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

          {/* ── User icon / dropdown ── */}
          {isLoggedIn ? (
            <div className="navbar__user-wrap" ref={userMenuRef}>
              <button
                className="navbar__icon-btn navbar__user-btn"
                aria-label="Account menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                {/* Avatar circle with first letter */}
                <span className="navbar__avatar">{firstName.charAt(0).toUpperCase()}</span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="navbar__user-dropdown">
                  <div className="navbar__user-greeting">
                    Hi, {firstName}
                  </div>
                  <Link
                    className="navbar__user-item"
                    to="/account"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    className="navbar__user-item"
                    to="/account/orders"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    className="navbar__user-item navbar__user-logout"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="navbar__icon-btn"
              aria-label="Sign in"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}

          {/* Cart */}
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

        {/* ── Mobile Hamburger ── */}
        <button
          className={`navbar__hamburger${menuOpen ? " open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* ── Mobile Menu ── */}
      <div
        className={`navbar__mobile-menu${menuOpen ? " open" : ""}`}
        aria-hidden={!menuOpen}
      >
        {/* Mobile Search */}
        <form
          className="navbar__mobile-search"
          onSubmit={handleMobileSearchSubmit}
          role="search"
        >
          <div className="navbar__mobile-search-wrap">
            <svg
              className="navbar__mobile-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={mobileSearchInputRef}
              className="navbar__mobile-search-input"
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            {query && (
              <button
                type="submit"
                className="navbar__mobile-search-btn"
                aria-label="Submit search"
              >
                Go
              </button>
            )}
          </div>
        </form>

        {/* Mobile Nav Links */}
        <Link className="navbar__mobile-link" to="/" onClick={closeMenu}>Home</Link>
        <Link className="navbar__mobile-link" to="/product" onClick={closeMenu}>Collections</Link>
        <Link className="navbar__mobile-link" to="/lookbook" onClick={closeMenu}>Lookbook</Link>
        <Link className="navbar__mobile-link" to="/ClientProjects" onClick={closeMenu}>Client Projects</Link>
        <Link className="navbar__mobile-link" to="/about" onClick={closeMenu}>About</Link>
        <Link className="navbar__mobile-link" to="/contact" onClick={closeMenu}>Contact</Link>

        {/* Mobile User */}
        {isLoggedIn ? (
          <>
            <Link
              className="navbar__mobile-link"
              to="/account"
              onClick={closeMenu}
            >
              My Account
            </Link>
            <button
              className="navbar__mobile-link navbar__mobile-logout"
              onClick={handleLogout}
            >
              Sign Out ({firstName})
            </button>
          </>
        ) : (
          <Link
            className="navbar__mobile-link navbar__mobile-signin"
            to="/login"
            onClick={closeMenu}
          >
            Sign In
          </Link>
        )}

        {/* Mobile Cart */}
        <Link
          className="navbar__mobile-link navbar__mobile-cart"
          to="/cart"
          onClick={closeMenu}
        >
          <span>Cart</span>
          {cart.length > 0 && (
            <span className="navbar__mobile-cart-count">{cart.length}</span>
          )}
        </Link>
      </div>
    </>
  );
}

export default Navbar;
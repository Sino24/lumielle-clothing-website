// src/components/Navbar/Navbar.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

import "../styles/ComponentStyle/Navbar.css";

import logo from "../assets/newlogo2.png";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { cart } = useCart();

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > 24);

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      );
  }, []);

  return (
    <>
      <nav
        className={`navbar${
          scrolled ? " scrolled" : ""
        }`}
      >

        {/* ── Brand ───────────────────────── */}
        <Link
          className="navbar__brand"
          to="/"
          aria-label="Lumielle home"
        >
          <img
            className="navbar__logo-img"
            src={logo}
            alt="Lumielle logo"
          />

          <div
            className="navbar__brand-divider"
            aria-hidden="true"
          />

          <div className="navbar__brand-text">
            <span className="navbar__brand-name">
              <em>wear your light</em>
            </span>

            <span className="navbar__tagline">
              Pure Cotton · Made in India
            </span>
          </div>
        </Link>

        {/* ── Desktop Links ───────────────── */}
        <div className="navbar__links">
           <Link
            className="navbar__link"
            to="/"
          >
           Home
          </Link>
          <Link
            className="navbar__link"
            to="/product"
          >
            Collections
          </Link>

          <Link
            className="navbar__link"
            to="/lookbook"
          >
            Lookbook
          </Link>

          <Link
            className="navbar__link"
            to="/about"
          >
            About
          </Link>
           <Link
            className="navbar__link"
            to="/contact"
          >
           Contact
          </Link>
        </div>

        {/* ── Right Icons ─────────────────── */}
        <div className="navbar__icons">

          {/* Cart */}
          <Link
            to="/cart"
            className="navbar__icon-btn navbar__cart-link"
            aria-label={`Cart — ${cart.length} items`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />

              <line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
              />

              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>

            {cart.length > 0 && (
              <span
                className="navbar__cart-badge"
                aria-hidden="true"
              >
                {cart.length}
              </span>
            )}
          </Link>
        </div>

        {/* ── Mobile Hamburger ────────────── */}
        <button
          className={`navbar__hamburger${
            menuOpen ? " open" : ""
          }`}
          aria-label={
            menuOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen((v) => !v)
          }
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* ── Mobile Menu ──────────────────── */}
      <div
        className={`navbar__mobile-menu${
          menuOpen ? " open" : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <Link
          className="navbar__mobile-link"
          to="/product"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          Collections
        </Link>

        <Link
          className="navbar__mobile-link"
          to="/new"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          New In
        </Link>

        <Link
          className="navbar__mobile-link"
          to="/lookbook"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          Lookbook
        </Link>

        <Link
          className="navbar__mobile-link"
          to="/about"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          About
        </Link>

        <Link
          className="navbar__mobile-link"
          to="/cart"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          Cart ({cart.length})
        </Link>
      </div>
    </>
  );
}

export default Navbar;
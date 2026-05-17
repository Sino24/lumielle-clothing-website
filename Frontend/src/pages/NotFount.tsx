// src/pages/NotFound.tsx

import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/PageStyle/NotFound.css";

function NotFound() {
  const location = useLocation();
  const pathRef = useRef<HTMLSpanElement>(null);

  // Type the wrong path character by character
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const text = location.pathname;
    el.textContent = "";
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <main className="nf">
      {/* Decorative grain overlay */}
      <div className="nf__grain" aria-hidden="true" />

      {/* Big background number */}
      <span className="nf__bg-number" aria-hidden="true">404</span>

      <div className="nf__content">
        {/* Eyebrow */}
        <p className="nf__eyebrow">Lost in the wardrobe</p>

        {/* Headline */}
        <h1 className="nf__title">
          This page<br />
          doesn't <em>exist.</em>
        </h1>

        {/* Wrong path display */}
        <div className="nf__path-wrap" aria-label={`You tried: ${location.pathname}`}>
          <span className="nf__path-label">You tried →</span>
          <span className="nf__path-value" ref={pathRef} />
          <span className="nf__path-cursor" aria-hidden="true" />
        </div>

        <p className="nf__sub">
          The thread you pulled doesn't lead anywhere.
          <br />
          Let us guide you back to something real.
        </p>

        {/* CTA buttons */}
        <div className="nf__actions">
          <Link className="nf__btn nf__btn--primary" to="/">
            Back to Home
          </Link>
          <Link className="nf__btn nf__btn--ghost" to="/product">
            Shop Collection
          </Link>
        </div>

        {/* Divider + quick links */}
        <div className="nf__links-wrap">
          <span className="nf__links-label">Or go to</span>
          <nav className="nf__links" aria-label="Quick links">
            <Link className="nf__link" to="/product">Collections</Link>
            <span className="nf__dot" aria-hidden="true">·</span>
            <Link className="nf__link" to="/new">New In</Link>
            <span className="nf__dot" aria-hidden="true">·</span>
            <Link className="nf__link" to="/lookbook">Lookbook</Link>
            <span className="nf__dot" aria-hidden="true">·</span>
            <Link className="nf__link" to="/about">About</Link>
          </nav>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="nf__footer-rule" aria-hidden="true">
        <span>Lumielle</span>
      </div>
    </main>
  );
}

export default NotFound;
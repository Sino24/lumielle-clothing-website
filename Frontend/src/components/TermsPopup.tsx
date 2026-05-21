// src/components/TermsPopup.tsx
// Drop this into your App.tsx or layout component.
// Shows once per browser session using localStorage.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles//ComponentStyle/TermsPopup.css";

const STORAGE_KEY = "lumielle_terms_accepted";

export default function TermsPopup() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Show popup only if user hasn't accepted yet
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      // Small delay so page content loads first
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setLeaving(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={`tp-backdrop ${leaving ? "tp-backdrop--out" : ""}`} />

      {/* Popup */}
      <div
        className={`tp ${leaving ? "tp--out" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tp-title"
      >
        {/* Left accent bar */}
        <div className="tp__bar" />

        <div className="tp__inner">

          {/* Brand mark */}
          <div className="tp__brand">
            <span className="tp__brand-name">Lumielle</span>
            <span className="tp__brand-dot" />
            <span className="tp__brand-tag">Terms &amp; Conditions</span>
          </div>

          {/* Title */}
          <h2 className="tp__title" id="tp-title">
            Before you explore,<br />
            a few <em>important</em> things.
          </h2>

          {/* Key points */}
          <ul className="tp__points">
            <li>
              <span className="tp__point-num">01</span>
              <span>All sales are <strong>final</strong> — we do not offer refunds, returns, or exchanges once an order is placed.</span>
            </li>
            <li>
              <span className="tp__point-num">02</span>
              <span>Please review your size and order details carefully before completing your purchase.</span>
            </li>
            <li>
              <span className="tp__point-num">03</span>
              <span>By continuing, you agree to our full Terms &amp; Conditions and Privacy Policy.</span>
            </li>
          </ul>

          {/* Actions */}
          <div className="tp__actions">
            <button className="tp__accept-btn" onClick={accept}>
              I Accept All Terms
            </button>
            <Link
              className="tp__read-link"
              to="/terms"
              onClick={accept}
            >
              Read full terms →
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
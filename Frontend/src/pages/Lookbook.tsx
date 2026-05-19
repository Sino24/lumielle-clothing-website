// src/pages/Lookbook.tsx

import { useEffect, useState } from "react";
import "../styles/PageStyle/Lookbook.css";

interface LookEntry {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
}

function Lookbook() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [looks, setLooks] = useState<LookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/lookbook`)
      .then((r) => r.json())
      .then((d) => setLooks(Array.isArray(d) ? d : []))
      .catch(() => setLooks([]))
      .finally(() => setLoading(false));
  }, [API_BASE]);

  return (
    <main className="lookbook">

      {/* ── Hero ── */}
      <section className="lookbook__hero">
        <div className="lookbook__hero-inner">
          <div className="lookbook__hero-text">
            <p className="lookbook__eyebrow">Editorial · SS 2025</p>
            <h1>The Lumielle<br /><em>Lookbook</em></h1>
          </div>
          <p className="lookbook__hero-sub">
            Seasonal stories told through<br />fabric, light, and form.
          </p>
        </div>
        <div className="lookbook__hero-rule" />
      </section>

      {/* ── Content ── */}
      {loading ? (
        <div className="lookbook__loading">
          <span className="lookbook__spin" />
        </div>
      ) : looks.length === 0 ? (
        <div className="lookbook__empty">
          <p>No looks published yet. Check back soon.</p>
        </div>
      ) : (
        <section className="lookbook__grid">
          {looks.map((look, i) => {
            const mod = i % 6;
            // 6-card repeating layout pattern
            // 0: big left (3/4)   1: small right top (4/3)
            // 2: small right bot  3: full width (16/9)
            // 4: left square      5: right portrait
            const variant =
              mod === 0 ? "big" :
              mod === 1 ? "small-top" :
              mod === 2 ? "small-bot" :
              mod === 3 ? "wide" :
              mod === 4 ? "square" : "portrait";

            return (
              <article
                key={look._id}
                className={`lookbook__card lookbook__card--${variant}`}
              >
                <span className="lookbook__card-index">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="lookbook__img-wrap">
                  <img
                    src={look.imageUrl}
                    alt={look.title || `Look ${i + 1}`}
                  />
                  <div className="lookbook__overlay">
                    {(look.title || look.subtitle) && (
                      <div className="lookbook__caption">
                        {look.title    && <span className="lookbook__caption-title">{look.title}</span>}
                        {look.subtitle && <span className="lookbook__caption-sub">{look.subtitle}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <div className="lookbook__footer-rule">
        <span>Lumielle · Editorial</span>
      </div>
    </main>
  );
}

export default Lookbook;
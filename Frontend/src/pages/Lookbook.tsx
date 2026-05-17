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
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const [looks, setLooks] = useState<LookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/lookbook`)
      .then((r) => r.json())
      .then((d) => setLooks(Array.isArray(d) ? d : []))
      .catch(() => setLooks([]))
      .finally(() => setLoading(false));
  }, [API_BASE]);

  return (
    <main className="lookbook">

      <section className="lookbook__hero">
        <p className="lookbook__eyebrow">Editorial</p>
        <h1>The Lumielle <em>Lookbook</em></h1>
        <p className="lookbook__hero-sub">
          Seasonal stories told through fabric, light, and form.
        </p>
      </section>

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
          {looks.map((look, i) => (
            <article
              key={look._id}
              className={`lookbook__card lookbook__card--${(i % 3) + 1}`}
            >
              <div className="lookbook__img-wrap">
                <img src={look.imageUrl} alt={look.title || `Look ${i + 1}`} />
                <div className="lookbook__overlay">
                  {(look.title || look.subtitle) && (
                    <div className="lookbook__caption">
                      {look.title && <span className="lookbook__caption-title">{look.title}</span>}
                      {look.subtitle && <span className="lookbook__caption-sub">{look.subtitle}</span>}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default Lookbook;
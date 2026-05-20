// src/pages/Lookbook.tsx

import { useEffect, useRef, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/lookbook`)
      .then((r) => r.json())
      .then((d) => setLooks(Array.isArray(d) ? d : []))
      .catch(() => setLooks([]))
      .finally(() => setLoading(false));
  }, [API_BASE]);

  useEffect(() => {
    if (!looks.length) return;
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const trackLeft = track.getBoundingClientRect().left;
      const trackWidth = track.clientWidth;
      const center = trackLeft + trackWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveIndex(closest);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [looks]);

  const scrollTo = (i: number) => {
    const card = cardRefs.current[i];
    const track = trackRef.current;
    if (!card || !track) return;
    const trackLeft = track.getBoundingClientRect().left;
    const cardLeft  = card.getBoundingClientRect().left;
    track.scrollBy({ left: cardLeft - trackLeft - (track.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
  };

  return (
    <main className="lookbook">

      {/* ── Hero — split layout ── */}
      <section className="lookbook__hero">
        <div className="lookbook__hero-left">
          <p className="lookbook__eyebrow">Editorial · SS 2025</p>
          <h1 className="lookbook__hero-title">
            The Lumielle<br /><em>Lookbook</em>
          </h1>
        </div>
        <div className="lookbook__hero-right">
          <div className="lookbook__hero-rule" />
          <p className="lookbook__hero-desc">
            Seasonal stories told through fabric, light, and form.
          </p>
        </div>
      </section>

      <div className="lookbook__hero-divider" />

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
        <section className="lookbook__stage">

          <div className="lookbook__hint">
            <span>Drag to explore</span>
            <svg width="32" height="10" viewBox="0 0 32 10" fill="none">
              <path d="M0 5h30M25 1l5 4-5 4" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>

          <div className="lookbook__track" ref={trackRef}>
            <div className="lookbook__spacer" />

            {looks.map((look, i) => (
              <article
                key={look._id}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`lookbook__card ${activeIndex === i ? "lookbook__card--active" : ""}`}
                onClick={() => scrollTo(i)}
              >
                <div className="lookbook__img-wrap">
                  <img
                    src={look.imageUrl}
                    alt={look.title || `Look ${i + 1}`}
                    draggable={false}
                  />
                </div>

                <span className="lookbook__card-index">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="lookbook__overlay">
                  <div className="lookbook__caption">
                    {look.title    && <span className="lookbook__caption-title">{look.title}</span>}
                    {look.subtitle && <span className="lookbook__caption-sub">{look.subtitle}</span>}
                  </div>
                </div>
              </article>
            ))}

            <div className="lookbook__spacer" />
          </div>

          <nav className="lookbook__dots" aria-label="Lookbook navigation">
            {looks.map((_, i) => (
              <button
                key={i}
                className={`lookbook__dot ${activeIndex === i ? "lookbook__dot--active" : ""}`}
                onClick={() => scrollTo(i)}
                aria-label={`Look ${i + 1}`}
              />
            ))}
          </nav>

          <div className="lookbook__counter">
            <span className="lookbook__counter-current">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="lookbook__counter-sep" />
            <span className="lookbook__counter-total">
              {String(looks.length).padStart(2, "0")}
            </span>
          </div>

        </section>
      )}

      <div className="lookbook__footer-rule">
        <span>Lumielle · Editorial</span>
      </div>
    </main>
  );
}

export default Lookbook;
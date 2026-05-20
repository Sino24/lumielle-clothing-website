// src/components/StarRating.tsx
// Reusable star rating widget used on ProductDetail and Products pages.

import { useEffect, useState, useCallback } from "react";
import "../styles/ComponentStyle/StartRating.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface RatingData {
  average:   number;
  count:     number;
  userScore: number | null;
}

interface StarRatingProps {
  productId:    string;
  /** "full" shows interactive stars + count label
   *  "compact" shows read-only mini stars + avg (for product cards) */
  variant?: "full" | "compact";
}

export default function StarRating({ productId, variant = "full" }: StarRatingProps) {
  const [data,    setData]    = useState<RatingData | null>(null);
  const [hover,   setHover]   = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [flash,   setFlash]   = useState(false);

  const fetchRating = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/ratings/${productId}`);
      const d = await r.json();
      setData(d);
    } catch {
      // silently fail — rating is non-critical
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchRating(); }, [fetchRating]);

  const submitRating = async (score: number) => {
    if (saving) return;
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/ratings/${productId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ score }),
      });
      const d = await r.json();
      setData(d);
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  // ── Compact (card) variant ─────────────────────────────────────────────────
  if (variant === "compact") {
    if (loading || !data || data.count === 0) return null;
    return (
      <div className="sr sr--compact">
        <div className="sr__stars sr__stars--sm">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`sr__star ${s <= Math.round(data.average) ? "sr__star--filled" : ""}`}
            >★</span>
          ))}
        </div>
        <span className="sr__avg-label">{data.average.toFixed(1)}</span>
        <span className="sr__count-label">({data.count})</span>
      </div>
    );
  }

  // ── Full (detail page) variant ─────────────────────────────────────────────
  const activeScore = hover ?? data?.userScore ?? 0;

  return (
    <div className={`sr sr--full ${flash ? "sr--flash" : ""}`}>
      {/* Summary line */}
      {!loading && data && data.count > 0 && (
        <div className="sr__summary">
          <span className="sr__avg">{data.average.toFixed(1)}</span>
          <div className="sr__stars sr__stars--md sr__stars--readonly">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`sr__star ${s <= Math.round(data.average) ? "sr__star--filled" : ""}`}
              >★</span>
            ))}
          </div>
          <span className="sr__count">
            {data.count} {data.count === 1 ? "rating" : "ratings"}
          </span>
        </div>
      )}

      {/* Interactive stars */}
      <div className="sr__interactive">
        <p className="sr__prompt">
          {data?.userScore
            ? "Your rating — click to change"
            : "Rate this product"}
        </p>

        <div
          className="sr__stars sr__stars--lg sr__stars--interactive"
          onMouseLeave={() => setHover(null)}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              className={`sr__star-btn ${s <= activeScore ? "sr__star-btn--lit" : ""}`}
              onMouseEnter={() => setHover(s)}
              onClick={() => submitRating(s)}
              disabled={saving}
              aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
            >★</button>
          ))}
        </div>

        {saving && <span className="sr__saving">Saving…</span>}
        {flash  && <span className="sr__thankyou">Thanks for rating! ✓</span>}
      </div>
    </div>
  );
}
// src/pages/About.tsx

import { useEffect, useState } from "react";
import "../styles/PageStyle/About.css";

interface ValueItem { number: string; title: string; body: string; }

interface AboutData {
  headline: string;
  lead: string;
  storyHeading: string;
  storyBody: string;
  storyBody2: string;
  studioImageUrl: string;
  founderImageUrl: string;
  founderQuote: string;
  founderNote: string;
  founderName: string;
  values: ValueItem[];
}

const DEFAULTS: AboutData = {
  headline: "Crafted for those who wear their light",
  lead: "Lumielle is a modern Indian clothing label focused on timeless silhouettes, premium cotton fabrics, and quiet luxury aesthetics.",
  storyHeading: "Designed with simplicity.\nBuilt with intention.",
  storyBody: "We believe clothing should feel effortless, refined, and deeply personal. Every Lumielle piece is designed with clean silhouettes, elevated textures, and versatile styling that fits naturally into everyday life.",
  storyBody2: "Inspired by minimalism and modern streetwear, our collections blend comfort and elegance into essentials made to last.",
  studioImageUrl: "",
  founderImageUrl: "",
  founderQuote: "Fashion should feel personal, calm, and expressive.",
  founderNote: "Lumielle was built to create clothing that balances luxury and simplicity. Pieces that feel premium without trying too hard.",
  founderName: "Lumielle Studio",
  values: [
    { number: "01", title: "Premium Fabric",  body: "Soft breathable cotton selected for comfort and durability." },
    { number: "02", title: "Timeless Design", body: "Minimal silhouettes designed beyond trends and seasons." },
    { number: "03", title: "Made in India",   body: "Proudly designed and produced with local craftsmanship." },
  ],
};

function About() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/";
  const [data, setData] = useState<AboutData>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/about`)
      .then((r) => r.json())
      .then((d) => setData({ ...DEFAULTS, ...d }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_BASE]);

  if (loading) {
    return (
      <main className="about about--loading">
        <span className="about__spin" />
      </main>
    );
  }

  return (
    <main className="about">

      {/* ── Hero ── */}
      <section className="about__hero">
        <div className="about__hero-inner">
          <p className="about__eyebrow">About Lumielle</p>
          <h1 className="about__title">{data.headline}</h1>
        </div>
        <div className="about__hero-aside">
          <div className="about__hero-rule" />
          <p className="about__lead">{data.lead}</p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="about__story">
        {/* Left: image */}
        {data.studioImageUrl ? (
          <div className="about__story-image">
            <img src={data.studioImageUrl} alt="Lumielle studio" />
          </div>
        ) : (
          <div className="about__story-image about__story-image--placeholder" />
        )}

        {/* Right: text */}
        <div className="about__story-content">
          <p className="about__section-tag">Our Story</p>
          <h2>
            {data.storyHeading.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          {data.storyBody  && <p>{data.storyBody}</p>}
          {data.storyBody2 && <p>{data.storyBody2}</p>}
        </div>
      </section>

      {/* ── Values ── */}
      {data.values && data.values.length > 0 && (
        <section className="about__values">
          <div className="about__values-header">
            <p className="about__section-tag">What We Stand For</p>
          </div>
          <div className="about__values-grid">
            {data.values.map((v) => (
              <div className="about__value-card" key={v.number}>
                <div className="about__value-top">
                  <span className="about__value-num">{v.number}</span>
                  <div className="about__value-rule" />
                </div>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Founder ── */}
      <section className="about__founder">
        <div className="about__founder-content">
          <p className="about__section-tag">Founder Note</p>
          {data.founderQuote && (
            <blockquote className="about__founder-quote">
              <span className="about__founder-mark">"</span>
              {data.founderQuote}
              <span className="about__founder-mark">"</span>
            </blockquote>
          )}
          {data.founderNote && <p className="about__founder-body">{data.founderNote}</p>}
          <span className="about__founder-sig">— {data.founderName}</span>
        </div>

        {data.founderImageUrl ? (
          <div className="about__founder-image">
            <img src={data.founderImageUrl} alt="Founder" />
          </div>
        ) : (
          <div className="about__founder-image about__founder-image--placeholder" />
        )}
      </section>

    </main>
  );
}

export default About;
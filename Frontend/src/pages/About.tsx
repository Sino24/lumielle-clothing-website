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

// Fallback defaults so page never looks empty
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
      .catch(() => {}) // keep defaults on error
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

      {/* Hero */}
      <section className="about__hero">
        <p className="about__eyebrow">About Lumielle</p>
        <h1 className="about__title">{data.headline}</h1>
        <p className="about__lead">{data.lead}</p>
      </section>

      {/* Story */}
      <section className="about__story">
        <div className="about__story-content">
          <p className="about__section-tag">Our Story</p>
          <h2>
            {data.storyHeading.split("\n").map((line, i) => (
              <span key={i}>{line}{i < data.storyHeading.split("\n").length - 1 && <br />}</span>
            ))}
          </h2>
          {data.storyBody  && <p>{data.storyBody}</p>}
          {data.storyBody2 && <p>{data.storyBody2}</p>}
        </div>

        {data.studioImageUrl && (
          <div className="about__story-image">
            <img src={data.studioImageUrl} alt="Lumielle studio" />
          </div>
        )}
      </section>

      {/* Values */}
      {data.values && data.values.length > 0 && (
        <section className="about__values">
          {data.values.map((v) => (
            <div className="about__value-card" key={v.number}>
              <span>{v.number}</span>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </div>
          ))}
        </section>
      )}

      {/* Founder */}
      <section className="about__founder">
        {data.founderImageUrl && (
          <div className="about__founder-image">
            <img src={data.founderImageUrl} alt="Founder" />
          </div>
        )}
        <div className="about__founder-content">
          <p className="about__section-tag">Founder Note</p>
          {data.founderQuote && <h2>"{data.founderQuote}"</h2>}
          {data.founderNote  && <p>{data.founderNote}</p>}
          <span>— {data.founderName}</span>
        </div>
      </section>

    </main>
  );
}

export default About;
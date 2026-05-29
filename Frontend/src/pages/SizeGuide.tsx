// src/pages/SizeGuide.tsx

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/PageStyle/SizeGuide.css";

/* ── Types ───────────────────────────────────────────────────────────────────── */
type Unit = "cm" | "in";

type SectionId = "how-to-measure" | "tops" | "bottoms" | "dresses" | "fit-guide" | "tips";

interface SizeRow {
  size: string;
  bust_cm: string;
  waist_cm: string;
  hips_cm: string;
  highlight?: boolean;
}

interface BottomRow {
  size: string;
  waist_cm: string;
  hips_cm: string;
  inseam_cm: string;
  highlight?: boolean;
}

interface DressRow {
  size: string;
  bust_cm: string;
  waist_cm: string;
  hips_cm: string;
  length_cm: string;
  highlight?: boolean;
}

/* ── Data ────────────────────────────────────────────────────────────────────── */
const TOPS: SizeRow[] = [
  { size: "XS",  bust_cm: "80–84",   waist_cm: "62–66",  hips_cm: "86–90"   },
  { size: "S",   bust_cm: "84–88",   waist_cm: "66–70",  hips_cm: "90–94"   },
  { size: "M",   bust_cm: "88–92",   waist_cm: "70–74",  hips_cm: "94–98",   highlight: true },
  { size: "L",   bust_cm: "92–98",   waist_cm: "74–80",  hips_cm: "98–104"  },
  { size: "XL",  bust_cm: "98–104",  waist_cm: "80–86",  hips_cm: "104–110" },
  { size: "XXL", bust_cm: "104–112", waist_cm: "86–94",  hips_cm: "110–118" },
];

const BOTTOMS: BottomRow[] = [
  { size: "XS",  waist_cm: "62–66",  hips_cm: "86–90",   inseam_cm: "74"  },
  { size: "S",   waist_cm: "66–70",  hips_cm: "90–94",   inseam_cm: "74"  },
  { size: "M",   waist_cm: "70–74",  hips_cm: "94–98",   inseam_cm: "76",  highlight: true },
  { size: "L",   waist_cm: "74–80",  hips_cm: "98–104",  inseam_cm: "76"  },
  { size: "XL",  waist_cm: "80–86",  hips_cm: "104–110", inseam_cm: "77"  },
  { size: "XXL", waist_cm: "86–94",  hips_cm: "110–118", inseam_cm: "77"  },
];

const DRESSES: DressRow[] = [
  { size: "XS",  bust_cm: "80–84",   waist_cm: "62–66",  hips_cm: "86–90",   length_cm: "120" },
  { size: "S",   bust_cm: "84–88",   waist_cm: "66–70",  hips_cm: "90–94",   length_cm: "122" },
  { size: "M",   bust_cm: "88–92",   waist_cm: "70–74",  hips_cm: "94–98",   length_cm: "124", highlight: true },
  { size: "L",   bust_cm: "92–98",   waist_cm: "74–80",  hips_cm: "98–104",  length_cm: "124" },
  { size: "XL",  bust_cm: "98–104",  waist_cm: "80–86",  hips_cm: "104–110", length_cm: "126" },
  { size: "XXL", bust_cm: "104–112", waist_cm: "86–94",  hips_cm: "110–118", length_cm: "126" },
];

const MEASURE_STEPS = [
  {
    icon: "📏",
    name: "Bust",
    desc: "Measure around the fullest part of your chest, keeping the tape parallel to the floor.",
  },
  {
    icon: "〰️",
    name: "Waist",
    desc: "Measure around the narrowest part of your natural waist, usually just above the navel.",
  },
  {
    icon: "🫧",
    name: "Hips",
    desc: "Stand with feet together and measure around the fullest part of your hips and seat.",
  },
  {
    icon: "📐",
    name: "Inseam",
    desc: "Measure from the crotch seam down to the ankle bone along the inner leg.",
  },
];

const FIT_TYPES = [
  {
    label: "Fit Type",
    name: "Regular Fit",
    desc: "Follows the body's natural lines — comfortable and versatile. Our most popular cut.",
  },
  {
    label: "Fit Type",
    name: "Slim Fit",
    desc: "Cut closer to the body with a tapered silhouette. We recommend sizing up if between sizes.",
  },
  {
    label: "Fit Type",
    name: "Relaxed Fit",
    desc: "A looser, eased silhouette for comfort and layering. True to size with extra room.",
  },
  {
    label: "Fit Type",
    name: "Oversized",
    desc: "Intentionally generous. Size down for a regular look or wear your size for the full effect.",
  },
];

const TIPS = [
  "Always measure over your undergarments, not bare skin or thick clothing.",
  "Use a soft measuring tape and keep it snug but not tight.",
  "If you fall between two sizes, size up for comfort or size down for a more tailored look.",
  "Our garments are cut for Indian body proportions — when in doubt, check the specific product notes.",
  "All measurements in the tables refer to body measurements, not garment measurements.",
];

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "how-to-measure", label: "How to Measure"   },
  { id: "tops",           label: "Tops & Blouses"   },
  { id: "bottoms",        label: "Bottoms"           },
  { id: "dresses",        label: "Dresses & Kurtas"  },
  { id: "fit-guide",      label: "Fit Guide"         },
  { id: "tips",           label: "Tips & Notes"      },
];

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
function cmToIn(range: string): string {
  return range
    .split("–")
    .map((v) => (Math.round((parseInt(v, 10) / 2.54) * 10) / 10).toFixed(1))
    .join("–");
}

function convert(val: string, unit: Unit): string {
  return unit === "in" ? cmToIn(val) : val;
}

/* ── Component ───────────────────────────────────────────────────────────────── */
function SizeGuide() {
  const [unit, setUnit]                   = useState<Unit>("cm");
  const [activeSection, setActiveSection] = useState<SectionId>("how-to-measure");

  // ── FIX: fully-typed Record initialised with null for every key ──────────────
  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    "how-to-measure": null,
    "tops":           null,
    "bottoms":        null,
    "dresses":        null,
    "fit-guide":      null,
    "tips":           null,
  });

  // Intersection observer — highlights sidebar item matching visible section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: SectionId) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Helper: attach ref without index-signature errors ────────────────────────
  const setRef = (id: SectionId) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <main className="sg">

      {/* ── Breadcrumb ── */}
      <nav className="sg__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">·</span>
        <Link to="/product">Collection</Link>
        <span aria-hidden="true">·</span>
        <span aria-current="page">Size Guide</span>
      </nav>

      {/* ── Hero ── */}
      <header className="sg__hero">
        <p className="sg__eyebrow">Fit &amp; Sizing</p>
        <h1 className="sg__title">
          Find your <em>perfect</em> fit
        </h1>
        <p className="sg__subtitle">
          Every body is different. Use this guide to measure yourself accurately
          and choose the size that will make you feel your best — whether you prefer
          a tailored look or something more relaxed.
        </p>
      </header>

      <div className="sg__rule" />

      {/* ── Body: sidebar + content ── */}
      <div className="sg__body">

        {/* Sidebar */}
        <aside className="sg__sidebar" aria-label="Size guide sections">
          <p className="sg__sidebar-label">Sections</p>
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              className={`sg__nav-btn ${activeSection === id ? "sg__nav-btn--active" : ""}`}
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <div className="sg__main">

          {/* ── How to measure ── */}
          <section
            id="how-to-measure"
            ref={setRef("how-to-measure")}
            className="sg__section"
          >
            <div className="sg__section-header">
              <h2 className="sg__section-title">How to Measure</h2>
            </div>
            <p className="sg__section-note">
              Use a soft measuring tape for the most accurate results.
              Keep the tape snug against your body without pulling it tight.
            </p>
            <div className="sg__measure-grid">
              {MEASURE_STEPS.map((step) => (
                <div key={step.name} className="sg__measure-card">
                  <span className="sg__measure-icon">{step.icon}</span>
                  <p className="sg__measure-name">{step.name}</p>
                  <p className="sg__measure-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Unit toggle — shared across all tables */}
          <div className="sg__unit-toggle" role="group" aria-label="Unit of measurement">
            <button
              className={`sg__unit-btn ${unit === "cm" ? "sg__unit-btn--active" : ""}`}
              onClick={() => setUnit("cm")}
            >
              cm
            </button>
            <button
              className={`sg__unit-btn ${unit === "in" ? "sg__unit-btn--active" : ""}`}
              onClick={() => setUnit("in")}
            >
              inches
            </button>
          </div>

          {/* ── Tops ── */}
          <section
            id="tops"
            ref={setRef("tops")}
            className="sg__section"
          >
            <div className="sg__section-header">
              <h2 className="sg__section-title">Tops &amp; Blouses</h2>
              <span className="sg__section-tag">Body measurements</span>
            </div>
            <div className="sg__table-wrap">
              <table className="sg__table" aria-label="Tops size chart">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust ({unit})</th>
                    <th>Waist ({unit})</th>
                    <th>Hips ({unit})</th>
                  </tr>
                </thead>
                <tbody>
                  {TOPS.map((row) => (
                    <tr key={row.size} className={row.highlight ? "sg__table-row--highlight" : ""}>
                      <td>{row.size}</td>
                      <td>{convert(row.bust_cm, unit)}</td>
                      <td>{convert(row.waist_cm, unit)}</td>
                      <td>{convert(row.hips_cm, unit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Bottoms ── */}
          <section
            id="bottoms"
            ref={setRef("bottoms")}
            className="sg__section"
          >
            <div className="sg__section-header">
              <h2 className="sg__section-title">Bottoms</h2>
              <span className="sg__section-tag">Body measurements</span>
            </div>
            <div className="sg__table-wrap">
              <table className="sg__table" aria-label="Bottoms size chart">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Waist ({unit})</th>
                    <th>Hips ({unit})</th>
                    <th>Inseam ({unit})</th>
                  </tr>
                </thead>
                <tbody>
                  {BOTTOMS.map((row) => (
                    <tr key={row.size} className={row.highlight ? "sg__table-row--highlight" : ""}>
                      <td>{row.size}</td>
                      <td>{convert(row.waist_cm, unit)}</td>
                      <td>{convert(row.hips_cm, unit)}</td>
                      <td>{convert(row.inseam_cm, unit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Dresses ── */}
          <section
            id="dresses"
            ref={setRef("dresses")}
            className="sg__section"
          >
            <div className="sg__section-header">
              <h2 className="sg__section-title">Dresses &amp; Kurtas</h2>
              <span className="sg__section-tag">Body measurements</span>
            </div>
            <div className="sg__table-wrap">
              <table className="sg__table" aria-label="Dresses size chart">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust ({unit})</th>
                    <th>Waist ({unit})</th>
                    <th>Hips ({unit})</th>
                    <th>Length ({unit})</th>
                  </tr>
                </thead>
                <tbody>
                  {DRESSES.map((row) => (
                    <tr key={row.size} className={row.highlight ? "sg__table-row--highlight" : ""}>
                      <td>{row.size}</td>
                      <td>{convert(row.bust_cm, unit)}</td>
                      <td>{convert(row.waist_cm, unit)}</td>
                      <td>{convert(row.hips_cm, unit)}</td>
                      <td>{convert(row.length_cm, unit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Fit guide ── */}
          <section
            id="fit-guide"
            ref={setRef("fit-guide")}
            className="sg__section"
          >
            <div className="sg__section-header">
              <h2 className="sg__section-title">Fit Guide</h2>
            </div>
            <p className="sg__section-note">
              Each product listing specifies its fit type. Here's what each means for
              how the garment will sit on your body.
            </p>
            <div className="sg__fit-grid">
              {FIT_TYPES.map((ft) => (
                <div key={ft.name} className="sg__fit-card">
                  <p className="sg__fit-card-label">{ft.label}</p>
                  <h3 className="sg__fit-card-name">{ft.name}</h3>
                  <p className="sg__fit-card-desc">{ft.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Tips ── */}
          <section
            id="tips"
            ref={setRef("tips")}
            className="sg__section"
          >
            <div className="sg__section-header">
              <h2 className="sg__section-title">Tips &amp; Notes</h2>
            </div>
            <div className="sg__tips">
              <p className="sg__tips-title">Before you order</p>
              <ul className="sg__tips-list">
                {TIPS.map((tip, i) => (
                  <li key={i}>
                    <span className="sg__tips-dot">—</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Contact strip ── */}
          <div className="sg__contact">
            <div className="sg__contact-text">
              <h3 className="sg__contact-heading">Still not sure about your size?</h3>
              <p className="sg__contact-sub">Our team is happy to help you choose the right fit.</p>
            </div>
           <Link to="/contact" className="sg__contact-btn">Contact us</Link>
          </div>

        </div>
      </div>
    </main>
  );
}

export default SizeGuide;
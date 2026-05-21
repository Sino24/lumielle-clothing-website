// src/pages/TermsAndConditions.tsx

import "../styles/PageStyle/TermsAndConditions.css";

const LAST_UPDATED = "May 2026";

const sections = [
  {
    id: "01",
    title: "Acceptance of Terms",
    body: [
      "By accessing or using the Lumielle website and purchasing our products, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions in their entirety.",
      "If you do not agree with any part of these terms, you must discontinue use of this website immediately. Continued use constitutes acceptance.",
    ],
  },
  {
    id: "02",
    title: "Products & Orders",
    body: [
      "All products listed on our website are subject to availability. We reserve the right to discontinue any product at any time without notice.",
      "By placing an order, you represent that all information provided is accurate and complete. We reserve the right to refuse or cancel any order at our discretion, including orders that appear fraudulent or placed with incorrect pricing due to technical errors.",
      "Colours may appear slightly different due to screen calibration. We make every effort to display products accurately.",
    ],
  },
  {
    id: "03",
    title: "Pricing & Payment",
    body: [
      "All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.",
      "We accept payment through the methods listed at checkout. Payment must be completed in full before an order is processed and dispatched.",
      "We are not responsible for any additional charges imposed by your bank or payment provider.",
    ],
  },
  {
    id: "04",
    title: "Shipping & Delivery",
    body: [
      "We ship across India. Estimated delivery timelines are provided at checkout and are indicative, not guaranteed.",
      "Delivery timelines may vary due to location, courier delays, or circumstances beyond our control. Lumielle is not liable for delays caused by third-party logistics partners.",
      "Risk of loss and title for products pass to you upon delivery to the courier.",
    ],
  },
  {
    id: "05",
    title: "No Refund or Return Policy",
    body: [
      "ALL SALES ARE FINAL. Lumielle does not offer refunds, returns, or exchanges under any circumstances once an order has been placed and payment confirmed.",
      "We strongly encourage you to review your order — including size, colour, and quantity — carefully before completing your purchase.",
      "In the rare event of a product being delivered in a genuinely defective or damaged condition, please contact us within 48 hours of delivery with photographic evidence. We will review such cases at our sole discretion. This does not constitute a guarantee of refund or replacement.",
      "Size dissatisfaction, change of mind, or delayed delivery do not qualify as grounds for refund or return.",
    ],
    highlight: true,
  },
  {
    id: "06",
    title: "Custom & Bulk Orders",
    body: [
      "Custom-made products — including but not limited to branded uniforms, sports jerseys, and corporate apparel — are non-cancellable once production has commenced.",
      "Full or partial advance payment may be required for custom orders. Custom order details, timelines, and payment terms will be communicated separately.",
      "Any approved design or specification changes after production commencement may result in additional charges.",
    ],
  },
  {
    id: "07",
    title: "Intellectual Property",
    body: [
      "All content on this website — including text, images, graphics, logos, and design elements — is the property of Lumielle and is protected under applicable intellectual property laws.",
      "You may not reproduce, distribute, or use any content from this website without prior written permission from Lumielle.",
    ],
  },
  {
    id: "08",
    title: "Privacy",
    body: [
      "By using our website, you consent to the collection and use of your personal information as described in our Privacy Policy.",
      "We do not sell, rent, or share your personal information with third parties for marketing purposes.",
      "We use your information solely to process orders, improve our services, and communicate with you about your purchases.",
    ],
  },
  {
    id: "09",
    title: "Limitation of Liability",
    body: [
      "Lumielle shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.",
      "Our total liability to you for any claim arising out of a purchase shall not exceed the amount you paid for that specific order.",
    ],
  },
  {
    id: "10",
    title: "Governing Law",
    body: [
      "These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kerala, India.",
    ],
  },
  {
    id: "11",
    title: "Changes to Terms",
    body: [
      "Lumielle reserves the right to update or modify these Terms and Conditions at any time without prior notice. The updated terms will be effective upon posting to this website.",
      "Your continued use of the website after any changes constitutes your acceptance of the revised terms.",
    ],
  },
  {
    id: "12",
    title: "Contact",
    body: [
      "If you have any questions about these Terms and Conditions, please contact us at lumiecart@gmail.com or through the contact form on our website.",
    ],
  },
];

function TermsAndConditions() {
  return (
    <main className="tc">

      {/* ── Hero ── */}
      <section className="tc__hero">
        <div className="tc__hero-inner">
          <div className="tc__hero-text">
            <p className="tc__eyebrow">Legal · {LAST_UPDATED}</p>
            <h1 className="tc__title">
              Terms &amp;<br /><em>Conditions</em>
            </h1>
          </div>
          <p className="tc__hero-sub">
            Please read these terms carefully<br />
            before using our website<br />
            or placing an order.
          </p>
        </div>
        <div className="tc__hero-rule" />
      </section>

      {/* ── Important notice strip ── */}
      <div className="tc__notice">
        <span className="tc__notice-icon">!</span>
        <p>
          <strong>No Refund or Return Policy — </strong>
          All sales are final. Lumielle does not accept returns or issue refunds
          once an order has been confirmed. Please review your order carefully
          before purchase.
        </p>
      </div>

      {/* ── Sections ── */}
      <div className="tc__body">

        {/* TOC sidebar */}
        <aside className="tc__toc">
          <p className="tc__toc-label">Contents</p>
          <nav>
            {sections.map((s) => (
              <a key={s.id} href={`#tc-${s.id}`} className="tc__toc-link">
                <span className="tc__toc-num">{s.id}</span>
                <span>{s.title}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="tc__sections">
          {sections.map((s) => (
            <section
              key={s.id}
              id={`tc-${s.id}`}
              className={`tc__section ${s.highlight ? "tc__section--highlight" : ""}`}
            >
              <div className="tc__section-header">
                <span className="tc__section-num">{s.id}</span>
                <h2 className="tc__section-title">{s.title}</h2>
              </div>
              <div className="tc__section-body">
                {s.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

      </div>

      {/* ── Footer stamp ── */}
      <div className="tc__footer-stamp">
        <div className="tc__footer-rule" />
        <div className="tc__footer-inner">
          <p className="tc__footer-brand">Lumielle</p>
          <p className="tc__footer-note">
            Last updated {LAST_UPDATED} · All rights reserved
          </p>
        </div>
      </div>

    </main>
  );
}

export default TermsAndConditions;
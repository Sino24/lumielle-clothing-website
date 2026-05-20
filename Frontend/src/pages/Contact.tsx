// src/pages/Contact.tsx

import { useState, useEffect } from "react";
import "../styles/PageStyle/Contact.css";

interface AboutData {
  email: string;
  phone: string;
}

type Status = "idle" | "loading" | "success" | "error";

function Contact() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [about, setAbout] = useState<AboutData | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/about`)
      .then((r) => r.json())
      .then((d) => setAbout(d))
      .catch(() => {});
  }, [API_BASE]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg((err as Error).message);
    }
  };

  return (
    <main className="contact">

      {/* ── Hero — split layout ── */}
      <section className="contact__hero">
        <div className="contact__hero-left">
          <p className="contact__eyebrow">Contact</p>
          <h1 className="contact__hero-title">
            Let's start a<br /><em>conversation</em>
          </h1>
        </div>
        <div className="contact__hero-right">
          <div className="contact__hero-rule" />
          <p className="contact__hero-desc">
            For orders, collaborations, or support, feel free to reach out.
          </p>
        </div>
      </section>

      <div className="contact__layout">

        {/* Info */}
        <div className="contact__info">
          <h2>Get in touch</h2>
          <p>For orders, collaborations, or support, feel free to reach out.</p>

          <div className="contact__info-item">
            <span>Email</span>
            <p>{about?.email || "hello@lumielle.com"}</p>
          </div>

          <div className="contact__info-item">
            <span>Phone</span>
            <p>{about?.phone || "+91 98765 43210"}</p>
          </div>

          <div className="contact__info-item">
            <span>Hours</span>
            <p>Mon – Sat, 10am – 6pm IST</p>
          </div>
        </div>

        {/* Form */}
        <form className="contact__form" onSubmit={handleSubmit} noValidate>

          <div className="contact__field">
            <label className="contact__label" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handleChange}
              required
              disabled={status === "loading"}
            />
          </div>

          <div className="contact__field">
            <label className="contact__label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={status === "loading"}
            />
          </div>

          <div className="contact__field">
            <label className="contact__label" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              placeholder="Tell us what's on your mind…"
              rows={6}
              value={form.message}
              onChange={handleChange}
              required
              disabled={status === "loading"}
            />
          </div>

          {status === "error" && (
            <p className="contact__error">⚠ {errorMsg}</p>
          )}

          {status === "success" && (
            <p className="contact__success">
              ✓ Message sent — we'll be in touch soon.
            </p>
          )}

          <button
            type="submit"
            className="contact__submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <span className="contact__spinner" />
            ) : (
              <>Send Message <span className="contact__arrow">→</span></>
            )}
          </button>

        </form>
      </div>
    </main>
  );
}

export default Contact;
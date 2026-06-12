// src/pages/Contact.tsx

import { useState, useEffect } from "react";
import "../styles/PageStyle/Contact.css";
import { useAuth } from "../context/AuthContext";

interface AboutData {
  email: string;
  phone: string;
}

type Status = "idle" | "loading" | "success" | "error";

const WA_NUMBER = "917561032017";
const WA_MESSAGE = encodeURIComponent("Hello! I'd like to get in touch.");

function Contact() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const { token } = useAuth();

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
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
            <p>{about?.phone || "+91 756-103-2017"}</p>
          </div>

          <div className="contact__info-item">
            <span>Hours</span>
            <p>24x7 Customer Support</p>
          </div>

          {/* ── WhatsApp CTA ── */}
          <div className="contact__info-item contact__wa-item">
            <span>WhatsApp</span>
            <p className="contact__wa-desc">Prefer a quicker reply? Chat with us directly.</p>
            <a 
              className="contact__wa-btn"
              href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
            >
              <svg
                className="contact__wa-icon"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M16 2.933C8.832 2.933 3.018 8.746 3.018 15.915c0 2.29.61 4.532 1.77 6.497L3 29.067l6.838-1.756a13.006 13.006 0 0 0 6.162 1.557h.003C23.169 28.868 29 23.055 29 15.886 29 8.746 23.169 2.933 16 2.933Zm0 23.867a10.887 10.887 0 0 1-5.55-1.52l-.398-.236-4.06 1.043 1.067-3.956-.26-.41A10.84 10.84 0 0 1 5.11 15.914c0-5.999 4.888-10.88 10.89-10.88 5.999 0 10.887 4.881 10.887 10.88 0 5.997-4.888 10.886-10.887 10.886Zm5.974-8.152c-.325-.163-1.926-.95-2.225-1.058-.299-.109-.517-.163-.734.163-.217.325-.842 1.058-1.032 1.276-.19.217-.38.244-.706.081-.325-.163-1.374-.507-2.618-1.614-.968-.863-1.621-1.928-1.811-2.253-.19-.326-.02-.502.143-.664.147-.146.325-.38.488-.571.163-.19.217-.326.326-.543.109-.217.054-.407-.027-.57-.082-.163-.735-1.768-1.007-2.42-.264-.634-.534-.548-.734-.558l-.625-.011c-.217 0-.57.081-.869.407-.299.325-1.14 1.113-1.14 2.716 0 1.603 1.167 3.151 1.33 3.368.163.217 2.295 3.504 5.558 4.912.777.335 1.383.535 1.856.685.78.248 1.49.213 2.05.13.625-.094 1.926-.787 2.198-1.547.271-.76.271-1.413.19-1.548-.081-.135-.298-.217-.624-.38Z" />
              </svg>
              Chat on WhatsApp
            </a>
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
            <p className="contact__error">&#9888; {errorMsg}</p>
          )}

          {status === "success" && (
            <p className="contact__success">
              &#10003; Message sent &mdash; we&apos;ll be in touch soon.
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
              <>Send Message <span className="contact__arrow">&#8594;</span></>
            )}
          </button>

        </form>
      </div>

      {/* ── Floating WhatsApp bubble ── */}
      <a  
        className="contact__wa-float"
        href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M16 2.933C8.832 2.933 3.018 8.746 3.018 15.915c0 2.29.61 4.532 1.77 6.497L3 29.067l6.838-1.756a13.006 13.006 0 0 0 6.162 1.557h.003C23.169 28.868 29 23.055 29 15.886 29 8.746 23.169 2.933 16 2.933Zm0 23.867a10.887 10.887 0 0 1-5.55-1.52l-.398-.236-4.06 1.043 1.067-3.956-.26-.41A10.84 10.84 0 0 1 5.11 15.914c0-5.999 4.888-10.88 10.89-10.88 5.999 0 10.887 4.881 10.887 10.88 0 5.997-4.888 10.886-10.887 10.886Zm5.974-8.152c-.325-.163-1.926-.95-2.225-1.058-.299-.109-.517-.163-.734.163-.217.325-.842 1.058-1.032 1.276-.19.217-.38.244-.706.081-.325-.163-1.374-.507-2.618-1.614-.968-.863-1.621-1.928-1.811-2.253-.19-.326-.02-.502.143-.664.147-.146.325-.38.488-.571.163-.19.217-.326.326-.543.109-.217.054-.407-.027-.57-.082-.163-.735-1.768-1.007-2.42-.264-.634-.534-.548-.734-.558l-.625-.011c-.217 0-.57.081-.869.407-.299.325-1.14 1.113-1.14 2.716 0 1.603 1.167 3.151 1.33 3.368.163.217 2.295 3.504 5.558 4.912.777.335 1.383.535 1.856.685.78.248 1.49.213 2.05.13.625-.094 1.926-.787 2.198-1.547.271-.76.271-1.413.19-1.548-.081-.135-.298-.217-.624-.38Z" />
        </svg>
        <span className="contact__wa-float-label">Chat with us</span>
      </a>

    </main>
  );
}

export default Contact;
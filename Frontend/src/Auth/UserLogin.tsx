import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/UserStyle/UserLogin.css";

type Mode = "login" | "signup";

interface FormState {
  name:            string;
  email:           string;
  password:        string;
  confirmPassword: string;
  phone:           string;
}

const BLANK: FormState = {
  name: "", email: "", password: "", confirmPassword: "", phone: "",
};

const UserAuth: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const from = (location.state as { from?: string })?.from || "/account";

  const [mode,       setMode]       = useState<Mode>("login");
  const [form,       setForm]       = useState<FormState>({ ...BLANK });
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState<string | null>(null);

  // verify state — only used after signup
  const [verifyMode, setVerifyMode] = useState(false);
  const [userId,     setUserId]     = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  const switchMode = (m: Mode) => {
    setMode(m);
    setForm({ ...BLANK });
    setError(null);
    setSuccess(null);
    setShowPw(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!form.email.trim())                return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email.";
    if (!form.password)                    return "Password is required.";
    if (form.password.length < 6)          return "Password must be at least 6 characters.";
    if (mode === "signup") {
      if (!form.name.trim())                      return "Full name is required.";
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login"
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password, phone: form.phone };

    try {
      const res  = await fetch(`${API_BASE}${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      if (mode === "signup") {
        // Show verify screen after registration
        setUserId(data.userId);
        setVerifyMode(true);
      } else {
        // Login — go straight in, no verify step
        login(data.token, data.user);
        navigate(from, { replace: true });
      }

    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim())      { setError("Please enter the verification code."); return; }
    if (verifyCode.length !== 6) { setError("Code must be 6 digits."); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId, code: verifyCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      login(data.token, data.user);
      navigate(from, { replace: true });

    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // ── Verify screen (only shown after signup) ───────────
  if (verifyMode) {
    return (
      <div className="ua-page">
        <div className="ua-orb ua-orb--1" />
        <div className="ua-orb ua-orb--2" />
        <div className="ua-orb ua-orb--3" />
        <div className="ua-wrap ua-wrap--verify">
          <div className="ua-form-panel">
            <div className="ua-verify-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
                   width="32" height="32" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
            </div>
            <div className="ua-form-head">
              <h1 className="ua-heading">Check your email</h1>
              <p className="ua-subheading">
                We sent a 6-digit code to your email. Enter it below to activate your account.
              </p>
            </div>
            <form className="ua-form" onSubmit={handleVerify} noValidate>
              <div className="ua-field">
                <label className="ua-label" htmlFor="verify-code">Verification Code</label>
                <div className="ua-input-wrap">
                  <svg className="ua-ico" width="16" height="16" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    id="verify-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    className="ua-input ua-input--code"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => { setVerifyCode(e.target.value); setError(null); }}
                    disabled={loading}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>
                <p className="ua-field-hint">Code expires in 10 minutes</p>
              </div>

              {error && (
                <div className="ua-error" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                       width="14" height="14" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="ua-submit" disabled={loading}>
                <span className="ua-submit-inner">
                  {loading ? (
                    <><span className="ua-spin" aria-hidden="true" />Verifying…</>
                  ) : (
                    <>
                      Verify & Continue
                      <svg className="ua-arrow" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="1.5" width="14" height="14"
                           aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                className="ua-back-btn"
                onClick={() => { setVerifyMode(false); setError(null); setVerifyCode(""); switchMode("login"); }}
              >
                ← Back to sign in
              </button>
            </form>
            <p className="ua-footer">Lumielle · Your fashion destination · {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main login / signup screen ────────────────────────
  return (
    <div className="ua-page">
      <div className="ua-orb ua-orb--1" />
      <div className="ua-orb ua-orb--2" />
      <div className="ua-orb ua-orb--3" />

      <div className="ua-wrap">
        {/* Left branding panel */}
        <div className="ua-side">
          <div className="ua-side-inner">
            <div className="ua-logo-mark">L</div>
            <h2 className="ua-side-title">Lumielle</h2>
            <p className="ua-side-desc">
              Curated clothing for the modern wardrobe. Sign in to save your cart,
              track orders, and manage your profile.
            </p>
            <div className="ua-side-rules">
              {["Save your wishlist & cart", "Track your orders", "Manage delivery addresses"].map((r) => (
                <div className="ua-side-rule" key={r}>
                  <span className="ua-rule-dot" />
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="ua-form-panel">
          <div className="ua-tabs" role="tablist">
            <button
              className={`ua-tab ${mode === "login" ? "ua-tab--active" : ""}`}
              onClick={() => switchMode("login")}
              type="button" role="tab" aria-selected={mode === "login"}
            >Sign In</button>
            <button
              className={`ua-tab ${mode === "signup" ? "ua-tab--active" : ""}`}
              onClick={() => switchMode("signup")}
              type="button" role="tab" aria-selected={mode === "signup"}
            >Create Account</button>
            <div className={`ua-tab-bar ua-tab-bar--${mode}`} aria-hidden="true" />
          </div>

          <div className="ua-form-head">
            <h1 className="ua-heading">{mode === "login" ? "Welcome back" : "Join Lumielle"}</h1>
            <p className="ua-subheading">
              {mode === "login" ? "Sign in to your account" : "Create a free account to get started"}
            </p>
          </div>

          <form className="ua-form" onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <div className="ua-field ua-field--animate">
                <label className="ua-label" htmlFor="name">Full Name</label>
                <div className="ua-input-wrap">
                  <svg className="ua-ico" width="16" height="16" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input id="name" name="name" type="text" placeholder="Jane Smith"
                    className="ua-input" value={form.name}
                    onChange={handleChange} disabled={loading} autoComplete="name" />
                </div>
              </div>
            )}

            <div className="ua-field">
              <label className="ua-label" htmlFor="email">Email</label>
              <div className="ua-input-wrap">
                <svg className="ua-ico" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m2 7 10 7 10-7"/>
                </svg>
                <input id="email" name="email" type="email" placeholder="you@example.com"
                  className="ua-input" value={form.email}
                  onChange={handleChange} disabled={loading} autoComplete="email" />
              </div>
            </div>

            {mode === "signup" && (
              <div className="ua-field ua-field--animate">
                <label className="ua-label" htmlFor="phone">
                  Phone <span className="ua-optional">(optional)</span>
                </label>
                <div className="ua-input-wrap">
                  <svg className="ua-ico" width="16" height="16" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.51 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.05 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <input id="phone" name="phone" type="tel" placeholder="+91 98765 43210"
                    className="ua-input" value={form.phone}
                    onChange={handleChange} disabled={loading} autoComplete="tel" />
                </div>
              </div>
            )}

            <div className="ua-field">
              <label className="ua-label" htmlFor="password">Password</label>
              <div className="ua-input-wrap">
                <svg className="ua-ico" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="password" name="password"
                  type={showPw ? "text" : "password"} placeholder="••••••••"
                  className="ua-input ua-input--pw" value={form.password}
                  onChange={handleChange} disabled={loading}
                  autoComplete={mode === "login" ? "current-password" : "new-password"} />
                <button type="button" className="ua-toggle-pw"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"} tabIndex={-1}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="ua-field ua-field--animate">
                <label className="ua-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="ua-input-wrap">
                  <svg className="ua-ico" width="16" height="16" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input id="confirmPassword" name="confirmPassword"
                    type={showPw ? "text" : "password"} placeholder="••••••••"
                    className="ua-input ua-input--pw" value={form.confirmPassword}
                    onChange={handleChange} disabled={loading} autoComplete="new-password" />
                </div>
              </div>
            )}

            {error && (
              <div className="ua-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                     width="14" height="14" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="ua-success" role="status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                     width="14" height="14" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
                <span>{success}</span>
              </div>
            )}

            <button type="submit" className="ua-submit" disabled={loading}>
              <span className="ua-submit-inner">
                {loading ? (
                  <>
                    <span className="ua-spin" aria-hidden="true" />
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <svg className="ua-arrow" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.5" width="14" height="14"
                         aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="ua-footer">Lumielle · Your fashion destination · {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;
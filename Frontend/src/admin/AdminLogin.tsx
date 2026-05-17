// src/pages/Admin/AdminAuth.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminStyle/AdminLogin.css";

type Mode = "login" | "signup";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
}

const BLANK: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  inviteCode: "",
};

const AdminAuth: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState<FormState>({ ...BLANK });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    setForm({ ...BLANK });
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const validate = (): string | null => {
    if (mode === "signup") {
      if (!form.name.trim()) return "Full name is required.";
      if (!form.inviteCode.trim()) return "Invite code is required.";
      if (form.password !== form.confirmPassword)
        return "Passwords do not match.";
    }
    if (!form.email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);

    const endpoint =
      mode === "login" ? "/admin/login" : "/admin/signup";

    const body =
      mode === "login"
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            inviteCode: form.inviteCode,
          };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      // Persist token and admin info
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminName", data.admin?.name || "Admin");
      localStorage.setItem("adminRole", data.admin?.role || "admin");

      if (mode === "signup") {
        setSuccess("Account created! Redirecting to dashboard…");
        setTimeout(() => navigate("/admin"), 1400);
      } else {
        navigate("/admin");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aa-page">

      {/* Background ornaments */}
      <div className="aa-orb aa-orb--1" />
      <div className="aa-orb aa-orb--2" />
      <div className="aa-orb aa-orb--3" />

      <div className="aa-wrap">

        {/* ── Left: branding panel ── */}
        <div className="aa-side">
          <div className="aa-side-inner">
            <div className="aa-logo-mark">L</div>
            <h2 className="aa-side-title">Lumielle<br />Admin</h2>
            <p className="aa-side-desc">
              A secure workspace for the people who keep Lumielle running beautifully.
            </p>

            <div className="aa-side-rules">
              <div className="aa-side-rule">
                <span className="aa-rule-dot" />
                Invite-only access
              </div>
              <div className="aa-side-rule">
                <span className="aa-rule-dot" />
                Manage products &amp; inventory
              </div>
              <div className="aa-side-rule">
                <span className="aa-rule-dot" />
                Role-based permissions
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div className="aa-form-panel">

          {/* Tab toggle */}
          <div className="aa-tabs">
            <button
              className={`aa-tab ${mode === "login" ? "aa-tab--active" : ""}`}
              onClick={() => switchMode("login")}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`aa-tab ${mode === "signup" ? "aa-tab--active" : ""}`}
              onClick={() => switchMode("signup")}
              type="button"
            >
              Create Account
            </button>
            {/* Sliding indicator */}
            <div className={`aa-tab-bar aa-tab-bar--${mode}`} />
          </div>

          <div className="aa-form-head">
            <h1 className="aa-heading">
              {mode === "login" ? "Welcome back" : "Join the team"}
            </h1>
            <p className="aa-subheading">
              {mode === "login"
                ? "Sign in to your admin account"
                : "You'll need an invite code from a superadmin"}
            </p>
          </div>

          <form className="aa-form" onSubmit={handleSubmit} noValidate>

            {/* Name — signup only */}
            {mode === "signup" && (
              <div className="aa-field aa-field--animate">
                <label className="aa-label" htmlFor="name">Full Name</label>
                <div className="aa-input-wrap">
                  <span className="aa-ico">👤</span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Smith"
                    className="aa-input"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="aa-field">
              <label className="aa-label" htmlFor="email">Email</label>
              <div className="aa-input-wrap">
                <span className="aa-ico">✉</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@lumielle.com"
                  className="aa-input"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="aa-field">
              <label className="aa-label" htmlFor="password">Password</label>
              <div className="aa-input-wrap">
                <span className="aa-ico">⚿</span>
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="aa-input"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="aa-toggle-pw"
                  onClick={() => setShowPw((s) => !s)}
                  tabIndex={-1}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm password — signup only */}
            {mode === "signup" && (
              <div className="aa-field aa-field--animate">
                <label className="aa-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="aa-input-wrap">
                  <span className="aa-ico">⚿</span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="aa-input"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Invite code — signup only */}
            {mode === "signup" && (
              <div className="aa-field aa-field--animate">
                <label className="aa-label" htmlFor="inviteCode">
                  Invite Code <span className="aa-req">*</span>
                </label>
                <div className="aa-input-wrap">
                  <span className="aa-ico">🔑</span>
                  <input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    placeholder="Enter your invite code"
                    className="aa-input aa-input--code"
                    value={form.inviteCode}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <p className="aa-field-hint">
                  Ask a superadmin for this code. It stays the same until changed in .env
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="aa-error" role="alert">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="aa-success" role="status">
                <span>✓</span>
                <span>{success}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="aa-submit"
              disabled={loading}
            >
              <span className="aa-submit-inner">
                {loading ? (
                  <>
                    <span className="aa-spin" />
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <span className="aa-arrow">→</span>
                  </>
                )}
              </span>
            </button>

          </form>

          <p className="aa-footer">
            Lumielle Admin · Protected workspace · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
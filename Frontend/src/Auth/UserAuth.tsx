// src/pages/UserAuth.tsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/PageStyle/UserAuth.css";

type Mode = "login" | "signup";

interface FormState {
  name:            string;
  email:           string;
  password:        string;
  confirmPassword: string;
  phone:           string;
}

const BLANK: FormState = {
  name:            "",
  email:           "",
  password:        "",
  confirmPassword: "",
  phone:           "",
};

const UserAuth: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // Redirect to wherever the user came from, or home
  const from = (location.state as { from?: string })?.from || "/";

  const [mode,    setMode]    = useState<Mode>("login");
  const [form,    setForm]    = useState<FormState>({ ...BLANK });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
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
    if (!form.email.trim())            return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email.";
    if (!form.password)                return "Password is required.";
    if (form.password.length < 6)      return "Password must be at least 6 characters.";

    if (mode === "signup") {
      if (!form.name.trim())                       return "Full name is required.";
      if (form.password !== form.confirmPassword)  return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);

    const endpoint =
      mode === "login" ? "/api/auth/login" : "/api/auth/register";

    const body =
      mode === "login"
        ? { email: form.email, password: form.password }
        : {
            name:     form.name,
            email:    form.email,
            password: form.password,
            phone:    form.phone,
          };

    try {
      const res  = await fetch(`${API_BASE}${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      // Persist via AuthContext
      login(data.token, data.user);

      if (mode === "signup") {
        setSuccess("Account created! Redirecting…");
        setTimeout(() => navigate(from, { replace: true }), 1200);
      } else {
        navigate(from, { replace: true });
      }

    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ua-page">

      {/* Background orbs — same treatment as AdminAuth */}
      <div className="ua-orb ua-orb--1" />
      <div className="ua-orb ua-orb--2" />
      <div className="ua-orb ua-orb--3" />

      <div className="ua-wrap">

        {/* ── Left branding panel ── */}
        <div className="ua-side">
          <div className="ua-side-inner">
            <div className="ua-logo-mark">L</div>
            <h2 className="ua-side-title">Lumielle</h2>
            <p className="ua-side-desc">
              Curated clothing for the modern wardrobe. Sign in to save your cart, track orders, and manage your profile.
            </p>
            <div className="ua-side-rules">
              <div className="ua-side-rule">
                <span className="ua-rule-dot" />
                Save your wishlist &amp; cart
              </div>
              <div className="ua-side-rule">
                <span className="ua-rule-dot" />
                Track your orders
              </div>
              <div className="ua-side-rule">
                <span className="ua-rule-dot" />
                Manage delivery addresses
              </div>
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="ua-form-panel">

          {/* Tab toggle */}
          <div className="ua-tabs">
            <button
              className={`ua-tab ${mode === "login" ? "ua-tab--active" : ""}`}
              onClick={() => switchMode("login")}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`ua-tab ${mode === "signup" ? "ua-tab--active" : ""}`}
              onClick={() => switchMode("signup")}
              type="button"
            >
              Create Account
            </button>
            <div className={`ua-tab-bar ua-tab-bar--${mode}`} />
          </div>

          <div className="ua-form-head">
            <h1 className="ua-heading">
              {mode === "login" ? "Welcome back" : "Join Lumielle"}
            </h1>
            <p className="ua-subheading">
              {mode === "login"
                ? "Sign in to your account"
                : "Create a free account to get started"}
            </p>
          </div>

          <form className="ua-form" onSubmit={handleSubmit} noValidate>

            {/* Name — signup only */}
            {mode === "signup" && (
              <div className="ua-field ua-field--animate">
                <label className="ua-label" htmlFor="name">Full Name</label>
                <div className="ua-input-wrap">
                  <span className="ua-ico">👤</span>
                  <input
                    id="name" name="name" type="text"
                    placeholder="Jane Smith"
                    className="ua-input"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="ua-field">
              <label className="ua-label" htmlFor="email">Email</label>
              <div className="ua-input-wrap">
                <span className="ua-ico">✉</span>
                <input
                  id="email" name="email" type="email"
                  placeholder="you@example.com"
                  className="ua-input"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone — signup only */}
            {mode === "signup" && (
              <div className="ua-field ua-field--animate">
                <label className="ua-label" htmlFor="phone">
                  Phone <span className="ua-optional">(optional)</span>
                </label>
                <div className="ua-input-wrap">
                  <span className="ua-ico">📱</span>
                  <input
                    id="phone" name="phone" type="tel"
                    placeholder="+91 98765 43210"
                    className="ua-input"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="ua-field">
              <label className="ua-label" htmlFor="password">Password</label>
              <div className="ua-input-wrap">
                <span className="ua-ico">⚿</span>
                <input
                  id="password" name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="ua-input"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button" className="ua-toggle-pw"
                  onClick={() => setShowPw((s) => !s)}
                  tabIndex={-1}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm password — signup only */}
            {mode === "signup" && (
              <div className="ua-field ua-field--animate">
                <label className="ua-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="ua-input-wrap">
                  <span className="ua-ico">⚿</span>
                  <input
                    id="confirmPassword" name="confirmPassword"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="ua-input"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="ua-error" role="alert">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="ua-success" role="status">
                <span>✓</span>
                <span>{success}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="ua-submit" disabled={loading}>
              <span className="ua-submit-inner">
                {loading ? (
                  <>
                    <span className="ua-spin" />
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <span className="ua-arrow">→</span>
                  </>
                )}
              </span>
            </button>

          </form>

          <p className="ua-footer">
            Lumielle · Your fashion destination · {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  );
};

export default UserAuth;
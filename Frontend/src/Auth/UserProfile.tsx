// src/pages/AccountPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/PageStyle/UserProfile.css";

// ── Types ─────────────────────────────────────────────────
interface Address {
  _id:       string;
  label:     string;
  line1:     string;
  line2:     string;
  city:      string;
  state:     string;
  pincode:   string;
  isDefault: boolean;
}

interface ProfileData {
  id:        string;
  name:      string;
  email:     string;
  phone:     string;
  addresses: Address[];
  createdAt: string;
}

type Tab = "profile" | "orders" | "addresses" | "password";

const BLANK_ADDRESS = {
  label:     "Home",
  line1:     "",
  line2:     "",
  city:      "",
  state:     "",
  pincode:   "",
  isDefault: false,
};

// ── Component ─────────────────────────────────────────────
const AccountPage: React.FC = () => {
  const { token, logout } = useAuth(); // ✅ removed unused 'user'
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [activeTab, setActiveTab]     = useState<Tab>("profile");
  const [profile,   setProfile]       = useState<ProfileData | null>(null);
  const [loading,   setLoading]       = useState(true);
  const [saving,    setSaving]        = useState(false);
  const [msg,       setMsg]           = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });

  // Password form
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm]         = useState({ ...BLANK_ADDRESS });

  // ── Fetch profile ──────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setProfileForm({ name: data.name, phone: data.phone || "" });
      })
      .finally(() => setLoading(false));
  }, [token, API_BASE]);

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  // ── Save profile ───────────────────────────────────────
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return flash("error", "Name cannot be empty.");
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/profile`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile((p) => p ? { ...p, name: data.name, phone: data.phone } : p);
      flash("success", "Profile updated successfully.");
    } catch (err: any) {
      flash("error", err.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next.length < 6)          return flash("error", "New password must be at least 6 characters.");
    if (pwForm.next !== pwForm.confirm)  return flash("error", "Passwords do not match.");
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/password`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwForm({ current: "", next: "", confirm: "" });
      flash("success", "Password changed successfully.");
    } catch (err: any) {
      flash("error", err.message || "Could not change password.");
    } finally {
      setSaving(false);
    }
  };

  // ── Add address ────────────────────────────────────────
  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      return flash("error", "Please fill all required address fields.");
    }
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/address`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(addressForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile((p) => p ? { ...p, addresses: data.addresses } : p);
      setAddressForm({ ...BLANK_ADDRESS });
      setShowAddressForm(false);
      flash("success", "Address saved.");
    } catch (err: any) {
      flash("error", err.message || "Could not save address.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete address ─────────────────────────────────────
  const deleteAddress = async (id: string) => {
    try {
      const res  = await fetch(`${API_BASE}/api/auth/address/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile((p) => p ? { ...p, addresses: data.addresses } : p);
      flash("success", "Address removed.");
    } catch (err: any) {
      flash("error", err.message || "Could not remove address.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ── Tabs config ────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile",   label: "Profile",   icon: "👤" },
    { id: "orders",    label: "Orders",    icon: "📦" },
    { id: "addresses", label: "Addresses", icon: "📍" },
    { id: "password",  label: "Password",  icon: "🔒" },
  ];

  // ── Render ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="acc-loading">
        <span className="acc-spin" />
        Loading your account…
      </div>
    );
  }

  return (
    <div className="acc-page">
      <div className="acc-wrap">

        {/* ── Sidebar ── */}
        <aside className="acc-sidebar">
          {/* Avatar */}
          <div className="acc-avatar">
            <span className="acc-avatar-letter">
              {profile?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="acc-sidebar-name">{profile?.name}</div>
          <div className="acc-sidebar-email">{profile?.email}</div>
          <div className="acc-sidebar-since">
            Member since {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
              : "—"}
          </div>

          {/* Nav */}
          <nav className="acc-nav">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`acc-nav-btn ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="acc-nav-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          <button className="acc-logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </aside>

        {/* ── Main content ── */}
        <main className="acc-main">

          {/* Flash message */}
          {msg && (
            <div className={`acc-flash acc-flash--${msg.type}`}>
              <span>{msg.type === "success" ? "✓" : "⚠"}</span>
              {msg.text}
            </div>
          )}

          {/* ── Profile tab ── */}
          {activeTab === "profile" && (
            <section className="acc-section">
              <div className="acc-section-hd">
                <h2 className="acc-section-title">Personal Information</h2>
                <p className="acc-section-sub">Update your name and phone number</p>
              </div>

              <form className="acc-form" onSubmit={saveProfile}>
                <div className="acc-field">
                  <label className="acc-label">Full Name</label>
                  <input
                    className="acc-input"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    disabled={saving}
                  />
                </div>

                <div className="acc-field">
                  <label className="acc-label">Email</label>
                  <input
                    className="acc-input acc-input--readonly"
                    type="email"
                    value={profile?.email || ""}
                    readOnly
                    title="Email cannot be changed"
                  />
                  <p className="acc-field-hint">Email address cannot be changed.</p>
                </div>

                <div className="acc-field">
                  <label className="acc-label">
                    Phone <span className="acc-optional">(optional)</span>
                  </label>
                  <input
                    className="acc-input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    disabled={saving}
                  />
                </div>

                <button className="acc-btn acc-btn--gold" type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </form>
            </section>
          )}

          {/* ── Orders tab ── */}
          {activeTab === "orders" && (
            <section className="acc-section">
              <div className="acc-section-hd">
                <h2 className="acc-section-title">My Orders</h2>
                <p className="acc-section-sub">Your order history will appear here</p>
              </div>

              <div className="acc-empty">
                <div className="acc-empty-icon">📦</div>
                <div className="acc-empty-title">No orders yet</div>
                <p className="acc-empty-desc">
                  Once you place an order it will show up here with tracking details.
                </p>
                <button
                  className="acc-btn acc-btn--gold"
                  onClick={() => navigate("/product")}
                >
                  Browse Collections
                </button>
              </div>
            </section>
          )}

          {/* ── Addresses tab ── */}
          {activeTab === "addresses" && (
            <section className="acc-section">
              <div className="acc-section-hd">
                <h2 className="acc-section-title">Saved Addresses</h2>
                <p className="acc-section-sub">Manage your delivery addresses</p>
              </div>

              {/* Address cards */}
              {profile?.addresses && profile.addresses.length > 0 ? (
                <div className="acc-address-list">
                  {profile.addresses.map((addr) => (
                    <div key={addr._id} className={`acc-address-card ${addr.isDefault ? "default" : ""}`}>
                      {addr.isDefault && (
                        <span className="acc-address-badge">Default</span>
                      )}
                      <div className="acc-address-label">{addr.label}</div>
                      <div className="acc-address-text">
                        {addr.line1}
                        {addr.line2 && `, ${addr.line2}`}
                      </div>
                      <div className="acc-address-text">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </div>
                      <button
                        className="acc-address-delete"
                        onClick={() => deleteAddress(addr._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                !showAddressForm && (
                  <div className="acc-empty">
                    <div className="acc-empty-icon">📍</div>
                    <div className="acc-empty-title">No addresses saved</div>
                    <p className="acc-empty-desc">Add a delivery address to speed up checkout.</p>
                  </div>
                )
              )}

              {/* Add address form */}
              {showAddressForm ? (
                <form className="acc-form acc-address-form" onSubmit={addAddress}>
                  <div className="acc-section-hd" style={{ marginTop: "1.5rem" }}>
                    <h3 className="acc-section-title" style={{ fontSize: "1.1rem" }}>New Address</h3>
                  </div>

                  <div className="acc-field-row">
                    <div className="acc-field">
                      <label className="acc-label">Label</label>
                      <select
                        className="acc-input"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}
                      >
                        <option>Home</option>
                        <option>Office</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="acc-field acc-field--check">
                      <label className="acc-check-label">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                        />
                        Set as default
                      </label>
                    </div>
                  </div>

                  <div className="acc-field">
                    <label className="acc-label">Address Line 1 *</label>
                    <input
                      className="acc-input"
                      type="text"
                      placeholder="House / flat / street"
                      value={addressForm.line1}
                      onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))}
                      disabled={saving}
                    />
                  </div>

                  <div className="acc-field">
                    <label className="acc-label">Address Line 2 <span className="acc-optional">(optional)</span></label>
                    <input
                      className="acc-input"
                      type="text"
                      placeholder="Area / landmark"
                      value={addressForm.line2}
                      onChange={(e) => setAddressForm((p) => ({ ...p, line2: e.target.value }))}
                      disabled={saving}
                    />
                  </div>

                  <div className="acc-field-row">
                    <div className="acc-field">
                      <label className="acc-label">City *</label>
                      <input
                        className="acc-input"
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                        disabled={saving}
                      />
                    </div>
                    <div className="acc-field">
                      <label className="acc-label">State *</label>
                      <input
                        className="acc-input"
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                        disabled={saving}
                      />
                    </div>
                    <div className="acc-field">
                      <label className="acc-label">Pincode *</label>
                      <input
                        className="acc-input"
                        type="text"
                        placeholder="600001"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="acc-form-actions">
                    <button className="acc-btn acc-btn--gold" type="submit" disabled={saving}>
                      {saving ? "Saving…" : "Save Address"}
                    </button>
                    <button
                      className="acc-btn acc-btn--ghost"
                      type="button"
                      onClick={() => { setShowAddressForm(false); setAddressForm({ ...BLANK_ADDRESS }); }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className="acc-btn acc-btn--outline"
                  style={{ marginTop: "1.5rem" }}
                  onClick={() => setShowAddressForm(true)}
                >
                  + Add New Address
                </button>
              )}
            </section>
          )}

          {/* ── Password tab ── */}
          {activeTab === "password" && (
            <section className="acc-section">
              <div className="acc-section-hd">
                <h2 className="acc-section-title">Change Password</h2>
                <p className="acc-section-sub">Choose a strong password of at least 6 characters</p>
              </div>

              <form className="acc-form" onSubmit={changePassword}>
                <div className="acc-field">
                  <label className="acc-label">Current Password</label>
                  <div className="acc-input-wrap">
                    <input
                      className="acc-input"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={pwForm.current}
                      onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                      disabled={saving}
                      autoComplete="current-password"
                    />
                    <button type="button" className="acc-toggle-pw" onClick={() => setShowPw((v) => !v)}>
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="acc-field">
                  <label className="acc-label">New Password</label>
                  <div className="acc-input-wrap">
                    <input
                      className="acc-input"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={pwForm.next}
                      onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                      disabled={saving}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="acc-field">
                  <label className="acc-label">Confirm New Password</label>
                  <div className="acc-input-wrap">
                    <input
                      className="acc-input"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                      disabled={saving}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button className="acc-btn acc-btn--gold" type="submit" disabled={saving}>
                  {saving ? "Updating…" : "Update Password"}
                </button>
              </form>
            </section>
          )}

        </main>
      </div>
    </div>
  );
};

export default AccountPage;
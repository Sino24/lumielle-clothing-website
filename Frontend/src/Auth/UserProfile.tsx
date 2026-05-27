// src/pages/AccountPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/UserStyle/UserProfile.css";

// ── SVG Icons ─────────────────────────────────────────────
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconPackage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
  </svg>
);
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.51 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.05 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const IconShopping = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

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
  label: "Home", line1: "", line2: "",
  city: "", state: "", pincode: "", isDefault: false,
};

// ── Skeleton ──────────────────────────────────────────────
const AccountSkeleton: React.FC = () => (
  <div className="acc-page">
    <div className="acc-hero acc-hero--skeleton">
      <div className="acc-sk acc-sk--circle" />
      <div className="acc-sk-group">
        <div className="acc-sk acc-sk--title" />
        <div className="acc-sk acc-sk--sub" />
      </div>
    </div>
    <div className="acc-tabs-bar">
      {[1,2,3,4].map(i => <div key={i} className="acc-sk acc-sk--tab" />)}
    </div>
    <div className="acc-content-zone">
      <div className="acc-sk acc-sk--block" />
      <div className="acc-sk acc-sk--block acc-sk--block-sm" />
      <div className="acc-sk acc-sk--block acc-sk--block-sm" />
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────
const AccountPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [activeTab,       setActiveTab]       = useState<Tab>("profile");
  const [profile,         setProfile]         = useState<ProfileData | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [msg,             setMsg]             = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileForm,     setProfileForm]     = useState({ name: "", phone: "" });
  const [pwForm,          setPwForm]          = useState({ current: "", next: "", confirm: "" });
  const [showPw,          setShowPw]          = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm,     setAddressForm]     = useState({ ...BLANK_ADDRESS });

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setProfileForm({ name: data.name, phone: data.phone || "" });
      })
      .catch(() => {/* silent — user sees empty state */})
      .finally(() => setLoading(false));
  }, [token, API_BASE]);

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  // ── FIX: all 4 `any` errors replaced with `unknown` + type-safe message extraction
  const errMsg = (err: unknown): string =>
    err instanceof Error ? err.message : "Something went wrong.";

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return flash("error", "Name cannot be empty.");
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json() as { name: string; phone: string; message?: string };
      if (!res.ok) throw new Error(data.message ?? "Could not update profile.");
      setProfile((p) => p ? { ...p, name: data.name, phone: data.phone } : p);
      flash("success", "Profile updated successfully.");
    } catch (err: unknown) {
      flash("error", errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next.length < 6)         return flash("error", "New password must be at least 6 characters.");
    if (pwForm.next !== pwForm.confirm) return flash("error", "Passwords do not match.");
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Could not change password.");
      setPwForm({ current: "", next: "", confirm: "" });
      flash("success", "Password changed successfully.");
    } catch (err: unknown) {
      flash("error", errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode)
      return flash("error", "Please fill all required address fields.");
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/address`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(addressForm),
      });
      const data = await res.json() as { addresses: Address[]; message?: string };
      if (!res.ok) throw new Error(data.message ?? "Could not save address.");
      setProfile((p) => p ? { ...p, addresses: data.addresses } : p);
      setAddressForm({ ...BLANK_ADDRESS });
      setShowAddressForm(false);
      flash("success", "Address saved.");
    } catch (err: unknown) {
      flash("error", errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res  = await fetch(`${API_BASE}/api/auth/address/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as { addresses: Address[]; message?: string };
      if (!res.ok) throw new Error(data.message ?? "Could not remove address.");
      setProfile((p) => p ? { ...p, addresses: data.addresses } : p);
      flash("success", "Address removed.");
    } catch (err: unknown) {
      flash("error", errMsg(err));
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const tabs: { id: Tab; label: string; Icon: React.FC }[] = [
    { id: "profile",   label: "My Profile",   Icon: IconUser },
    { id: "orders",    label: "My Orders",    Icon: IconPackage },
    { id: "addresses", label: "Addresses",    Icon: IconMapPin },
    { id: "password",  label: "Password",     Icon: IconLock },
  ];

  if (loading) return <AccountSkeleton />;

  const initials = profile?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="acc-page">

      {/* ── Hero banner ───────────────────────────────── */}
      <div className="acc-hero">
        <div className="acc-hero-inner">
          <div className="acc-hero-left">
            <div className="acc-avatar">{initials}</div>
            <div className="acc-hero-info">
              <h1 className="acc-hero-name">{profile?.name}</h1>
              <div className="acc-hero-meta">
                <span className="acc-hero-meta-item">
                  <IconMail />{profile?.email}
                </span>
                {profile?.phone && (
                  <span className="acc-hero-meta-item">
                    <IconPhone />{profile.phone}
                  </span>
                )}
                <span className="acc-hero-meta-item">
                  <IconCalendar />Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
          <button className="acc-logout-btn" onClick={handleLogout}>
            <IconLogOut /><span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── Tab navigation ────────────────────────────── */}
      <div className="acc-tabs-bar">
        <div className="acc-tabs-inner">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`acc-tab-btn${activeTab === id ? " acc-tab-btn--active" : ""}`}
              onClick={() => { setActiveTab(id); setMsg(null); }}
              type="button"
            >
              <span className="acc-tab-icon"><Icon /></span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content zone ──────────────────────────────── */}
      <div className="acc-content-zone">

        {/* Flash message */}
        {msg && (
          <div className={`acc-flash acc-flash--${msg.type}`} role="alert">
            {msg.type === "success" ? <IconCheck /> : <IconAlert />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* ── Profile tab ── */}
        {activeTab === "profile" && (
          <section className="acc-section" key="profile">
            <div className="acc-section-hd">
              <h2 className="acc-section-title">Personal Information</h2>
              <p className="acc-section-sub">Update your name and contact details</p>
            </div>
            <form className="acc-form" onSubmit={saveProfile}>
              <div className="acc-fields-grid">
                <div className="acc-field">
                  <label className="acc-label" htmlFor="pf-name">Full Name</label>
                  <div className="acc-input-wrap">
                    <span className="acc-input-icon"><IconUser /></span>
                    <input
                      id="pf-name"
                      className="acc-input"
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      disabled={saving}
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="acc-field">
                  <label className="acc-label" htmlFor="pf-email">Email Address</label>
                  <div className="acc-input-wrap">
                    <span className="acc-input-icon"><IconMail /></span>
                    <input
                      id="pf-email"
                      className="acc-input acc-input--readonly"
                      type="email"
                      value={profile?.email ?? ""}
                      readOnly
                      title="Email cannot be changed"
                    />
                  </div>
                  <p className="acc-field-hint">Email address cannot be changed.</p>
                </div>

                <div className="acc-field">
                  <label className="acc-label" htmlFor="pf-phone">
                    Phone <span className="acc-optional">(optional)</span>
                  </label>
                  <div className="acc-input-wrap">
                    <span className="acc-input-icon"><IconPhone /></span>
                    <input
                      id="pf-phone"
                      className="acc-input"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      disabled={saving}
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              <div className="acc-form-footer">
                <button className="acc-btn acc-btn--primary" type="submit" disabled={saving}>
                  {saving ? <><span className="acc-spin-sm" aria-hidden="true" />Saving…</> : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── Orders tab ── */}
        {activeTab === "orders" && (
          <section className="acc-section" key="orders">
            <div className="acc-section-hd">
              <h2 className="acc-section-title">My Orders</h2>
              <p className="acc-section-sub">Your complete order history</p>
            </div>
            <div className="acc-empty">
              <div className="acc-empty-icon"><IconShopping /></div>
              <div className="acc-empty-title">No orders yet</div>
              <p className="acc-empty-desc">
                Once you place an order it will show up here with full tracking details.
              </p>
              <button className="acc-btn acc-btn--primary" onClick={() => navigate("/product")}>
                Browse Collections
              </button>
            </div>
          </section>
        )}

        {/* ── Addresses tab ── */}
        {activeTab === "addresses" && (
          <section className="acc-section" key="addresses">
            <div className="acc-section-hd">
              <h2 className="acc-section-title">Saved Addresses</h2>
              <p className="acc-section-sub">Manage your delivery addresses</p>
            </div>

            {(profile?.addresses?.length ?? 0) > 0 && (
              <div className="acc-address-list">
                {profile!.addresses.map((addr) => (
                  <div key={addr._id} className={`acc-address-card${addr.isDefault ? " acc-address-card--default" : ""}`}>
                    <div className="acc-address-card-top">
                      <span className="acc-address-label-icon">
                        {addr.label === "Home"
                          ? <IconHome />
                          : addr.label === "Office"
                          ? <IconBriefcase />
                          : <IconMapPin />}
                      </span>
                      <span className="acc-address-label">{addr.label}</span>
                      {addr.isDefault && <span className="acc-address-badge">Default</span>}
                      <button
                        className="acc-address-delete"
                        onClick={() => deleteAddress(addr._id)}
                        title="Remove address"
                        aria-label="Remove address"
                        type="button"
                      >
                        <IconTrash />
                      </button>
                    </div>
                    <p className="acc-address-text">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                    </p>
                    <p className="acc-address-text">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!showAddressForm && (profile?.addresses?.length ?? 0) === 0 && (
              <div className="acc-empty">
                <div className="acc-empty-icon"><IconMapPin /></div>
                <div className="acc-empty-title">No addresses saved</div>
                <p className="acc-empty-desc">Add a delivery address to speed up checkout.</p>
              </div>
            )}

            {showAddressForm ? (
              <form className="acc-form acc-address-form" onSubmit={addAddress}>
                <div className="acc-section-hd acc-section-hd--sub">
                  <h3 className="acc-section-title acc-section-title--sm">New Address</h3>
                </div>

                <div className="acc-fields-grid">
                  <div className="acc-field">
                    <label className="acc-label">Label</label>
                    <select
                      className="acc-input acc-select"
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
                      Set as default address
                    </label>
                  </div>

                  <div className="acc-field acc-field--full">
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

                  <div className="acc-field acc-field--full">
                    <label className="acc-label">
                      Address Line 2 <span className="acc-optional">(optional)</span>
                    </label>
                    <input
                      className="acc-input"
                      type="text"
                      placeholder="Area / landmark"
                      value={addressForm.line2}
                      onChange={(e) => setAddressForm((p) => ({ ...p, line2: e.target.value }))}
                      disabled={saving}
                    />
                  </div>

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

                <div className="acc-form-footer">
                  <button className="acc-btn acc-btn--primary" type="submit" disabled={saving}>
                    {saving ? <><span className="acc-spin-sm" aria-hidden="true" />Saving…</> : "Save Address"}
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
                className="acc-btn acc-btn--outline acc-add-addr-btn"
                type="button"
                onClick={() => setShowAddressForm(true)}
              >
                <IconPlus /><span>Add New Address</span>
              </button>
            )}
          </section>
        )}

        {/* ── Password tab ── */}
        {activeTab === "password" && (
          <section className="acc-section" key="password">
            <div className="acc-section-hd">
              <h2 className="acc-section-title">Change Password</h2>
              <p className="acc-section-sub">Choose a strong password of at least 6 characters</p>
            </div>
            <form className="acc-form" onSubmit={changePassword}>
              <div className="acc-fields-grid acc-fields-grid--narrow">
                {(["current", "next", "confirm"] as const).map((field, i) => (
                  <div className="acc-field acc-field--full" key={field}>
                    <label className="acc-label" htmlFor={`pw-${field}`}>
                      {field === "current" ? "Current Password" : field === "next" ? "New Password" : "Confirm New Password"}
                    </label>
                    <div className="acc-input-wrap">
                      <span className="acc-input-icon"><IconLock /></span>
                      <input
                        id={`pw-${field}`}
                        className="acc-input acc-input--pw"
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
                        value={pwForm[field]}
                        onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                        disabled={saving}
                        autoComplete={field === "current" ? "current-password" : "new-password"}
                      />
                      {i === 0 && (
                        <button
                          type="button"
                          className="acc-toggle-pw"
                          onClick={() => setShowPw((v) => !v)}
                          aria-label={showPw ? "Hide password" : "Show password"}
                        >
                          {showPw ? <IconEyeOff /> : <IconEye />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="acc-form-footer">
                <button className="acc-btn acc-btn--primary" type="submit" disabled={saving}>
                  {saving ? <><span className="acc-spin-sm" aria-hidden="true" />Updating…</> : "Update Password"}
                </button>
              </div>
            </form>
          </section>
        )}

      </div>{/* end content zone */}
    </div>
  );
};

export default AccountPage;
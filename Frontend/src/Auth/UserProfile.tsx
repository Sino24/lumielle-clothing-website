// src/pages/AccountPage.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  IoBagOutline,
  IoTrashOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoCartOutline,
  IoArrowForwardOutline,
} from "react-icons/io5";
import "../styles/UserStyle/UserProfile.css";

// ── SVG Icons ─────────────────────────────────────────────
const IconUser      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPackage   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const IconMapPin    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconLock      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconLogOut    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconMail      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>;
const IconPhone     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.51 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.05 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg>;
const IconCheck     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>;
const IconAlert     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconEye       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IconPlus      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconHome      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconBriefcase = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const IconShopping  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const IconCalendar  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconTruck     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IconChevron   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

// ── Types ─────────────────────────────────────────────────
interface Address {
  _id: string; label: string; line1: string; line2: string;
  city: string; state: string; pincode: string; isDefault: boolean;
}
interface ProfileData {
  id: string; name: string; email: string; phone: string;
  addresses: Address[]; createdAt: string;
}
interface OrderItem {
  productId: string; name: string; price: string;
  img: string; size: string; quantity: number;
}
interface Order {
  _id:       string;
  items:     OrderItem[];
  total:     number;
  status:    "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  address?:  { label: string; line1: string; line2?: string; city: string; state: string; pincode: string };
  createdAt: string;
}

type Tab = "profile" | "orders" | "addresses" | "password" | "cart";

const BLANK_ADDRESS = {
  label: "Home", line1: "", line2: "",
  city: "", state: "", pincode: "", isDefault: false,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#9a6e1a", bg: "rgba(201,169,110,0.12)" },
  confirmed: { label: "Confirmed", color: "#2c6b4f", bg: "rgba(44,107,79,0.10)"  },
  shipped:   { label: "Shipped",   color: "#1d5a8a", bg: "rgba(29,90,138,0.10)"  },
  delivered: { label: "Delivered", color: "#1a5c35", bg: "rgba(26,92,53,0.10)"   },
  cancelled: { label: "Cancelled", color: "#9a2020", bg: "rgba(154,32,32,0.10)"  },
};

const parsePrice = (str: string) =>
  parseInt(str.replace(/[₹,\s]/g, ""), 10) || 0;

// ── Skeleton ──────────────────────────────────────────────
const AccountSkeleton: React.FC = () => (
  <>
    <style>{`
      @keyframes acc-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      .aps-sk { background: linear-gradient(90deg,rgba(26,23,20,.06) 25%,rgba(26,23,20,.11) 50%,rgba(26,23,20,.06) 75%);background-size:200% 100%;animation:acc-shimmer 1.4s ease infinite;border-radius:2px; }
      .aps-sk-light { background: linear-gradient(90deg,rgba(255,255,255,.08) 25%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.08) 75%);background-size:200% 100%;animation:acc-shimmer 1.4s ease infinite;border-radius:2px; }
    `}</style>
    <div style={{ paddingTop: "var(--nav-height,76px)", minHeight: "100vh", background: "#F8F5F0" }}>
      <div style={{ width:"100%", minHeight:130, background:"#1A1714", display:"flex", alignItems:"center", gap:"1.5rem", padding:"2rem max(2rem,5vw)", boxSizing:"border-box" }}>
        <div className="aps-sk-light" style={{ width:68, height:68, borderRadius:"50%", flexShrink:0 }} />
        <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem", flex:1 }}>
          <div className="aps-sk-light" style={{ height:26, width:"min(220px,55%)" }} />
          <div className="aps-sk-light" style={{ height:13, width:"min(320px,80%)", opacity:0.6 }} />
        </div>
      </div>
      <div style={{ width:"100%", background:"#fff", borderBottom:"1px solid rgba(26,23,20,.1)", display:"flex", gap:"0.5rem", padding:"0.75rem max(2rem,5vw)", boxSizing:"border-box" }}>
        {[130,110,110,100,90].map((w,i) => <div key={i} className="aps-sk" style={{ height:36, width:w, flexShrink:0 }} />)}
      </div>
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"2.5rem max(2rem,5vw) 5rem", boxSizing:"border-box", display:"flex", flexDirection:"column", gap:"1rem" }}>
        <div className="aps-sk" style={{ height:160 }} />
        <div className="aps-sk" style={{ height:90 }} />
        <div className="aps-sk" style={{ height:90 }} />
      </div>
    </div>
  </>
);

// ── Order card ────────────────────────────────────────────
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg  = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const shortId = order._id.slice(-8).toUpperCase();

  return (
    <div className={`order-card${expanded ? " order-card--open" : ""}`}>
      <button className="order-card__head" onClick={() => setExpanded((v) => !v)} type="button">
        <div className="order-card__head-left">
          <span className="order-card__id">#{shortId}</span>
          <span className="order-card__date">{date}</span>
        </div>
        <div className="order-card__head-right">
          <span className="order-card__status" style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
          <span className="order-card__total">₹{order.total.toLocaleString("en-IN")}</span>
          <span className={`order-card__chevron${expanded ? " order-card__chevron--open" : ""}`}>
            <IconChevron />
          </span>
        </div>
      </button>

      {expanded && (
        <div className="order-card__body">
          <div className="order-card__items">
            {order.items.map((item, i) => (
              <div key={i} className="order-card__item">
                {item.img && (
                  <div className="order-card__img-wrap">
                    <img src={item.img} alt={item.name} className="order-card__img" />
                  </div>
                )}
                <div className="order-card__item-info">
                  <p className="order-card__item-name">{item.name}</p>
                  <p className="order-card__item-meta">Size: {item.size} &nbsp;·&nbsp; Qty: {item.quantity}</p>
                </div>
                <p className="order-card__item-price">{item.price}</p>
              </div>
            ))}
          </div>
          {order.address && (
            <div className="order-card__addr">
              <span className="order-card__addr-label"><IconTruck /> Delivery address</span>
              <p className="order-card__addr-text">
                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                {order.address.city}, {order.address.state} — {order.address.pincode}
              </p>
            </div>
          )}
          <div className="order-card__footer">
            <span />
            <div className="order-card__total-row">
              <span>Order Total</span>
              <strong>₹{order.total.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Cart Section ──────────────────────────────────────────
const CartSection: React.FC = () => {
  const { cart, removeFromCart, updateQty, clearCart } = useCart();
  const navigate = useNavigate();

  const total     = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="acc-empty">
        <div className="acc-empty-icon">
          <IoCartOutline size={26} />
        </div>
        <div className="acc-empty-title">Your bag is empty</div>
        <p className="acc-empty-desc">
          Add items from the collection and they'll appear here, ready for checkout.
        </p>
        <Link className="acc-btn acc-btn--primary" to="/product">
          Explore Collection <IoArrowForwardOutline style={{ marginLeft: "0.4rem" }} />
        </Link>
      </div>
    );
  }

  return (
    <div className="acc-cart">
      <div className="acc-cart__bar">
        <span className="acc-cart__bar-count">
          <IoBagOutline size={15} />
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
        <button className="acc-cart__clear" onClick={() => clearCart()} type="button">
          <IoTrashOutline size={13} /> Clear bag
        </button>
      </div>

      <div className="acc-cart__list">
        {cart.map((item) => (
          <div key={item._id + item.size} className="acc-cart__item">
            <div className="acc-cart__img-wrap">
              <img src={item.img} alt={item.name} className="acc-cart__img" />
            </div>
            <div className="acc-cart__item-info">
              <p className="acc-cart__item-name">{item.name}</p>
              <p className="acc-cart__item-meta">Size: {item.size}</p>
              <p className="acc-cart__item-price">{item.price}</p>
            </div>
            <div className="acc-cart__item-controls">
              <div className="acc-cart__qty">
                <button
                  className="acc-cart__qty-btn"
                  onClick={() => updateQty(item._id, item.size, item.quantity - 1)}
                  aria-label="Decrease"
                >
                  <IoRemoveOutline size={12} />
                </button>
                <span className="acc-cart__qty-val">{item.quantity}</span>
                <button
                  className="acc-cart__qty-btn"
                  onClick={() => updateQty(item._id, item.size, item.quantity + 1)}
                  aria-label="Increase"
                >
                  <IoAddOutline size={12} />
                </button>
              </div>
              <p className="acc-cart__line-total">
                ₹{(parsePrice(item.price) * item.quantity).toLocaleString("en-IN")}
              </p>
              <button
                className="acc-cart__remove"
                onClick={() => removeFromCart(item._id, item.size)}
                aria-label="Remove item"
              >
                <IoTrashOutline size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="acc-cart__footer">
        <div className="acc-cart__total-row">
          <span className="acc-cart__total-label">Order Total</span>
          <strong className="acc-cart__total-val">₹{total.toLocaleString("en-IN")}</strong>
        </div>
        <p className="acc-cart__note">Inclusive of all taxes · Free shipping above ₹999</p>
        <div className="acc-cart__actions">
          <button
            className="acc-btn acc-btn--primary acc-cart__buynow-btn"
            onClick={() => navigate("/cart")}
            type="button"
          >
            <IoCartOutline size={16} />
            Buy Now
          </button>
          <Link className="acc-btn acc-btn--ghost acc-cart__view-btn" to="/product">
            Continue Shopping <IoArrowForwardOutline size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────
const AccountPage: React.FC = () => {
  const { token, logout } = useAuth();
  const { cart }          = useCart();
  const navigate          = useNavigate();
  const location          = useLocation();
  const API_BASE          = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const navState = location.state as { tab?: Tab; refreshOrders?: boolean } | null;

  const pendingRefreshOrders = useRef<boolean>(navState?.refreshOrders === true);

  const [activeTab,       setActiveTab]       = useState<Tab>(navState?.tab ?? "cart");
  const [profile,         setProfile]         = useState<ProfileData | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [msg,             setMsg]             = useState<{ type: "success"|"error"; text: string }|null>(null);
  const [profileForm,     setProfileForm]     = useState({ name: "", phone: "" });
  const [pwForm,          setPwForm]          = useState({ current: "", next: "", confirm: "" });
  const [showPw,          setShowPw]          = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm,     setAddressForm]     = useState({ ...BLANK_ADDRESS });
  const [orders,          setOrders]          = useState<Order[]>([]);
  const [ordersLoading,   setOrdersLoading]   = useState(false);
  const [ordersLoaded,    setOrdersLoaded]    = useState(false);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const jsonHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization:  `Bearer ${token}`,
  }), [token]);

  // ── KEY FIX: respond to location.state changes even when already mounted ──
  // This handles the case where the user is already on /account (e.g. on the
  // "cart" tab) and clicks "Manage addresses →" in Cart.tsx — React won't
  // remount AccountPage, so useState never re-runs. This effect picks up the
  // new state and switches the tab accordingly.
  useEffect(() => {
    if (!navState?.tab) return;

    setActiveTab(navState.tab);
    setMsg(null);

    if (navState.refreshOrders) {
      pendingRefreshOrders.current = true;
    }

    // Clear the state from history so a page refresh doesn't re-apply it
    navigate("/account", { replace: true, state: null });
  // location.state is the dependency — re-run whenever the state object changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setProfileForm({ name: data.name, phone: data.phone || "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, API_BASE, authHeaders]);

  const fetchOrders = useCallback(() => {
    if (!token) return;
    setOrdersLoading(true);
    fetch(`${API_BASE}/api/cart/orders`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data: Order[]) => {
        setOrders(Array.isArray(data) ? data : []);
        setOrdersLoaded(true);
        pendingRefreshOrders.current = false;
      })
      .catch(() => {
        setOrders([]);
        setOrdersLoaded(true);
        pendingRefreshOrders.current = false;
      })
      .finally(() => setOrdersLoading(false));
  }, [token, API_BASE, authHeaders]);

  useEffect(() => {
    if (activeTab !== "orders" || !token) return;
    if (pendingRefreshOrders.current || !ordersLoaded) {
      fetchOrders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  const flash = (type: "success"|"error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const errMsg = (err: unknown): string =>
    err instanceof Error ? err.message : "Something went wrong.";

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return flash("error", "Name cannot be empty.");
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PATCH", headers: jsonHeaders(), body: JSON.stringify(profileForm),
      });
      const data = await res.json() as { name: string; phone: string; message?: string };
      if (!res.ok) throw new Error(data.message ?? "Could not update profile.");
      setProfile((p) => p ? { ...p, name: data.name, phone: data.phone } : p);
      flash("success", "Profile updated successfully.");
    } catch (err) { flash("error", errMsg(err)); }
    finally { setSaving(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next.length < 6)        return flash("error", "New password must be at least 6 characters.");
    if (pwForm.next !== pwForm.confirm) return flash("error", "Passwords do not match.");
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/password`, {
        method: "PATCH", headers: jsonHeaders(),
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Could not change password.");
      setPwForm({ current: "", next: "", confirm: "" });
      flash("success", "Password changed successfully.");
    } catch (err) { flash("error", errMsg(err)); }
    finally { setSaving(false); }
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode)
      return flash("error", "Please fill all required address fields.");
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/address`, {
        method: "POST", headers: jsonHeaders(), body: JSON.stringify(addressForm),
      });
      const data = await res.json() as { addresses: Address[]; message?: string };
      if (!res.ok) throw new Error(data.message ?? "Could not save address.");
      setProfile((p) => p ? { ...p, addresses: data.addresses } : p);
      setAddressForm({ ...BLANK_ADDRESS });
      setShowAddressForm(false);
      flash("success", "Address saved.");
    } catch (err) { flash("error", errMsg(err)); }
    finally { setSaving(false); }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res  = await fetch(`${API_BASE}/api/auth/address/${id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      const data = await res.json() as { addresses: Address[]; message?: string };
      if (!res.ok) throw new Error(data.message ?? "Could not remove address.");
      setProfile((p) => p ? { ...p, addresses: data.addresses } : p);
      flash("success", "Address removed.");
    } catch (err) { flash("error", errMsg(err)); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const tabs: { id: Tab; label: string; Icon: React.FC }[] = [
    { id: "cart",      label: "My Bag",           Icon: () => <IoBagOutline size={14} /> },
    { id: "orders",    label: "My Orders",        Icon: IconPackage },
    { id: "addresses", label: "Addresses",        Icon: IconMapPin },
    { id: "password",  label: "Password",         Icon: IconLock },
    { id: "profile",   label: "Profile Settings", Icon: IconUser },
  ];

  if (loading) return <AccountSkeleton />;

  const initials    = profile?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="acc-page">

      {/* Hero */}
      <div className="acc-hero">
        <div className="acc-hero-inner">
          <div className="acc-hero-left">
            <div className="acc-avatar">{initials}</div>
            <div className="acc-hero-info">
              <h1 className="acc-hero-name">{profile?.name}</h1>
              <div className="acc-hero-meta">
                <span className="acc-hero-meta-item"><IconMail />{profile?.email}</span>
                {profile?.phone && <span className="acc-hero-meta-item"><IconPhone />{profile.phone}</span>}
                <span className="acc-hero-meta-item"><IconCalendar />Member since {memberSince}</span>
              </div>
            </div>
          </div>
          <button className="acc-logout-btn" onClick={handleLogout}>
            <IconLogOut /><span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
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
              {id === "orders" && orders.length > 0 && (
                <span className="acc-tab-badge">{orders.length}</span>
              )}
              {id === "cart" && cartCount > 0 && (
                <span className="acc-tab-badge acc-tab-badge--gold">{cartCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="acc-content-zone">

        {msg && (
          <div className={`acc-flash acc-flash--${msg.type}`} role="alert">
            {msg.type === "success" ? <IconCheck /> : <IconAlert />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* ── Cart / My Bag ── */}
        {activeTab === "cart" && (
          <section className="acc-section" key="cart">
            <div className="acc-section-hd">
              <h2 className="acc-section-title">My Bag</h2>
              <p className="acc-section-sub">Items currently in your shopping bag</p>
            </div>
            <CartSection />
          </section>
        )}

        {/* ── Orders ── */}
        {activeTab === "orders" && (
          <section className="acc-section" key="orders">
            <div className="acc-section-hd">
              <h2 className="acc-section-title">My Orders</h2>
              <p className="acc-section-sub">Your complete order history</p>
            </div>
            {ordersLoading && (
              <div className="acc-orders-loading">
                <div className="acc-orders-spinner" />
                <p>Loading orders…</p>
              </div>
            )}
            {!ordersLoading && orders.length === 0 && (
              <div className="acc-empty">
                <div className="acc-empty-icon"><IconShopping /></div>
                <div className="acc-empty-title">No orders yet</div>
                <p className="acc-empty-desc">Once you place an order via WhatsApp it will appear here with full tracking details.</p>
                <Link className="acc-btn acc-btn--primary" to="/product">Browse Collections</Link>
              </div>
            )}
            {!ordersLoading && orders.length > 0 && (
              <div className="acc-orders-list">
                {orders.map((order) => <OrderCard key={order._id} order={order} />)}
              </div>
            )}
          </section>
        )}

        {/* ── Addresses ── */}
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
                        {addr.label === "Home" ? <IconHome /> : addr.label === "Office" ? <IconBriefcase /> : <IconMapPin />}
                      </span>
                      <span className="acc-address-label">{addr.label}</span>
                      {addr.isDefault && <span className="acc-address-badge">Default</span>}
                      <button className="acc-address-delete" onClick={() => deleteAddress(addr._id)} type="button" aria-label="Remove address">
                        <IconTrash />
                      </button>
                    </div>
                    <p className="acc-address-text">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                    <p className="acc-address-text">{addr.city}, {addr.state} — {addr.pincode}</p>
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
                    <label className="acc-label" htmlFor="addr-label">Label</label>
                    <select id="addr-label" name="label" className="acc-input acc-select"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}>
                      <option>Home</option><option>Office</option><option>Other</option>
                    </select>
                  </div>
                  <div className="acc-field acc-field--check">
                    <label className="acc-check-label">
                      <input type="checkbox" name="isDefault" checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))} />
                      Set as default address
                    </label>
                  </div>
                  <div className="acc-field acc-field--full">
                    <label className="acc-label" htmlFor="addr-line1">Address Line 1 *</label>
                    <input id="addr-line1" name="address-line1" className="acc-input" type="text"
                      placeholder="House / flat / street" value={addressForm.line1} disabled={saving} autoComplete="address-line1"
                      onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))} />
                  </div>
                  <div className="acc-field acc-field--full">
                    <label className="acc-label" htmlFor="addr-line2">Address Line 2 <span className="acc-optional">(optional)</span></label>
                    <input id="addr-line2" name="address-line2" className="acc-input" type="text"
                      placeholder="Area / landmark" value={addressForm.line2} disabled={saving} autoComplete="address-line2"
                      onChange={(e) => setAddressForm((p) => ({ ...p, line2: e.target.value }))} />
                  </div>
                  <div className="acc-field">
                    <label className="acc-label" htmlFor="addr-city">City *</label>
                    <input id="addr-city" name="city" className="acc-input" type="text"
                      value={addressForm.city} disabled={saving} autoComplete="address-level2"
                      onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="acc-field">
                    <label className="acc-label" htmlFor="addr-state">State *</label>
                    <input id="addr-state" name="state" className="acc-input" type="text"
                      value={addressForm.state} disabled={saving} autoComplete="address-level1"
                      onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} />
                  </div>
                  <div className="acc-field">
                    <label className="acc-label" htmlFor="addr-pincode">Pincode *</label>
                    <input id="addr-pincode" name="postal-code" className="acc-input" type="text"
                      placeholder="600001" value={addressForm.pincode} disabled={saving} autoComplete="postal-code"
                      onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))} />
                  </div>
                </div>
                <div className="acc-form-footer">
                  <button className="acc-btn acc-btn--primary" type="submit" disabled={saving}>Save Address</button>
                  <button className="acc-btn acc-btn--ghost" type="button"
                    onClick={() => { setShowAddressForm(false); setAddressForm({ ...BLANK_ADDRESS }); }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button className="acc-btn acc-btn--outline acc-add-addr-btn" type="button" onClick={() => setShowAddressForm(true)}>
                <IconPlus /><span>Add New Address</span>
              </button>
            )}
          </section>
        )}

        {/* ── Password ── */}
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
                      <input id={`pw-${field}`}
                        name={field === "current" ? "current-password" : "new-password"}
                        className="acc-input acc-input--pw"
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
                        value={pwForm[field]}
                        onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                        disabled={saving}
                        autoComplete={field === "current" ? "current-password" : "new-password"}
                      />
                      {i === 0 && (
                        <button type="button" className="acc-toggle-pw"
                          onClick={() => setShowPw((v) => !v)}
                          aria-label={showPw ? "Hide password" : "Show password"}>
                          {showPw ? <IconEyeOff /> : <IconEye />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="acc-form-footer">
                <button className="acc-btn acc-btn--primary" type="submit" disabled={saving}>Update Password</button>
              </div>
            </form>
          </section>
        )}

        {/* ── Profile Settings ── */}
        {activeTab === "profile" && (
          <section className="acc-section" key="profile">
            <div className="acc-section-hd">
              <h2 className="acc-section-title">Profile Settings</h2>
              <p className="acc-section-sub">Update your name and contact details</p>
            </div>
            <form className="acc-form" onSubmit={saveProfile}>
              <div className="acc-fields-grid">
                <div className="acc-field">
                  <label className="acc-label" htmlFor="pf-name">Full Name</label>
                  <div className="acc-input-wrap">
                    <span className="acc-input-icon"><IconUser /></span>
                    <input id="pf-name" name="name" className="acc-input" type="text"
                      value={profileForm.name} disabled={saving} autoComplete="name"
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                </div>
                <div className="acc-field">
                  <label className="acc-label" htmlFor="pf-email">Email Address</label>
                  <div className="acc-input-wrap">
                    <span className="acc-input-icon"><IconMail /></span>
                    <input id="pf-email" name="email" className="acc-input acc-input--readonly"
                      type="email" value={profile?.email ?? ""} readOnly title="Email cannot be changed" />
                  </div>
                  <p className="acc-field-hint">Email address cannot be changed.</p>
                </div>
                <div className="acc-field">
                  <label className="acc-label" htmlFor="pf-phone">Phone <span className="acc-optional">(optional)</span></label>
                  <div className="acc-input-wrap">
                    <span className="acc-input-icon"><IconPhone /></span>
                    <input id="pf-phone" name="phone" className="acc-input" type="tel"
                      placeholder="+91 98765 43210" value={profileForm.phone} disabled={saving} autoComplete="tel"
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="acc-form-footer">
                <button className="acc-btn acc-btn--primary" type="submit" disabled={saving}>Save Changes</button>
              </div>
            </form>
          </section>
        )}

      </div>
    </div>
  );
};

export default AccountPage;
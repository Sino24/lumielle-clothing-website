// src/pages/Cart.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/PageStyle/Cart.css";

// ── Types ─────────────────────────────────────────────────────────────────────
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
  addresses: Address[];
}

// ── Price helper ──────────────────────────────────────────────────────────────
const parsePrice = (str: string) =>
  parseInt(str.replace(/[₹,\s]/g, ""), 10) || 0;

// ── Component ─────────────────────────────────────────────────────────────────
function Cart() {
  const { cart, removeFromCart, updateQty, clearCart, cartLoading } = useCart();
  const { token } = useAuth();
  const navigate   = useNavigate();
  const API_BASE   = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [addresses,      setAddresses]      = useState<Address[]>([]);
  const [selectedAddr,   setSelectedAddr]   = useState<string>("");
  const [checkingOut,    setCheckingOut]    = useState(false);
  const [orderSuccess,   setOrderSuccess]   = useState(false);
  const [orderId,        setOrderId]        = useState<string>("");

  // Fetch saved addresses when logged in
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setAddresses(data.addresses ?? []);
        const def = data.addresses?.find((a) => a.isDefault);
        if (def) setSelectedAddr(def._id);
      })
      .catch(() => {/* silent */});
  }, [token, API_BASE]);

  const total     = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const buildWhatsAppMsg = () => {
    let msg = "Hello Lumielle,%0A%0AI would like to order:%0A%0A";
    cart.forEach((item, i) => {
      msg += `${i + 1}. ${item.name}%0A`;
      msg += `Size: ${item.size}%0A`;
      msg += `Qty: ${item.quantity}%0A`;
      msg += `Price: ${item.price}%0A%0A`;
    });
    msg += `Total: ₹${total.toLocaleString("en-IN")}%0A%0A`;

    if (selectedAddr) {
      const addr = addresses.find((a) => a._id === selectedAddr);
      if (addr) {
        msg += `Delivery to:%0A`;
        msg += `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}%0A`;
        msg += `${addr.city}, ${addr.state} — ${addr.pincode}%0A%0A`;
      }
    }
    return msg;
  };

  const checkout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);

    try {
      // If logged in → create order record first
      if (token) {
        const res  = await fetch(`${API_BASE}/api/cart/checkout`, {
          method:  "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items:     cart.map(({ _id, name, price, img, size, quantity }) => ({
              productId: _id, name, price, img, size, quantity,
            })),
            addressId: selectedAddr || undefined,
          }),
        });
        const data = await res.json() as { order?: { _id: string }; message?: string };

        if (res.ok && data.order) {
          setOrderId(data.order._id);
          await clearCart();
          setOrderSuccess(true);
        }
      }

      // Open WhatsApp regardless of auth state
      window.open(`https://wa.me/+918590109684?text=${buildWhatsAppMsg()}`, "_blank");

      if (!token) {
        // Guest: just clear local cart after redirect
        await clearCart();
      }
    } catch {
      // Open WhatsApp even on error
      window.open(`https://wa.me/+918590109684?text=${buildWhatsAppMsg()}`, "_blank");
    } finally {
      setCheckingOut(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (cartLoading) {
    return (
      <main className="cart-loading">
        <div className="cart-loading__spinner" />
        <p className="cart-loading__text">Loading your bag…</p>
      </main>
    );
  }

  // ── Order success ────────────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <main className="cart-success">
        <div className="cart-success__icon">✓</div>
        <p className="cart-success__eyebrow">Order Placed</p>
        <h1 className="cart-success__title">Thank you for your <em>order</em></h1>
        <p className="cart-success__sub">
          Your order has been recorded. Please complete it on WhatsApp — our team will confirm shortly.
        </p>
        {orderId && (
          <p className="cart-success__ref">Reference: <code>#{orderId.slice(-8).toUpperCase()}</code></p>
        )}
        <div className="cart-success__actions">
          <button className="cart-success__cta" onClick={() => navigate("/account")}>
            View Orders
          </button>
          <Link className="cart-success__sec" to="/product">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <main className="cart-empty">
        <p className="cart-empty__eyebrow">Your Bag</p>
        <h1 className="cart-empty__title">Your cart is <em>empty</em></h1>
        <p className="cart-empty__sub">Looks like you haven't added anything yet.</p>
        <Link className="cart-empty__cta" to="/product">
          Explore the collection &nbsp;→
        </Link>
      </main>
    );
  }

  // ── Main cart ────────────────────────────────────────────────────────────
  return (
    <main className="cart">

      {/* Header */}
      <div className="cart__head">
        <p className="cart__eyebrow">Your Bag</p>
        <h1 className="cart__title">Your <em>Selection</em></h1>
        <p className="cart__count">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
      </div>

      <div className="cart__layout">

        {/* Items */}
        <div className="cart__items">
          {cart.map((item) => (
            <article key={item._id + item.size} className="cart__item">

              <div className="cart__img-wrap">
                <img src={item.img} alt={item.name} className="cart__img" />
              </div>

              <div className="cart__info">
                <div className="cart__info-top">
                  <div>
                    <h2 className="cart__name">{item.name}</h2>
                    <p className="cart__meta">Size: <span>{item.size}</span></p>
                  </div>
                  <p className="cart__price">{item.price}</p>
                </div>

                <div className="cart__info-bottom">
                  <div className="cart__qty">
                    <button
                      className="cart__qty-btn"
                      onClick={() => updateQty(item._id, item.size, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="cart__qty-val">{item.quantity}</span>
                    <button
                      className="cart__qty-btn"
                      onClick={() => updateQty(item._id, item.size, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>

                  <p className="cart__line-total">
                    ₹{(parsePrice(item.price) * item.quantity).toLocaleString("en-IN")}
                  </p>

                  <button
                    className="cart__remove"
                    onClick={() => removeFromCart(item._id, item.size)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}

          <Link className="cart__continue" to="/product">
            ← Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <aside className="cart__summary">
          <p className="cart__summary-label">Order Summary</p>

          <div className="cart__summary-lines">
            {cart.map((item) => (
              <div className="cart__summary-row" key={item._id + item.size}>
                <span className="cart__summary-item-name">
                  {item.name}{" "}
                  <span className="cart__summary-size">({item.size})</span>
                  <span className="cart__summary-qty"> × {item.quantity}</span>
                </span>
                <span>₹{(parsePrice(item.price) * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>

          <div className="cart__summary-divider" />

          <div className="cart__summary-total">
            <span>Total</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          <p className="cart__summary-note">
            Inclusive of all taxes · Free shipping above ₹999
          </p>

          {/* Address selector — only shown when logged in and addresses exist */}
          {token && addresses.length > 0 && (
            <div className="cart__addr-select-wrap">
              <label className="cart__addr-label" htmlFor="cart-addr">
                Deliver to
              </label>
              <select
                id="cart-addr"
                className="cart__addr-select"
                value={selectedAddr}
                onChange={(e) => setSelectedAddr(e.target.value)}
              >
                <option value="">— Select address —</option>
                {addresses.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.label}: {a.line1}, {a.city}
                  </option>
                ))}
              </select>
              <p className="cart__addr-hint">
                <Link to="/account" className="cart__addr-link">
                  Manage addresses →
                </Link>
              </p>
            </div>
          )}

          {/* Guest prompt */}
          {!token && (
            <div className="cart__login-nudge">
              <p className="cart__login-nudge-text">
                <Link to="/login" className="cart__login-link">Sign in</Link> to save your cart and track orders
              </p>
            </div>
          )}

          <button
            className="cart__checkout"
            onClick={checkout}
            disabled={checkingOut}
          >
            {checkingOut ? "Processing…" : "Checkout on WhatsApp"}
          </button>

          <p className="cart__whatsapp-note">
            You'll be redirected to WhatsApp to confirm your order
          </p>
        </aside>
      </div>
    </main>
  );
}

export default Cart;
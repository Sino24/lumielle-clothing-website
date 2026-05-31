import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/PageStyle/Cart.css";

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

const parsePrice = (str: string) =>
  parseInt(str.replace(/[₹,\s]/g, ""), 10) || 0;

function Cart() {
  const { cart, removeFromCart, updateQty, clearCart, cartLoading } = useCart();
  const { token } = useAuth();
  const navigate   = useNavigate();
  const API_BASE   = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [addresses,    setAddresses]    = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string>("");
  const [addrLoading,  setAddrLoading]  = useState(false);
  const [addrError,    setAddrError]    = useState(false);
  const [checkingOut,  setCheckingOut]  = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId,      setOrderId]      = useState<string>("");
  const [orderError,   setOrderError]   = useState<string>("");

  // Snapshot cart before any async clears
  const cartSnapshot = useRef(cart);
  useEffect(() => { cartSnapshot.current = cart; }, [cart]);

  // Fetch saved addresses when logged in
  useEffect(() => {
    if (!token) return;
    setAddrLoading(true);
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: ProfileData) => {
        const addrs = data.addresses ?? [];
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault);
        if (def) setSelectedAddr(def._id);
        else if (addrs.length === 1) setSelectedAddr(addrs[0]._id);
      })
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  }, [token, API_BASE]);

  const total     = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const buildWhatsAppMsg = (
    items    = cartSnapshot.current,
    addrId   = selectedAddr,
    addrList = addresses,
  ) => {
    let msg = "Hello Lumielle,%0A%0AI would like to order:%0A%0A";
    items.forEach((item, i) => {
      msg += `${i + 1}. ${item.name}%0A`;
      msg += `Size: ${item.size}%0A`;
      msg += `Qty: ${item.quantity}%0A`;
      msg += `Price: ${item.price}%0A%0A`;
    });
    const orderTotal = items.reduce((s, it) => s + parsePrice(it.price) * it.quantity, 0);
    msg += `Total: ₹${orderTotal.toLocaleString("en-IN")}%0A%0A`;
    if (addrId) {
      const addr = addrList.find((a) => a._id === addrId);
      if (addr) {
        msg += `Delivery to:%0A`;
        msg += `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}%0A`;
        msg += `${addr.city}, ${addr.state} — ${addr.pincode}%0A%0A`;
      }
    }
    return msg;
  };

  const selectedAddrObj = addresses.find((a) => a._id === selectedAddr) ?? null;

  // ── Checkout ─────────────────────────────────────────────────────────────
  const checkout = async () => {
    if (checkingOut || !token) return;

    if (!selectedAddr || !selectedAddrObj) {
      setAddrError(true);
      document.getElementById("cart-addr-wrap")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setAddrError(false);
    setOrderError("");
    setCheckingOut(true);

    // Freeze everything before async work
    const itemsToOrder = cartSnapshot.current.map((item) => ({
      productId: item._id,
      name:      item.name,
      price:     item.price,
      img:       item.img,
      size:      item.size,
      quantity:  item.quantity,
    }));
    const orderTotal = cartSnapshot.current.reduce(
      (s, it) => s + parsePrice(it.price) * it.quantity, 0,
    );
    const addrId  = selectedAddr;
    const addrObj = {
      label:   selectedAddrObj.label,
      line1:   selectedAddrObj.line1,
      line2:   selectedAddrObj.line2 || "",
      city:    selectedAddrObj.city,
      state:   selectedAddrObj.state,
      pincode: selectedAddrObj.pincode,
    };
    const addrListSnapshot = [...addresses];
    const cartAtCheckout   = [...cartSnapshot.current];

    try {
      const res = await fetch(`${API_BASE}/api/cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: addrId,
          address:   addrObj,
          items:     itemsToOrder,
          total:     orderTotal,
        }),
      });

      const raw = await res.text();
      let data: { order?: { _id: string }; _id?: string; message?: string } = {};
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          `Server error (${res.status}): ${raw.slice(0, 120)}`,
        );
      }

      if (!res.ok) {
        throw new Error(data.message ?? `Order failed (${res.status}). Please try again.`);
      }

      const newOrderId = data.order?._id ?? data._id ?? "";

      // Open WhatsApp using frozen snapshots — BEFORE clearing cart
      window.open(
        `https://wa.me/+918590109684?text=${buildWhatsAppMsg(
          cartAtCheckout,
          addrId,
          addrListSnapshot,
        )}`,
        "_blank",
      );

      // Clear cart on server + in memory
      await clearCart();

      setOrderId(newOrderId);
      setOrderSuccess(true);

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setOrderError(errMsg);
      console.error("Checkout error:", err);
    } finally {
      setCheckingOut(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (cartLoading) {
    return (
      <main className="cart-loading">
        <div className="cart-loading__spinner" />
        <p className="cart-loading__text">Loading your bag…</p>
      </main>
    );
  }

  // ── Login gate ───────────────────────────────────────────────────────────
  if (!token) {
    return (
      <main className="cart-gate">
        <div className="cart-gate__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
               strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9"  cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <p className="cart-gate__eyebrow">Your Bag</p>
        <h1 className="cart-gate__title">Sign in to view your <em>bag</em></h1>
        <p className="cart-gate__sub">
          Create an account or sign in to add items, save your bag, and place orders.
        </p>
        <div className="cart-gate__actions">
          <Link className="cart-gate__cta" to="/login">Sign In</Link>
          <Link className="cart-gate__sec" to="/register">Create Account</Link>
        </div>
        <Link className="cart-gate__browse" to="/product">← Continue browsing</Link>
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
          <p className="cart-success__ref">
            Reference: <code>#{orderId.slice(-8).toUpperCase()}</code>
          </p>
        )}
        <div className="cart-success__actions">
          <button
            className="cart-success__cta"
            onClick={() =>
              navigate("/account", {
                state: { tab: "orders", refreshOrders: true },
              })
            }
          >
            View My Orders
          </button>
          <Link className="cart-success__sec" to="/product">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <main className="cart-empty">
        <p className="cart-empty__eyebrow">Your Bag</p>
        <h1 className="cart-empty__title">Your cart is <em>empty</em></h1>
        <p className="cart-empty__sub">Looks like you haven't added anything yet.</p>
        <Link className="cart-empty__cta" to="/product">Explore the collection &nbsp;→</Link>
      </main>
    );
  }

  // ── Main cart ────────────────────────────────────────────────────────────
  return (
    <main className="cart">

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
          <Link className="cart__continue" to="/product">← Continue Shopping</Link>
        </div>

        {/* Summary sidebar */}
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

          {/* Address selector */}
          <div
            id="cart-addr-wrap"
            className={`cart__addr-wrap${addrError ? " cart__addr-wrap--error" : ""}`}
          >
            <label className="cart__addr-label" htmlFor="cart-addr">
              Delivery Address <span className="cart__addr-required">*</span>
            </label>

            {addrLoading ? (
              <p className="cart__addr-loading-text">Loading addresses…</p>
            ) : addresses.length > 0 ? (
              <>
                <select
                  id="cart-addr"
                  className={`cart__addr-select${addrError ? " cart__addr-select--error" : ""}`}
                  value={selectedAddr}
                  onChange={(e) => {
                    setSelectedAddr(e.target.value);
                    if (e.target.value) setAddrError(false);
                  }}
                >
                  <option value="">— Select a delivery address —</option>
                  {addresses.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.label}: {a.line1}, {a.city}
                    </option>
                  ))}
                </select>
                {addrError && (
                  <p className="cart__addr-error-msg">
                    Please select a delivery address to continue.
                  </p>
                )}
                <p className="cart__addr-hint">
                  <Link to="/account" className="cart__addr-link">Manage addresses →</Link>
                </p>
              </>
            ) : (
              <div className="cart__addr-nudge">
                <div className="cart__addr-nudge-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <p className="cart__addr-nudge-text">
                  You need a saved address to place an order.
                </p>
                <Link to="/account" className="cart__addr-nudge-cta">Add Address →</Link>
              </div>
            )}
          </div>

          {/* Error banner */}
          {orderError && (
            <div className="cart__error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{orderError}</span>
            </div>
          )}

          {/* Place Order */}
          <button
            className={`cart__checkout${addresses.length === 0 || !selectedAddr ? " cart__checkout--blocked" : ""}`}
            onClick={checkout}
            disabled={checkingOut || addresses.length === 0 || addrLoading}
            title={addresses.length === 0 ? "Add a delivery address first" : undefined}
          >
            {checkingOut ? (
              <>
                <span className="cart__checkout-spinner" />
                Processing…
              </>
            ) : (
              "Place Order"
            )}
          </button>

          {addresses.length === 0 && !addrLoading && (
            <p className="cart__checkout-note">
              Add a delivery address in your{" "}
              <Link to="/account" className="cart__addr-link">account</Link>{" "}
              to place an order.
            </p>
          )}

          {addresses.length > 0 && (
            <p className="cart__whatsapp-note">
              Order saved to your account &amp; opened on WhatsApp for confirmation
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

export default Cart;
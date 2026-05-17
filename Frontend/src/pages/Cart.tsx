// src/pages/Cart.tsx

import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/PageStyle/Cart.css";

function Cart() {
  const { cart, removeFromCart, updateQty } = useCart();

  const total = cart.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[₹,]/g, "")) || 0;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const checkout = () => {
    let message = "Hello Lumielle,%0A%0AI would like to order:%0A%0A";
    cart.forEach((item, i) => {
      message += `${i + 1}. ${item.name}%0A`;
      message += `Size: ${item.size}%0A`;
      message += `Qty: ${item.quantity}%0A`;
      message += `Price: ${item.price}%0A%0A`;
    });
    message += `Total: ₹${total.toLocaleString("en-IN")}%0A%0A`;
    message += "Please share:%0AName:%0APhone:%0AAddress:";
    window.open(`https://wa.me/+918590109684?text=${message}`, "_blank");
  };

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

  return (
    <main className="cart">

      {/* ── Header ── */}
      <div className="cart__head">
        <p className="cart__eyebrow">Your Bag</p>
        <h1 className="cart__title">Your <em>Selection</em></h1>
        <p className="cart__count">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
      </div>

      <div className="cart__layout">

        {/* ── Items ── */}
        <div className="cart__items">
          {cart.map((item) => (
            <article key={item._id + item.size} className="cart__item">

              {/* Image */}
              <div className="cart__img-wrap">
                <img src={item.img} alt={item.name} className="cart__img" />
              </div>

              {/* Info */}
              <div className="cart__info">
                <div className="cart__info-top">
                  <div>
                    <h2 className="cart__name">{item.name}</h2>
                    <p className="cart__meta">Size: <span>{item.size}</span></p>
                  </div>
                  <p className="cart__price">{item.price}</p>
                </div>

                <div className="cart__info-bottom">
                  {/* Qty */}
                  <div className="cart__qty">
                    <button
                      className="cart__qty-btn"
                      onClick={() => updateQty(item._id, item.size, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="cart__qty-val">{item.quantity}</span>
                    <button
                      className="cart__qty-btn"
                      onClick={() => updateQty(item._id, item.size, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Line total */}
                  <p className="cart__line-total">
                    ₹{(
                      (parseInt(item.price.replace(/[₹,]/g, "")) || 0) * item.quantity
                    ).toLocaleString("en-IN")}
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

          {/* Continue shopping */}
          <Link className="cart__continue" to="/product">
            ← Continue Shopping
          </Link>
        </div>

        {/* ── Summary ── */}
        <aside className="cart__summary">
          <p className="cart__summary-label">Order Summary</p>

          <div className="cart__summary-lines">
            {cart.map((item) => (
              <div className="cart__summary-row" key={item._id + item.size}>
                <span className="cart__summary-item-name">
                  {item.name} <span className="cart__summary-size">({item.size})</span>
                  <span className="cart__summary-qty"> × {item.quantity}</span>
                </span>
                <span>
                  ₹{(
                    (parseInt(item.price.replace(/[₹,]/g, "")) || 0) * item.quantity
                  ).toLocaleString("en-IN")}
                </span>
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

          <button className="cart__checkout" onClick={checkout}>
            Checkout on WhatsApp
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
// controllers/cartController.js

const Cart  = require("../models/Cart");
const Order = require("../models/Order");

// ── Helpers ───────────────────────────────────────────────────────────────────
const parsePrice = (priceStr) =>
  parseInt(String(priceStr).replace(/[₹,\s]/g, ""), 10) || 0;

// ── GET /api/cart ─────────────────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    res.json({ items: cart?.items ?? [] });
  } catch (err) {
    console.error("getCart error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/cart  (full sync — replace entire cart) ─────────────────────────
const syncCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "items must be an array" });
    }

    const clean = items
      .filter((i) => i.productId && i.name && i.price && i.size && i.quantity > 0)
      .map(({ productId, name, price, img, size, quantity }) => ({
        productId,
        name,
        price,
        img:      img || "",
        size,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
      }));

    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { user: req.user.id, items: clean },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ items: cart.items });
  } catch (err) {
    console.error("syncCart error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/cart  (clear) ─────────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] },
      { upsert: true }
    );
    res.json({ items: [] });
  } catch (err) {
    console.error("clearCart error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/cart/checkout ───────────────────────────────────────────────────
// Called after the user taps "Checkout on WhatsApp".
// Creates an Order record and clears the cart.
const checkout = async (req, res) => {
  try {
    const { items, addressId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const total = items.reduce(
      (sum, item) => sum + parsePrice(item.price) * (item.quantity || 1),
      0
    );

    // Optionally attach address snapshot
    let address;
    if (addressId && req.user.addresses) {
      const found = req.user.addresses.find(
        (a) => a._id.toString() === addressId
      );
      if (found) {
        address = {
          label:   found.label,
          line1:   found.line1,
          line2:   found.line2 || "",
          city:    found.city,
          state:   found.state,
          pincode: found.pincode,
        };
      }
    }

    const order = await Order.create({
      user:    req.user.id,
      items:   items.map(({ productId, name, price, img, size, quantity }) => ({
        productId, name, price, img: img || "", size,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
      })),
      total,
      status:  "pending",
      address: address || undefined,
    });

    // Clear the saved cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] },
      { upsert: true }
    );

    res.status(201).json({ order });
  } catch (err) {
    console.error("checkout error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/cart/orders ──────────────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("getOrders error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/cart/orders/:id ──────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("getOrderById error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Admin: GET /api/cart/admin/orders ─────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("getAllOrders error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Admin: PATCH /api/cart/admin/orders/:id ───────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("updateOrderStatus error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCart,
  syncCart,
  clearCart,
  checkout,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
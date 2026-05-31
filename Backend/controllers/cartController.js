// controllers/cartController.js

const Cart  = require("../models/Cart");
const Order = require("../models/Order");
const User  = require("../models/User");

// ── Helpers ───────────────────────────────────────────────────────────────────
const parsePrice = (priceStr) =>
  parseInt(String(priceStr).replace(/[₹,\s]/g, ""), 10) || 0;

// ── GET /api/cart ─────────────────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    // Map stored productId back to _id so CartContext keeps its shape
    const items = (cart?.items ?? []).map((item) => ({
      _id:      item.productId,
      name:     item.name,
      price:    item.price,
      img:      item.img,
      size:     item.size,
      quantity: item.quantity,
    }));

    res.json({ items });
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
      .filter((i) => (i.productId || i._id) && i.name && i.price && i.size && i.quantity > 0)
      .map(({ productId, _id, name, price, img, size, quantity }) => ({
        productId: productId || _id,
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

    // Return items with _id shape for CartContext
    const outItems = cart.items.map((item) => ({
      _id:      item.productId,
      name:     item.name,
      price:    item.price,
      img:      item.img,
      size:     item.size,
      quantity: item.quantity,
    }));

    res.json({ items: outItems });
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
const checkout = async (req, res) => {
  try {
    const { items, address, addressId, total: clientTotal } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate and normalise items — accept both productId and _id field names
    const cleanItems = items.map((item) => {
      const productId = item.productId || item._id;
      if (!productId || !item.name || !item.price || !item.size || !item.quantity) {
        throw new Error(`Invalid item in cart: ${JSON.stringify(item)}`);
      }
      return {
        productId,
        name:     item.name,
        price:    item.price,
        img:      item.img || "",
        size:     item.size,
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      };
    });

    // Compute total server-side; fall back to client value only if calculation gives 0
    const computedTotal = cleanItems.reduce(
      (sum, item) => sum + parsePrice(item.price) * item.quantity,
      0
    );
    const total = computedTotal || clientTotal || 0;

    // ── Resolve delivery address ─────────────────────────────────────────
    // Preferred: frontend sends the full address object inline
    // Fallback:  look up from User document by addressId
    let addressSnapshot = null;

    if (address && address.line1 && address.city) {
      addressSnapshot = {
        label:   address.label   || "Home",
        line1:   address.line1,
        line2:   address.line2   || "",
        city:    address.city,
        state:   address.state   || "",
        pincode: address.pincode || "",
      };
    } else if (addressId) {
      const user = await User.findById(req.user.id).select("addresses");
      if (user) {
        const found = user.addresses?.find(
          (a) => a._id.toString() === addressId
        );
        if (found) {
          addressSnapshot = {
            label:   found.label,
            line1:   found.line1,
            line2:   found.line2 || "",
            city:    found.city,
            state:   found.state,
            pincode: found.pincode,
          };
        }
      }
    }

    if (!addressSnapshot) {
      return res.status(400).json({ message: "A valid delivery address is required." });
    }

    // ── Create the order ─────────────────────────────────────────────────
    const order = await Order.create({
      user:    req.user.id,
      items:   cleanItems,
      total,
      status:  "pending",
      address: addressSnapshot,
    });

    // ── Clear the user's server-side cart ────────────────────────────────
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] },
      { upsert: true }
    );

    res.status(201).json({ order });
  } catch (err) {
    console.error("checkout error:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
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

// ── Admin: GET /api/cart/admin/orders ────────────────────────────────────────
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
      return res.status(400).json({ message: "Invalid status value" });
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
const deleteOrder = async (req, res) => {
  console.log("DELETE ORDER ID:", req.params.id);

  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    console.log("FOUND ORDER:", order);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order deleted successfully",
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
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
 deleteOrder,
};
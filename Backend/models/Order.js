// models/Order.js

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name:      { type: String, required: true },
    price:     { type: String, required: true },
    img:       { type: String, default: "" },
    size:      { type: String, required: true },
    quantity:  { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    items:       [orderItemSchema],
    total:       { type: Number, required: true },
    status: {
      type:    String,
      enum:    ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    // WhatsApp-based checkout — we store a reference message ID (optional)
    whatsappRef: { type: String, default: "" },
    address: {
      label:   String,
      line1:   String,
      line2:   String,
      city:    String,
      state:   String,
      pincode: String,
    },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
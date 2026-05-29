// models/Cart.js

const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name:      { type: String, required: true },
    price:     { type: String, required: true }, // keeps "₹1,200" format
    img:       { type: String, default: "" },
    size:      { type: String, required: true },
    quantity:  { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true, // one cart doc per user
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
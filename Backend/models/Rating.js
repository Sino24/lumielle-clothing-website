// models/Rating.js

const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // We use a fingerprint (IP + user-agent hash) so anyone can rate
    // without needing an account, but can't spam
    fingerprint: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// One rating per fingerprint per product
ratingSchema.index({ productId: 1, fingerprint: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: String,
      required: true,
    },

    originalPrice: {
      type: String,
    },

    badge: {
      type: String,
    },

    img: {
      type: String,
      required: true,
    },

    images: [String],

    category: {
      type: String,
      required: true,
    },

    colors: [
      {
        label: String,
        hex: String,
      },
    ],

    sizes: [String],

    description: {
      type: String,
      required: true,
    },

    details: [String],

    careInstructions: [String],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
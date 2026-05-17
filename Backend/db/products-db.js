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

    images: [
      {
        type: String,
      },
    ],

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

    sizes: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
      required: true,
    },

    details: [
      {
        type: String,
      },
    ],

    careInstructions: [
      {
        type: String,
      },
    ],
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
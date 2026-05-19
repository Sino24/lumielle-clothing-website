const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      default: "Summer Collection 2026",
    },

    titleLine1: {
      type: String,
      default: "Dressed in",
    },

    titleItalic: {
      type: String,
      default: "quiet",
    },

    titleLine2: {
      type: String,
      default: "confidence.",
    },

    ctaText: {
      type: String,
      default: "Explore the collection",
    },

    ctaLink: {
      type: String,
      default: "/product",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    overlayOpacity: {
      type: Number,
      default: 58,
    },
  },
  {
    timestamps: true,
  }
);

const Hero = mongoose.model(
  "Hero",
  heroSchema
);

module.exports = Hero;
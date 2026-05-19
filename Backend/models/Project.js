

const mongoose = require("mongoose");

const clientProjectSchema = new mongoose.Schema(
  {
    clientName:  { type: String, required: true, trim: true },
    category:    { type: String, trim: true, default: "" },
    // e.g. "Football Jersey", "Brand Uniform", "Corporate Apparel"
    description: { type: String, trim: true, default: "" },
    // Main cover image
    coverImage:  { type: String, default: "" },
    // Additional gallery images
    images:      [{ type: String }],
    // Tags like "Sports", "Corporate", "Schools", "Hospitality"
    tags:        [{ type: String, trim: true }],
    order:       { type: Number, default: 0 },
    isVisible:   { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClientProject", clientProjectSchema);
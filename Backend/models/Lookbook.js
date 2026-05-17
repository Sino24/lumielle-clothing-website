
const mongoose = require("mongoose");

const lookbookSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    subtitle: { type: String, trim: true, default: "" },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Lookbook = mongoose.model("Lookbook", lookbookSchema);

module.exports = Lookbook;

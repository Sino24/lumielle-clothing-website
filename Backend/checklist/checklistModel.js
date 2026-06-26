const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, default: "" },
    note: { type: String, default: "" },
    priority: { type: String, enum: ["must", "nice"], default: "must" },
    qty: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const SectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: "" },
    items: { type: [ItemSchema], default: [] },
  },
  { _id: false }
);

const TimelinePhaseSchema = new mongoose.Schema(
  {
    phase: { type: String, default: "" },
    tag: { type: String, default: "" },
    text: { type: String, default: "" },
  },
  { _id: false }
);

const ChecklistSchema = new mongoose.Schema(
  {
    // slug lets you support more than one checklist later (e.g. per-campus),
    // but the frontend just uses "default" for now.
    slug: { type: String, required: true, unique: true, default: "default" },

    instituteName: { type: String, default: "ULearns" },
    instituteTag: { type: String, default: "Institute of AI & Technology" },
    docTitle: { type: String, default: "Procurement & Essentials Checklist" },
    targetNote: { type: String, default: "" },
    budgetMin: { type: Number, default: 0 },
    budgetMax: { type: Number, default: 0 },

    sections: { type: [SectionSchema], default: [] },
    timeline: { type: [TimelinePhaseSchema], default: [] },
    aiSpecs: { type: [String], default: [] },

    // map of itemId -> boolean, mirrors the frontend's `checked` state
    checked: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checklist", ChecklistSchema);

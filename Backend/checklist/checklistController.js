const Checklist = require("./checklistModel");

// Default seed data — same shape as the frontend's `initialData`.
// Kept minimal here; you can paste your full initialData in if you want
// the DB to seed with all the real items instead of an empty shell.
const DEFAULT_DATA = {
  slug: "default",
  instituteName: "ULearns",
  instituteTag: "Institute of AI & Technology",
  docTitle: "Procurement & Essentials Checklist",
  targetNote: "Target: 20–30 Students",
  budgetMin: 2000000,
  budgetMax: 5000000,
  sections: [],
  timeline: [],
  aiSpecs: [],
  checked: {},
};

async function getOrCreate(slug) {
  let doc = await Checklist.findOne({ slug });
  if (!doc) {
    doc = await Checklist.create({ ...DEFAULT_DATA, slug });
  }
  return doc;
}

// GET /api/checklists/:slug
exports.getChecklist = async (req, res) => {
  try {
    const slug = req.params.slug || "default";
    const doc = await getOrCreate(slug);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Failed to load checklist", details: err.message });
  }
};

// PUT /api/checklists/:slug
// Replaces the whole checklist (sections, timeline, budgets, etc).
// This is what "Save" / autosave on the frontend should call instead of localStorage.
exports.replaceChecklist = async (req, res) => {
  try {
    const slug = req.params.slug || "default";
    const {
      instituteName,
      instituteTag,
      docTitle,
      targetNote,
      budgetMin,
      budgetMax,
      sections,
      timeline,
      aiSpecs,
    } = req.body;

    const doc = await Checklist.findOneAndUpdate(
      { slug },
      {
        $set: {
          instituteName,
          instituteTag,
          docTitle,
          targetNote,
          budgetMin,
          budgetMax,
          sections,
          timeline,
          aiSpecs,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: "Failed to save checklist", details: err.message });
  }
};

// PATCH /api/checklists/:slug/checked
// Updates just the checked-state map (so ticking a box doesn't resend the whole doc)
exports.updateChecked = async (req, res) => {
  try {
    const slug = req.params.slug || "default";
    const { checked } = req.body;
    if (typeof checked !== "object" || checked === null) {
      return res.status(400).json({ error: "`checked` must be an object" });
    }

    const doc = await Checklist.findOneAndUpdate(
      { slug },
      { $set: { checked } },
      { new: true, upsert: true }
    );

    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: "Failed to update checked state", details: err.message });
  }
};

// PATCH /api/checklists/:slug/items/:itemId
// Convenience endpoint for editing a single item (qty/unitPrice/link/label/note/priority)
// without resending the whole checklist.
exports.patchItem = async (req, res) => {
  try {
    const slug = req.params.slug || "default";
    const { itemId } = req.params;
    const allowedFields = ["label", "note", "priority", "qty", "unitPrice", "link"];

    const doc = await Checklist.findOne({ slug });
    if (!doc) return res.status(404).json({ error: "Checklist not found" });

    let found = false;
    for (const section of doc.sections) {
      const item = section.items.find((i) => i.id === itemId);
      if (item) {
        for (const field of allowedFields) {
          if (field in req.body) item[field] = req.body[field];
        }
        found = true;
        break;
      }
    }

    if (!found) return res.status(404).json({ error: "Item not found" });

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: "Failed to update item", details: err.message });
  }
};

// POST /api/checklists/:slug/sections/:sectionId/items
exports.addItem = async (req, res) => {
  try {
    const slug = req.params.slug || "default";
    const { sectionId } = req.params;
    const { id, label, note, priority, qty, unitPrice, link } = req.body;

    const doc = await Checklist.findOne({ slug });
    if (!doc) return res.status(404).json({ error: "Checklist not found" });

    const section = doc.sections.find((s) => s.id === sectionId);
    if (!section) return res.status(404).json({ error: "Section not found" });

    section.items.push({
      id: id || `i${Date.now()}`,
      label: label || "New item",
      note: note || "",
      priority: priority === "nice" ? "nice" : "must",
      qty: Number(qty) || 0,
      unitPrice: Number(unitPrice) || 0,
      link: link || "",
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: "Failed to add item", details: err.message });
  }
};

// DELETE /api/checklists/:slug/sections/:sectionId/items/:itemId
exports.deleteItem = async (req, res) => {
  try {
    const slug = req.params.slug || "default";
    const { sectionId, itemId } = req.params;

    const doc = await Checklist.findOne({ slug });
    if (!doc) return res.status(404).json({ error: "Checklist not found" });

    const section = doc.sections.find((s) => s.id === sectionId);
    if (!section) return res.status(404).json({ error: "Section not found" });

    section.items = section.items.filter((i) => i.id !== itemId);
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: "Failed to delete item", details: err.message });
  }
};

// POST /api/checklists/:slug/reset
exports.resetChecklist = async (req, res) => {
  try {
    const slug = req.params.slug || "default";
    await Checklist.deleteOne({ slug });
    const doc = await getOrCreate(slug);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Failed to reset checklist", details: err.message });
  }
};

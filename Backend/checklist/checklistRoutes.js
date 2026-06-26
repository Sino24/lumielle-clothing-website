const express = require("express");
const router = express.Router();
const ctrl = require("./checklistController");

// Whole-document operations
router.get("/:slug", ctrl.getChecklist);
router.put("/:slug", ctrl.replaceChecklist);
router.post("/:slug/reset", ctrl.resetChecklist);

// Checked-state (tick boxes)
router.patch("/:slug/checked", ctrl.updateChecked);

// Item-level operations
router.post("/:slug/sections/:sectionId/items", ctrl.addItem);
router.patch("/:slug/items/:itemId", ctrl.patchItem);
router.delete("/:slug/sections/:sectionId/items/:itemId", ctrl.deleteItem);

module.exports = router;

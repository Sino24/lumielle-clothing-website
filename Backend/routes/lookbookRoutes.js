const express = require("express");

const {
  getLookbook,
  getAllLookbook,
  createLookbookEntry,
  updateLookbookEntry,
  deleteLookbookEntry,
} = require("../controllers/lookbookController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getLookbook);

router.get("/all", protect, getAllLookbook);

router.post("/", protect, createLookbookEntry);

router.put(
  "/:id",
  protect,
  updateLookbookEntry
);

router.delete(
  "/:id",
  protect,
  deleteLookbookEntry
);

module.exports = router;
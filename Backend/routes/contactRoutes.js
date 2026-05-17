const express = require("express");

const {
  submitContact,
  getContacts,
  updateContactStatus,
  deleteContact,
} = require("../controllers/contactController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", submitContact);

router.get("/", protect, getContacts);

router.patch(
  "/:id/status",
  protect,
  updateContactStatus
);

router.delete(
  "/:id",
  protect,
  deleteContact
);

module.exports = router;
const express = require("express");
const router  = express.Router();

const {
  submitContact,
  getContacts,
  updateContactStatus,
  replyToContact,
  deleteContact,
} = require("../controllers/contactController");

const { protect } = require("../middleware/authMiddleware");

router.post  ("/",               submitContact);         // public — token optional
router.get   ("/",         protect, getContacts);
router.patch ("/:id/status", protect, updateContactStatus);
router.patch ("/:id/reply",  protect, replyToContact);
router.delete("/:id",        protect, deleteContact);

module.exports = router;
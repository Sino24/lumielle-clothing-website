// routes/adminRoutes.js

const express = require("express");
const router  = express.Router();

const {
  signupAdmin,
  loginAdmin,
  getAdminProfile,
  getAllAdmins,
  deactivateAdmin,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware"); // sets req.admin

// ── Public (invite code validated inside controller) ──────
router.post("/signup", signupAdmin);
router.post("/login",  loginAdmin);

// ── Admin-protected ───────────────────────────────────────
router.get   ("/me",                protect, getAdminProfile);
router.get   ("/all",               protect, getAllAdmins);
router.patch ("/:id/deactivate",    protect, deactivateAdmin);

module.exports = router;
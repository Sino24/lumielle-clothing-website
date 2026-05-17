// routes/adminRoutes.js

const express = require("express");
const {
  signupAdmin,
  loginAdmin,
  getAdminProfile,
  getAllAdmins,
  deactivateAdmin,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public — invite code required for signup
router.post("/signup", signupAdmin);
router.post("/login", loginAdmin);

// Protected
router.get("/me", protect, getAdminProfile);
router.get("/all", protect, getAllAdmins);
router.patch("/:id/deactivate", protect, deactivateAdmin);

module.exports = router;
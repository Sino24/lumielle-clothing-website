// routes/authRoutes.js

const express = require("express");
const router  = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
} = require("../controllers/authController");

const { protectUser } = require("../middleware/userAuthMiddleware");

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/register", registerUser);
router.post("/login",    loginUser);

// ── Protected routes (JWT required) ──────────────────────────────────────────
router.get   ("/me",                      protectUser, getMe);
router.patch ("/profile",                 protectUser, updateProfile);
router.post  ("/address",                 protectUser, addAddress);
router.delete("/address/:addressId",      protectUser, deleteAddress);

module.exports = router;
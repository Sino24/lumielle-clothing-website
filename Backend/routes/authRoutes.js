// routes/authRoutes.js

const express = require("express");
const router  = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
  getAllUsers,
  deleteUser,
} = require("../controllers/authController");

const { protectUser } = require("../middleware/userAuthMiddleware"); // user JWT
const { protect }     = require("../middleware/authMiddleware");     // admin JWT

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/register", registerUser);
router.post("/login",    loginUser);

// ── User-protected (user JWT required) ───────────────────────────────────────
router.get   ("/me",                 protectUser, getMe);
router.patch ("/profile",            protectUser, updateProfile);
router.patch ("/password",           protectUser, changePassword);
router.post  ("/address",            protectUser, addAddress);
router.delete("/address/:addressId", protectUser, deleteAddress);

// ── Admin-only (admin JWT required) ──────────────────────────────────────────
router.get   ("/users",     protect, getAllUsers);
router.delete("/users/:id", protect, deleteUser);

module.exports = router;
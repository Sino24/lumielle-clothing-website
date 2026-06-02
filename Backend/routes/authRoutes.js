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

const { protectUser } = require("../middleware/userAuthMiddleware");
const { protect }     = require("../middleware/authMiddleware");

// ── Public ────────────────────────────────────────────────
router.post("/register", registerUser);
router.post("/login",    loginUser);

// ── User-protected ────────────────────────────────────────
router.get   ("/me",                 protectUser, getMe);
router.patch ("/profile",            protectUser, updateProfile);
router.patch ("/password",           protectUser, changePassword);
router.post  ("/address",            protectUser, addAddress);
router.delete("/address/:addressId", protectUser, deleteAddress);

// ── Admin-only ────────────────────────────────────────────
router.get   ("/users",     protect, getAllUsers);
router.delete("/users/:id", protect, deleteUser);

module.exports = router;
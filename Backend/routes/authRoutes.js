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
const Contact         = require("../models/Contact");

// ── Public ────────────────────────────────────────────────
router.post("/register", registerUser);
router.post("/login",    loginUser);

// ── User-protected ────────────────────────────────────────
router.get   ("/me",                 protectUser, getMe);
router.patch ("/profile",            protectUser, updateProfile);
router.patch ("/password",           protectUser, changePassword);
router.post  ("/address",            protectUser, addAddress);
router.delete("/address/:addressId", protectUser, deleteAddress);

// ── GET /api/auth/messages — user's own contact submissions ──
router.get("/messages", protectUser, async (req, res) => {
  try {
    const msgs = await Contact.find({ userId: req.user.id }).sort("-createdAt");
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin-only ────────────────────────────────────────────
router.get   ("/users",     protect, getAllUsers);
router.delete("/users/:id", protect, deleteUser);

module.exports = router;
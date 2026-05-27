// controllers/authController.js

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── POST /api/auth/register ───────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check for existing user
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // Create user (password hashing happens in the model pre-save hook)
    const user = await User.create({ name, email, password, phone });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Fetch with password (field is select:false by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id:        user._id,
      name:      user.name,
      email:     user.email,
      phone:     user.phone,
      addresses: user.addresses,
      createdAt: user.createdAt,
    });

  } catch (error) {
    console.error("GetMe error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PATCH /api/auth/profile ───────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id:    user._id,
      name:  user.name,
      email: user.email,
      phone: user.phone,
    });

  } catch (error) {
    console.error("UpdateProfile error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/address ────────────────────────────────────────────────────
const addAddress = async (req, res) => {
  try {
    const { label, line1, line2, city, state, pincode, isDefault } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If this is default, unset all others
    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({ label, line1, line2, city, state, pincode, isDefault });
    await user.save();

    res.status(201).json({ addresses: user.addresses });

  } catch (error) {
    console.error("AddAddress error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/auth/address/:addressId ──────────────────────────────────────
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );

    await user.save();

    res.json({ addresses: user.addresses });

  } catch (error) {
    console.error("DeleteAddress error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
};
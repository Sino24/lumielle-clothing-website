const jwt  = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── POST /api/auth/register ───────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, and password are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "An account with this email already exists" });

    // Do NOT pre-hash here — the pre("save") hook handles it
    const user = await User.create({
      name,
      email,
      password, // raw — hook will hash it
      phone,
      isVerified: true,
    });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });

  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/login ──────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Please provide email and password" });

    // CRITICAL: must include "+password" since it's select:false in schema
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      console.log(`[login] No user found for email: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      console.error(`[login] User ${email} has no password field — was it fetched with select("+password")?`);
      return res.status(500).json({ message: "Server error" });
    }

    // Direct bcrypt compare as a safety net (bypasses any matchPassword issues)
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[login] password match for ${email}: ${isMatch}`);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isActive)
      return res.status(403).json({ message: "Your account has been deactivated. Please contact support." });

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

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

// ── PATCH /api/auth/profile ───────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    // Use findByIdAndUpdate so the pre("save") password hook does NOT fire
    const user = await User.findByIdAndUpdate(
      req.user.id, { name, phone }, { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone });
  } catch (error) {
    console.error("UpdateProfile error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PATCH /api/auth/password ──────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both current and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user.id).select("+password");

    if (!user || !(await bcrypt.compare(currentPassword, user.password)))
      return res.status(401).json({ message: "Current password is incorrect" });

    // Assign raw — pre("save") hook will hash it
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("ChangePassword error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/address ────────────────────────────────
const addAddress = async (req, res) => {
  try {
    const { label, line1, line2, city, state, pincode, isDefault } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

    user.addresses.push({ label, line1, line2, city, state, pincode, isDefault });
    await user.save();

    res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    console.error("AddAddress error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/auth/address/:addressId ──────────────────
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

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

// ── GET /api/auth/users (admin only) ─────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("GetAllUsers error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/auth/users/:id (admin only) ──────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DeleteUser error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
  getAllUsers,
  deleteUser,
};
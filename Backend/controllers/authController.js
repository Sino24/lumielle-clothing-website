const jwt  = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("../config/email");

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
    if (existing) {
      // If account exists but was never verified, resend a fresh code instead of blocking
      if (!existing.isVerified) {
        const code    = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        existing.verifyCode        = code;
        existing.verifyCodeExpires = expires;
        await existing.save();
        await sendVerificationEmail(email, existing.name, code);
        return res.status(200).json({
          message: "A new verification code has been sent to your email.",
          userId:  existing._id,
        });
      }
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const code    = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name, email, password, phone,
      verifyCode:        code,
      verifyCodeExpires: expires,
      isVerified:        false,
    });

    await sendVerificationEmail(email, name, code);

    res.status(201).json({
      message: "Account created. Please check your email for a verification code.",
      userId:  user._id,
    });

  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/verify ─────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    if (user.verifyCode !== code)
      return res.status(400).json({ message: "Invalid verification code" });

    if (user.verifyCodeExpires < new Date())
      return res.status(400).json({ message: "Code has expired. Please request a new one." });

    user.isVerified        = true;
    user.verifyCode        = undefined;
    user.verifyCodeExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });

  } catch (error) {
    console.error("Verify error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/resend-code ────────────────────────────
const resendVerificationCode = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Email is already verified" });

    const code    = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.verifyCode        = code;
    user.verifyCodeExpires = expires;
    await user.save();

    await sendVerificationEmail(user.email, user.name, code);

    res.json({ message: "A new verification code has been sent to your email." });

  } catch (error) {
    console.error("ResendCode error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/login ──────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Please provide email and password" });

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isActive)
      return res.status(403).json({ message: "Your account has been deactivated. Please contact support." });

    // ── Block unverified users and guide them to verify ──
    if (!user.isVerified) {
      // Issue a fresh code so they can complete verification
      const code    = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000);
      user.verifyCode        = code;
      user.verifyCodeExpires = expires;
      await user.save();
      await sendVerificationEmail(user.email, user.name, code);

      return res.status(403).json({
        message:        "Please verify your email before logging in. We've sent a new code.",
        requiresVerify: true,
        userId:         user._id,
      });
    }

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

    if (!user || !(await user.matchPassword(currentPassword)))
      return res.status(401).json({ message: "Current password is incorrect" });

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
  verifyEmail,
  resendVerificationCode,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
  getAllUsers,
  deleteUser,
};
// controllers/adminController.js

const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── POST /api/admin/signup ────────────────────────────────────────────────────
const signupAdmin = async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;

    // DEBUG
    console.log("Frontend code:", inviteCode);
    console.log("ENV code:", process.env.ADMIN_INVITE_CODE);

    // Validate invite code
    if (!inviteCode || inviteCode !== process.env.ADMIN_INVITE_CODE) {
      return res.status(403).json({
        message: "Invalid invite code",
      });
    }

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

    // Check existing admin
    const existing = await Admin.findOne({ email });

    if (existing) {
      return res.status(409).json({
        message: "Admin already exists with this email",
      });
    }

    // First admin becomes superadmin
    const adminCount = await Admin.countDocuments();

    const admin = await Admin.create({
      name,
      email,
      password,
      role: adminCount === 0 ? "superadmin" : "admin",
    });

    const token = signToken(admin._id);

    res.status(201).json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error("Signup error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ── POST /api/admin/login ─────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated",
      });
    }

    const token = signToken(admin._id);

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ── GET /api/admin/me ─────────────────────────────────────────────────────────
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    });

  } catch (error) {
    console.error("Profile error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ── GET /api/admin/all ────────────────────────────────────────────────────────
const getAllAdmins = async (req, res) => {
  try {
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({
        message: "Superadmin access only",
      });
    }

    const admins = await Admin.find({})
      .select("-password")
      .sort("-createdAt");

    res.json(admins);

  } catch (error) {
    console.error("Get admins error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ── PATCH /api/admin/:id/deactivate ──────────────────────────────────────────
const deactivateAdmin = async (req, res) => {
  try {
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({
        message: "Superadmin access only",
      });
    }

    if (req.params.id === req.admin.id.toString()) {
      return res.status(400).json({
        message: "You cannot deactivate your own account",
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    res.json({
      message: "Admin deactivated",
      admin,
    });

  } catch (error) {
    console.error("Deactivate error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  signupAdmin,
  loginAdmin,
  getAdminProfile,
  getAllAdmins,
  deactivateAdmin,
};
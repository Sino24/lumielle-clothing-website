// models/User.js

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
    },

    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/\S+@\S+\.\S+/, "Please enter a valid email"],
    },

    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:    false,
    },

    phone: {
      type:    String,
      trim:    true,
      default: "",
    },

    // Saved delivery addresses
    addresses: [
      {
        label:     { type: String, default: "Home" },
        line1:     { type: String, required: true },
        line2:     { type: String, default: "" },
        city:      { type: String, required: true },
        state:     { type: String, required: true },
        pincode:   { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],

    isActive: {
      type:    Boolean,
      default: true,
    },

    // ── Email verification ────────────────────────────────
    isVerified: {
      type:    Boolean,
      default: false,
    },
    verifyCode: {
      type: String,
    },
    verifyCodeExpires: {
      type: Date,
    },

    // For future use (password reset)
    resetPasswordToken:   String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// ── Hash password before save ─────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
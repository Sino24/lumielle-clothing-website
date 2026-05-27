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
      type:     String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:   false, // never returned unless explicitly .select("+password")
    },

    phone: {
      type:    String,
      trim:    true,
      default: "",
    },

    // Saved delivery addresses
    addresses: [
      {
        label:    { type: String, default: "Home" }, // e.g. "Home", "Office"
        line1:    { type: String, required: true },
        line2:    { type: String, default: "" },
        city:     { type: String, required: true },
        state:    { type: String, required: true },
        pincode:  { type: String, required: true },
        isDefault:{ type: Boolean, default: false },
      },
    ],

    isActive: {
      type:    Boolean,
      default: true,
    },

    // For future use (password reset)
    resetPasswordToken:   String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Hash password before save ─────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
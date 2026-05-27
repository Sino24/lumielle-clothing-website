// middleware/userAuthMiddleware.js

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── Protect: verify JWT and attach req.user ───────────────────────────────────
const protectUser = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorised — no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User account not found" });
    }

    if (!req.user.isActive) {
      return res
        .status(403)
        .json({ message: "Your account has been deactivated" });
    }

    next();

  } catch (error) {
    return res
      .status(401)
      .json({ message: "Not authorised — invalid or expired token" });
  }
};

module.exports = { protectUser };
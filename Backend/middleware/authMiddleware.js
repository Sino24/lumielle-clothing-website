// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
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

    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) {
      return res.status(401).json({ message: "Admin account not found" });
    }

    if (!req.admin.isActive) {
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

module.exports = { protect };
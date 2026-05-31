// routes/cartRoutes.js

const express = require("express");
const router  = express.Router();

const {
  getCart,
  syncCart,
  clearCart,
  checkout,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} = require("../controllers/cartController");

const { protectUser } = require("../middleware/userAuthMiddleware");
const { protect }     = require("../middleware/authMiddleware");

// ── User routes (JWT required) ────────────────────────────────────────────────
router.get   ("/",              protectUser, getCart);
router.put   ("/",              protectUser, syncCart);
router.delete("/",              protectUser, clearCart);
router.post  ("/checkout",      protectUser, checkout);
router.get   ("/orders",        protectUser, getOrders);
router.get   ("/orders/:id",    protectUser, getOrderById);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get   ("/admin/orders",        protect, getAllOrders);
router.patch ("/admin/orders/:id",    protect, updateOrderStatus);
router.delete(
  "/admin/orders/:id",
  protect ,
  deleteOrder
);

module.exports = router;
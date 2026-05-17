const express = require("express");

const {
  getAbout,
  updateAbout,
} = require("../controllers/aboutController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAbout);

router.put("/", protect, updateAbout);

module.exports = router;
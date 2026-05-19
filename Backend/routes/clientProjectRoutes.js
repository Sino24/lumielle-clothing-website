
const express = require("express");
const router  = express.Router();

const {
  getClientProjects,
  getAllClientProjects,
  getClientProjectById,
  createClientProject,
  updateClientProject,
  deleteClientProject,
} = require("../controllers/clientProjectController");

const { protect } = require("../middleware/authMiddleware");

// Public
router.get("/",        getClientProjects);
router.get("/all",     protect, getAllClientProjects);
router.get("/:id",     getClientProjectById);

// Admin
router.post("/",       protect, createClientProject);
router.put("/:id",     protect, updateClientProject);
router.delete("/:id",  protect, deleteClientProject);

module.exports = router;
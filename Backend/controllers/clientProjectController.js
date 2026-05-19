

const ClientProject = require("../models/Project");

// ── GET public — visible projects ────────────────────────────────────────────
const getClientProjects = async (req, res) => {
  try {
    const projects = await ClientProject.find({ isVisible: true }).sort("order");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET admin — all projects ──────────────────────────────────────────────────
const getAllClientProjects = async (req, res) => {
  try {
    const projects = await ClientProject.find().sort("order");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET single ────────────────────────────────────────────────────────────────
const getClientProjectById = async (req, res) => {
  try {
    const project = await ClientProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST create ───────────────────────────────────────────────────────────────
const createClientProject = async (req, res) => {
  try {
    const project = await ClientProject.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT update ────────────────────────────────────────────────────────────────
const updateClientProject = async (req, res) => {
  try {
    const project = await ClientProject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
const deleteClientProject = async (req, res) => {
  try {
    await ClientProject.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getClientProjects,
  getAllClientProjects,
  getClientProjectById,
  createClientProject,
  updateClientProject,
  deleteClientProject,
};
const Lookbook = require("../models/Lookbook");

// GET public
const getLookbook = async (req, res) => {
  try {
    const looks = await Lookbook.find({
      isVisible: true,
    }).sort("order");

    res.json(looks);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET admin
const getAllLookbook = async (
  req,
  res
) => {
  try {
    const looks = await Lookbook.find()
      .sort("order");

    res.json(looks);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// POST
const createLookbookEntry = async (
  req,
  res
) => {
  try {
    const entry = await Lookbook.create(
      req.body
    );

    res.status(201).json(entry);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// PUT
const updateLookbookEntry = async (
  req,
  res
) => {
  try {
    const entry =
      await Lookbook.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    res.json(entry);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// DELETE
const deleteLookbookEntry = async (
  req,
  res
) => {
  try {
    await Lookbook.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Deleted",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getLookbook,
  getAllLookbook,
  createLookbookEntry,
  updateLookbookEntry,
  deleteLookbookEntry,
};
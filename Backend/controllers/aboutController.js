const About = require("../models/About");

// GET
const getAbout = async (req, res) => {
  try {
    let about = await About.findOne();

    if (!about) {
      about = await About.create({});
    }

    res.json(about);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// PUT
const updateAbout = async (req, res) => {
  try {
    let about = await About.findOne();

    if (!about) {
      about = await About.create(req.body);
    } else {
      Object.assign(about, req.body);

      await about.save();
    }

    res.json(about);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getAbout,
  updateAbout,
};
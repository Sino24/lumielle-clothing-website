// controllers/heroController.js

const Hero = require("../models/Hero");

// GET /api/hero
const getHero = async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) hero = await Hero.create({});
    res.json(hero);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/hero
const updateHero = async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) {
      hero = await Hero.create(req.body);
    } else {
      Object.assign(hero, req.body);
      await hero.save();
    }
    res.json(hero);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getHero, updateHero };
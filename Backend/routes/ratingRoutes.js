// routes/ratingRoutes.js
// Register in server.js:
//   app.use("/api/ratings", require("./routes/ratingRoutes"));

const express = require("express");
const router  = express.Router();
const { getRatings, upsertRating } = require("../controllers/ratingController");

// GET  /api/ratings/:productId  — fetch average + count + visitor's own score
// POST /api/ratings/:productId  — submit or update a rating { score: 1-5 }
router.route("/:productId")
  .get(getRatings)
  .post(upsertRating);

module.exports = router;
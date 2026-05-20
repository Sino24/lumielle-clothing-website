// controllers/ratingController.js

const crypto  = require("crypto");
const Rating  = require("../models/Rating");

// Helper — build a fingerprint from IP + User-Agent
// Not perfect but good enough for anonymous ratings without accounts
const getFingerprint = (req) => {
  const ip  = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
              || req.socket.remoteAddress
              || "unknown";
  const ua  = req.headers["user-agent"] || "unknown";
  return crypto.createHash("sha256").update(`${ip}::${ua}`).digest("hex");
};

// ── GET /api/ratings/:productId ───────────────────────────────────────────────
// Returns: { average, count, userScore }
// userScore is the current visitor's own rating (or null)
const getRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    const fingerprint   = getFingerprint(req);

    const ratings = await Rating.find({ productId });

    const count   = ratings.length;
    const average = count
      ? Math.round((ratings.reduce((s, r) => s + r.score, 0) / count) * 10) / 10
      : 0;

    const mine = ratings.find((r) => r.fingerprint === fingerprint);

    res.json({ average, count, userScore: mine ? mine.score : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/ratings/:productId ──────────────────────────────────────────────
// Body: { score: 1–5 }
// Creates or updates the visitor's rating
const upsertRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const { score }     = req.body;
    const fingerprint   = getFingerprint(req);

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: "Score must be 1–5" });
    }

    await Rating.findOneAndUpdate(
      { productId, fingerprint },
      { score: Number(score) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Return fresh summary
    const ratings = await Rating.find({ productId });
    const count   = ratings.length;
    const average = count
      ? Math.round((ratings.reduce((s, r) => s + r.score, 0) / count) * 10) / 10
      : 0;

    res.json({ average, count, userScore: Number(score) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getRatings, upsertRating };
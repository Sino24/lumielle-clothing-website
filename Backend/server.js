// server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config({ quiet: true });

connectDB();

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://lumielle-clothing-website.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// ── Routes ─────────────────────────────────────────────────

// Products
app.use(
  "/api/products",
  require("./routes/productRoutes")
);

// Upload
app.use(
  "/api/upload",
  require("./routes/uploadRoutes")
);

// Admin
app.use(
  "/api/admin",
  require("./routes/adminRoutes")
);

// Contact
app.use(
  "/api/contact",
  require("./routes/contactRoutes")
);

// Lookbook
app.use(
  "/api/lookbook",
  require("./routes/lookbookRoutes")
);

// About
app.use(
  "/api/about",
  require("./routes/aboutRoutes")
);

// ── Health Check ───────────────────────────────────────────

app.get("/", (req, res) => {
  res.send("API Running...");
});

// ── 404 Handler ────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ───────────────────────────────────

app.use((err, req, res, next) => {
  console.error(
    "Unhandled error:",
    err.message
  );

  res.status(err.status || 500).json({
    message:
      err.message || "Internal server error",
  });
});

// ── Start Server ───────────────────────────────────────────

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("");
  console.log("🚀 SERVER STARTED");
  console.log(
    `🌐 http://localhost:${PORT}`
  );

  console.log(
    `📦 Products  → /api/products`
  );

  console.log(
    `☁️ Upload    → /api/upload`
  );

  console.log(
    `🔐 Admin     → /api/admin`
  );

  console.log(
    `📩 Contact   → /api/contact`
  );

  console.log(
    `🖼️ Lookbook  → /api/lookbook`
  );

  console.log(
    `ℹ️ About      → /api/about`
  );

  console.log("");
});
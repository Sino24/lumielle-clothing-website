const express = require("express");
const dotenv  = require("dotenv");
const cors    = require("cors");

const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

dotenv.config({ quiet: true });
connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://lumielle-clothing-website.vercel.app",
  ],
  credentials: true,
}));

app.use(helmet());
app.use(express.json({ limit: "10kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api/products",        require("./routes/productRoutes"));
app.use("/api/upload",          require("./routes/uploadRoutes"));
app.use("/api/admin",           require("./routes/adminRoutes"));
app.use("/api/auth",            require("./routes/authRoutes"));
app.use("/api/contact",         require("./routes/contactRoutes"));
app.use("/api/lookbook",        require("./routes/lookbookRoutes"));
app.use("/api/about",           require("./routes/aboutRoutes"));
app.use("/api/hero",            require("./routes/heroRoutes"));
app.use("/api/client-projects", require("./routes/clientProjectRoutes"));
app.use("/api/ratings",         require("./routes/ratingRoutes"));
app.use("/api/cart",            require("./routes/cartRoutes"));

app.get("/", (req, res) => res.send("API Running..."));

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("");
  console.log("🚀 SERVER STARTED");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📦 Products        → /api/products`);
  console.log(`☁️  Upload          → /api/upload`);
  console.log(`🔐 Admin           → /api/admin`);
  console.log(`👤 Auth            → /api/auth`);
  console.log(`📩 Contact         → /api/contact`);
  console.log(`🖼️  Lookbook        → /api/lookbook`);
  console.log(`ℹ️  About           → /api/about`);
  console.log(`🎯 Hero            → /api/hero`);
  console.log(`💼 Client Projects → /api/client-projects`);
  console.log(`⭐ Ratings         → /api/ratings`);
  console.log(`🛒 Cart            → /api/cart`);
  console.log(`🛡️  Security        → helmet + rate-limit`);
  console.log("");
});
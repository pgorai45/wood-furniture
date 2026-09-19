const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");

const app = express();

// ================= 1. SECURITY HEADERS (HELMET) =================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// ================= 2. SECURE CORS CONFIGURATION =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman during dev)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS Policy: Access denied for this origin."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser limits to prevent DOS attacks
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ================= 3. RATE LIMITING =================
// General API rate limiter (500 requests per 15 min per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use("/api", generalLimiter);

// Sensitive Auth / OTP rate limiter (45 requests per 15 min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 45,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please wait a few minutes before trying again.",
  },
});
app.use("/api/auth", authLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/users/send-otp", authLimiter);
app.use("/api/users/verify-otp", authLimiter);

// Serve static uploads for avatars and media
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= 4. HOME & HEALTH CHECK =================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bidyut Furniture Backend Running Securely",
  });
});

// ================= 5. ALL ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

// ================= 6. SAFE CENTRAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("[Internal Server Error]:", err.message);
  if (err.stack && process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Handle CORS errors
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  // Never expose raw database errors or stack traces to clients
  res.status(err.status || 500).json({
    success: false,
    message: "An internal server error occurred. Please try again later.",
  });
});

// ================= 7. SERVER INITIALIZATION =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running securely on http://localhost:${PORT}`);
});

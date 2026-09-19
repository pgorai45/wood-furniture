const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "bidyut_furniture_secret_2026";

// ================= VERIFY TOKEN =================

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Authentication token required.",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token || token.trim() === "") {
    return res.status(401).json({
      success: false,
      message: "Access denied. Invalid token format.",
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

// ================= ADMIN ONLY =================

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Administrative privileges required.",
    });
  }

  next();
};

module.exports = {
  verifyToken,
  adminOnly,
  getJwtSecret,
};
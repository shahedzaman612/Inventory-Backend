// middleware/auth.js
const jwt = require("jsonwebtoken");

/**
 * Authentication middleware
 * Protects routes by verifying JWT token from Authorization header.
 */
const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header provided" });
  }

  // Expecting format: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Malformed token" });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || "secretkey";

  if (!process.env.JWT_SECRET) {
    console.warn("Warning: JWT_SECRET not set. Using default secret. Set JWT_SECRET in production!");
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded.user; // { id, role }
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = auth;

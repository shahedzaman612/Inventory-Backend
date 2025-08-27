// routes/auth.js
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", loginUser);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset link
// @access  Public
router.post("/forgot-password", forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post("/reset-password/:token", resetPassword);

// @route   GET /api/auth/verify-email/:token
// @desc    Verify user email
// @access  Public
router.get("/verify-email/:token", verifyEmail);

module.exports = router;

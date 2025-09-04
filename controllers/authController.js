// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

// ======================= HELPER FUNCTIONS =======================
const generateToken = (user) => {
  return jwt.sign(
    { user: { id: user._id, role: user.role } },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "1h" }
  );
};

// ======================= REGISTER USER =======================
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({ username, email, password, isVerified: false });
    await user.save();

    // Generate email verification token
    const emailToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const url = `${process.env.CLIENT_URL}/verify-email/${emailToken}`;

    // Send verification email
    await sendEmail(
      user.email,
      "Verify your email",
      `<p>Hi ${user.username},</p>
       <p>Click the link below to verify your email:</p>
       <a href="${url}">${url}</a>`
    );

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= VERIFY EMAIL =======================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid token" });

    if (user.isVerified)
      return res.status(200).json({ message: "Email already verified." });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now login." });
  } catch (err) {
    console.error("Verify Email Error:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// ======================= LOGIN =======================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.stack || err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// ======================= FORGOT PASSWORD =======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      `<p>Hi ${user.username},</p>
       <p>Click the link below to reset your password (valid for 1 hour):</p>
       <a href="${resetUrl}">${resetUrl}</a>`
    );

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= RESET PASSWORD =======================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.password = password; // pre-save hook will hash
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now login." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// ======================= OAUTH LOGIN (Google/GitHub) =======================
export const oauthLogin = async (req, res) => {
  try {
    // Passport sets req.user after OAuth success
    const oauthUser = req.user;

    // Generate JWT
    const token = generateToken(oauthUser);

    // Redirect or send token to frontend
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  } catch (err) {
    console.error("OAuth Login Error:", err);
    res.status(500).json({ message: "OAuth login failed" });
  }
};

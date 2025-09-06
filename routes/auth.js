const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ---------------- TOKEN HELPERS ----------------
const generateAccessToken = userId =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

const generateRefreshToken = userId =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// In-memory refresh token store (production এ DB/Redis ব্যবহার করা উচিত)
let refreshTokens = [];

// ---------------- Nodemailer Transporter ----------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// -------------------- REGISTER WITH OTP --------------------
router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      nidNumber,
      dob,
      gender,
      address,
      accountType,
      role,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !nidNumber ||
      !dob ||
      !gender ||
      !address ||
      !accountType
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 min

    // Create user with correct field names
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      nidNumber,
      dob,
      gender,
      address,
      accountType,
      role: role || 'user',
      isActive: false,
      otp,
      otpExpire,
    });

    // Save user
    await user.save();

    // Send OTP email
    const message = `
      <h3>OTP Verification</h3>
      <p>Your OTP for account verification is: <b>${otp}</b></p>
      <p>It will expire in 10 minutes.</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'OTP Verification',
      html: message,
    });

    res.status(201).json({
      message: 'OTP sent to your email. Verify to activate account.',
      email: user.email,
    });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.name === 'ValidationError') {
      // Send all validation errors
      const errors = Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- VERIFY OTP --------------------
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isActive)
      return res.status(400).json({ message: 'User already verified' });

    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpire < Date.now())
      return res.status(400).json({ message: 'OTP expired' });

    // OTP valid, activate user
    user.isActive = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Generate tokens
    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    refreshTokens.push(refreshToken);

    res.json({
      message: 'Account verified successfully',
      token,
      refreshToken,
      user,
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- RESEND OTP --------------------
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.isActive)
    return res.status(400).json({ message: 'User already verified' });

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = Date.now() + 10 * 60 * 1000; // 10 min

  user.otp = otp;
  user.otpExpire = otpExpire;
  await user.save();

  // Send email
  const message = `
    <h3>OTP Verification</h3>
    <p>Your new OTP is: <b>${otp}</b></p>
    <p>It will expire in 10 minutes.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Resend OTP Verification',
      html: message,
    });
    res.json({ message: 'New OTP sent to your email' });
  } catch (err) {
    console.error('Resend OTP email error:', err);
    res.status(500).json({ message: 'Could not send OTP' });
  }
});

// -------------------- LOGIN --------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isActive)
      return res
        .status(403)
        .json({ message: 'Account not verified. Please verify OTP.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    refreshTokens.push(refreshToken);

    res.json({
      token,
      refreshToken,
      user,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- REFRESH TOKEN --------------------
router.post('/refresh', (req, res) => {
  const refreshToken = req.header('x-refresh-token');
  if (!refreshToken)
    return res.status(401).json({ message: 'Refresh token required' });

  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json({ message: 'Invalid refresh token' });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const newAccessToken = generateAccessToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id);

    refreshTokens = refreshTokens.filter(t => t !== refreshToken);
    refreshTokens.push(newRefreshToken);

    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  });
});

// -------------------- LOGOUT --------------------
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter(t => t !== refreshToken);
  res.json({ message: 'Logged out successfully' });
});

// -------------------- FORGOT PASSWORD --------------------
router.post('/forgot-password', async (req, res) => {
  let { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  email = email.toLowerCase();
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `
    <h3>Password Reset Request</h3>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 1 hour.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Password Reset',
      html: message,
    });
    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password email error:', err);
    res.status(500).json({ message: 'Email could not be sent' });
  }
});

// -------------------- RESET PASSWORD --------------------
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  res.json({ message: 'Password reset successful' });
});

module.exports = router;

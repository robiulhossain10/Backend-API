const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ---------------- TOKEN HELPERS ----------------
const generateAccessToken = userId =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

const generateRefreshToken = userId =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// In-memory refresh token store (production এ DB/Redis ব্যবহার করা উচিত)
let refreshTokens = [];

// -------------------- REGISTER --------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    refreshTokens.push(refreshToken);

    // 👉 refreshToken header এ পাঠাচ্ছি
    res.header('x-refresh-token', refreshToken).status(201).json({
      token,
      user,
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- LOGIN --------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    refreshTokens.push(refreshToken);

    // 👉 refreshToken header এ পাঠাচ্ছি
    res.header('x-refresh-token', refreshToken).json({
      token,
      user,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- REFRESH TOKEN --------------------
router.post('/refresh', (req, res) => {
  // header থেকে নেওয়া
  const refreshToken = req.header('x-refresh-token');
  if (!refreshToken)
    return res.status(401).json({ message: 'Refresh token required' });

  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json({ message: 'Invalid refresh token' });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const newAccessToken = generateAccessToken(decoded.id);
    res.json({ token: newAccessToken });
  });
});

// -------------------- LOGOUT --------------------
router.post('/logout', (req, res) => {
  const refreshToken = req.header('x-refresh-token');
  refreshTokens = refreshTokens.filter(t => t !== refreshToken);
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

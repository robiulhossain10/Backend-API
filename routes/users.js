const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// -------------------- Get all users (protected) --------------------
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // remove passwords
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ message: 'Could not load users' });
  }
});

// -------------------- Get logged-in user's profile --------------------
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- Update logged-in user's profile --------------------
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // email uniqueness check
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const updateData = { name, email };

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
      select: '-password',
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- Get user by ID --------------------
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get user by ID error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- Update user by ID --------------------
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // অন্য ইউজারের সাথে email conflict আছে কিনা
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.params.id },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const updateData = { name, email };

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
      select: '-password',
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Update user by ID error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- Delete user by ID --------------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

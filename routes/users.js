const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// =================== Get All Users ===================
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// =================== Add New User ===================
router.post('/create', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      nidNumber,
      dob,
      gender,
      address,
      accountType,
      password,
      role,
      isActive,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !nidNumber ||
      !dob ||
      !gender ||
      !address ||
      !accountType ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: 'All required fields must be filled' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      phone,
      nidNumber,
      dob,
      gender,
      address,
      accountType,
      password: hashedPassword,
      role: role || 'general',
      isActive: isActive ?? false,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error creating user', error: err.message });
  }
});

// =================== Get User by ID ===================
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// =================== Update User by ID ===================
router.put('/:id', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      nidNumber,
      dob,
      gender,
      address,
      accountType,
      password,
      role,
      isActive,
    } = req.body;

    const updateData = {
      fullName,
      email,
      phone,
      nidNumber,
      dob,
      gender,
      address,
      accountType,
      role,
      isActive,
    };

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true, select: '-password' }
    );

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error updating user', error: err.message });
  }
});

// =================== Delete User by ID ===================
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;

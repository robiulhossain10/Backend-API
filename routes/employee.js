const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all employees
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// CREATE employee
router.post('/create', async (req, res) => {
  try {
    const user = new User(req.body); // req.body সরাসরি receive
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE employee
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

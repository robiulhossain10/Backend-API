const User = require('../models/User');

// CREATE
const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ message: '✅ User created successfully!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error creating user', error: err });
  }
};

// READ
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: '❌ Error fetching users', error: err });
  }
};

// UPDATE
const updateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: '✅ User updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error updating user', error: err });
  }
};

// DELETE
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ User deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error deleting user', error: err });
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };

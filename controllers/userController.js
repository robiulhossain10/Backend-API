const User = require('../models/User');
const bcrypt = require('bcryptjs');

// CREATE USER
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!password)
      return res.status(400).json({ message: 'Password is required' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const user = newUser.toObject();
    delete user.password;

    res.status(201).json({ message: 'User created successfully!', user });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error creating user', error: err.message });
  }
};

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // password hide
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching users', error: err.message });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      select: '-password',
    });

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated successfully!', user: updatedUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error updating user', error: err.message });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully!' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error deleting user', error: err.message });
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };

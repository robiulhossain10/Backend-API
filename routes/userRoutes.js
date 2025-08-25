const express = require('express');
const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// /api/users
router.post('/', createUser); // Create
router.get('/', getUsers); // Read
router.put('/:id', updateUser); // Update
router.delete('/:id', deleteUser); // Delete

module.exports = router;

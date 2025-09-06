const express = require('express');
const router = express.Router();
const Employee = require('../models/employee.model');

// Create Employee
router.post('/create', async (req, res) => {
  try {
    const { name, role, email, phone, status } = req.body;

    if (!name || !role || !email || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee)
      return res.status(400).json({ message: 'Employee already exists' });

    const employee = await Employee.create({
      name,
      role,
      email,
      phone,
      status: status || 'Active',
    });

    res.status(201).json({ message: 'Employee created', employee });
  } catch (err) {
    console.error('Create Employee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error('Get Employees error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    console.error('Get Employee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Employee
router.put('/:id', async (req, res) => {
  try {
    const { name, role, email, phone, status } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, role, email, phone, status },
      { new: true }
    );
    if (!employee)
      return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee updated', employee });
  } catch (err) {
    console.error('Update Employee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee)
      return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error('Delete Employee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

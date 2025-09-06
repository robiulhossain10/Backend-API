// routes/admin.js
const express = require('express');
const router = express.Router();

const Employee = require('../models/employee.model');
const Customer = require('../models/Customer'); // Ensure correct filename
// const Report = require('../models/report.model');
// const Audit = require('../models/audit.model');

// ======================== MIDDLEWARE ========================
// Temporary admin bypass for testing
const adminOnly = (req, res, next) => {
  req.user = { role: 'admin' }; // temporary admin user
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

// ======================== EMPLOYEES ========================

// Get all employees
router.get('/employees', adminOnly, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single employee
router.get('/employees/:id', adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create employee
router.post('/employees/create', adminOnly, async (req, res) => {
  try {
    const { name, role, email, phone, status } = req.body;

    if (!name || !role || !email || !phone || !status) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newEmp = new Employee({ name, role, email, phone, status });
    const savedEmp = await newEmp.save();
    res.status(201).json(savedEmp);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update employee
router.put('/employees/:id', adminOnly, async (req, res) => {
  try {
    const updatedEmp = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEmp)
      return res.status(404).json({ message: 'Employee not found' });
    res.json(updatedEmp);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete employee
router.delete('/employees/:id', adminOnly, async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ======================== CUSTOMERS ========================
router.get('/customers', adminOnly, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

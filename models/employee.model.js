// models/employee.model.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: String,
    role: String,
    email: String,
    phone: String,
    status: String, // Active / Inactive
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);

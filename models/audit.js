// models/audit.model.js
const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    user: String,
    action: String,
    ipAddress: String,
    details: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Audit', auditSchema);

// models/report.model.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    type: String, // daily / monthly
    transactions: Number,
    newAccounts: Number,
    totalAmount: Number,
    date: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);

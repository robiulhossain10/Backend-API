const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  emi: { type: Number, required: true },
  purpose: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Loan', loanSchema);

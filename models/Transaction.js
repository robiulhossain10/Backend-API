const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'withdraw', 'transfer'],
    required: true,
  },
  amount: { type: Number, required: true },
  note: { type: String },
  fromAccount: { type: String }, // for transfers
  toAccount: { type: String }, // for transfers
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'completed',
  }, // ✅ add default
});

module.exports = mongoose.model('Transaction', transactionSchema);

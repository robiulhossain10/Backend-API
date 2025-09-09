const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const PDFDocument = require('pdfkit');
const path = require('path');

// 🔹 Deposit
router.post('/deposit', async (req, res) => {
  try {
    const { amount, note } = req.body;
    const tx = await Transaction.create({
      type: 'deposit',
      amount,
      note,
      status: 'completed', // ✅ mark as completed
    });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Withdraw
router.post('/withdraw', async (req, res) => {
  try {
    const { amount, note } = req.body;
    const tx = await Transaction.create({
      type: 'withdraw',
      amount,
      note,
      status: 'completed', // ✅ mark as completed
    });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Transfer (Internal/External)
router.post('/transfer', async (req, res) => {
  try {
    const { amount, fromAccount, toAccount, note, type } = req.body;
    const tx = await Transaction.create({
      type: 'transfer',
      amount,
      fromAccount,
      toAccount,
      note,
      status: 'pending', // transfers start as pending
    });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Transaction History
router.get('/history', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Download PDF Statement
router.get('/statement', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=statement.pdf`);

    // Use a font that supports Unicode (for ৳ and other symbols)
    const fontPath = path.join(__dirname, '../fonts/NotoSans-Regular.ttf'); 
    doc.font(fontPath);

    // Header
    doc.fontSize(20).text('Bank Statement', { align: 'center' });
    doc.moveDown(1);

    // Table Header
    doc
      .fontSize(12)
      .text('Date       | Type       | Amount    | Status     | Note', {
        underline: true,
      });
    doc.moveDown(0.5);

    // Transactions
    transactions.forEach((tx) => {
      const dateStr = tx.date.toISOString().split('T')[0];
      const typeStr = tx.type.toUpperCase().padEnd(10, ' ');
      const amountStr = `৳${tx.amount}`.padEnd(10, ' ');
      const statusStr = tx.status ? tx.status.toUpperCase().padEnd(10, ' ') : ''.padEnd(10, ' ');
      const noteStr = tx.note || '';

      doc.text(`${dateStr} | ${typeStr} | ${amountStr} | ${statusStr} | ${noteStr}`);
    });

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

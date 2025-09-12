const Loan = require('../models/Loan');

// Create Loan Application
exports.createLoan = async (req, res) => {
  try {
    const loan = new Loan(req.body);
    await loan.save();
    const populatedLoan = await Loan.findById(loan._id).populate(
      'customerId',
      'fullName phone'
    );
    res.status(201).json(populatedLoan);
  } catch (err) {
    res.status(400).json({
      message: err.errors
        ? Object.values(err.errors).map(e => e.message)
        : err.message,
    });
  }
};

// Get Loans by Status
exports.getLoansByStatus = async (req, res) => {
  try {
    const loans = await Loan.find({ status: req.params.status }).populate(
      'customerId',
      'fullName phone'
    );
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Loan Status (Approve / Reject)
// make sure export ঠিক আছে
// Update Loan Status (Approve / Reject)
exports.updateLoanStatus = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('customerId', 'fullName phone'); // populate যোগ করা হলো

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(loan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



// Record EMI Payment
exports.recordPayment = async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: 'Loan not found' });

  loan.payments.push({
    amount: req.body.amount,
    date: new Date(),
  });

  // Auto-complete if all EMIs paid
  if (loan.payments.length >= loan.tenureMonths) {
    loan.status = 'completed';
  }

  await loan.save();
  res.json(loan);
};


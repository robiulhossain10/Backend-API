const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');

router.post('/', loanController.createLoan);
router.get('/status/:status', loanController.getLoansByStatus);
router.patch('/:id/status', loanController.updateLoanStatus);
router.post('/:id/payments', loanController.recordPayment);

module.exports = router;

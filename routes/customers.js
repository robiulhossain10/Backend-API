const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Upload directory
const uploadDir = path.join(__dirname, '../uploads/kyc');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(
      /\s+/g,
      '_'
    )}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Add Customer
router.post('/', upload.array('kycDocuments', 5), async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      nidNumber,
      dob,
      gender,
      address,
      accountType,
    } = req.body;
    if (
      !fullName ||
      !email ||
      !phone ||
      !nidNumber ||
      !dob ||
      !gender ||
      !address ||
      !accountType
    )
      return res.status(400).json({ message: 'All fields required' });

    const existing = await Customer.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Customer exists' });

    const kycFiles = req.files
      ? req.files.map(f => ({
          filename: f.filename,
          path: `uploads/kyc/${f.filename}`,
          uploadedAt: new Date(),
        }))
      : [];

    const customer = await Customer.create({
      fullName,
      email,
      phone,
      nidNumber,
      dob,
      gender,
      address,
      accountType,
      kycDocuments: kycFiles,
    });
    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update customer
router.put('/:id', upload.array('kycDocuments', 5), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: 'Customer not found' });

    const { fullName, email, phone, address, accountType } = req.body;
    if (fullName) customer.fullName = fullName;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;
    if (address) customer.address = address;
    if (accountType) customer.accountType = accountType;

    if (req.files && req.files.length > 0) {
      const kycFiles = req.files.map(f => ({
        filename: f.filename,
        path: `uploads/kyc/${f.filename}`,
        uploadedAt: new Date(),
      }));
      customer.kycDocuments.push(...kycFiles);
    }

    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

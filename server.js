// server.js

// ---------------- Load environment variables ----------------
require('dotenv').config();

// ---------------- Import dependencies ----------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

// ---------------- Import routes ----------------
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const adminRoutes = require('./routes/admin'); // Admin routes (employees, reports, audit)
const transactionsRouter = require('./routes/transactions');

// ---------------- Initialize app ----------------
const app = express();

// ---------------- Middleware ----------------
app.use(helmet());

// CORS setup
app.use(
  cors({
    origin:
      process.env.CLIENT_URL || 'https://bankmanagementsystem-beta.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json());

// HTTP logger
app.use(morgan('dev'));

// ---------------- Routes ----------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes); // ✅ Admin routes: /api/admin/employees, /api/admin/reports, etc
// Routes
app.use('/api/transactions', transactionsRouter);

// Serve uploads folder
app.use('/uploads', express.static('uploads'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: '✅ API is running...' });
});

// ---------------- Database connection ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ Mongo connection error:', err);
    process.exit(1);
  });

// ---------------- Server ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));

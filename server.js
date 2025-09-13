// ---------------- Load environment variables ----------------
require('dotenv').config();

// ---------------- Import dependencies ----------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

// ---------------- Import routes ----------------
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const adminRoutes = require('./routes/admin');
const transactionsRouter = require('./routes/transactions');
const loanRoutes = require('./routes/loan.routes');

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
app.use(express.urlencoded({ extended: true }));

// HTTP logger
app.use(morgan('dev'));

// ---------------- Disable caching for API ----------------
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// ---------------- Routes ----------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionsRouter);
app.use('/api/loans', loanRoutes);

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({ message: '✅ API is running...' });
});

// ---------------- Database connection ----------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ---------------- Server ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));

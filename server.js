// ---------------- Load environment variables ----------------
require('dotenv').config();

// ---------------- Import dependencies ----------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// ---------------- Import routes ----------------
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// ---------------- Initialize app ----------------
const app = express();

// ---------------- Middleware ----------------

// CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*', // নিরাপদে frontend URL ব্যবহার করুন
    credentials: true,
  })
);

// JSON parser
app.use(express.json());

// HTTP logger
app.use(morgan('dev'));

// ---------------- Routes ----------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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

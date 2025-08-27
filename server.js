// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express'); // ✅ declare only once
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // optional: for logging requests

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Initialize app
const app = express();

// Middleware
app.use(cors()); // allow all origins; optionally configure for frontend URL
app.use(express.json());
app.use(morgan('dev')); // optional: log requests to console

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Mongo connected'))
  .catch(err => console.error('Mongo connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

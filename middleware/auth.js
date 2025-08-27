const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  try {
    // Get token from header
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: 'No token, authorization denied' });
    }

    // Expected format: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid authorization format' });
    }

    const token = parts[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

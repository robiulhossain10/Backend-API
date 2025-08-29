const jwt = require('jsonwebtoken');

/**
 * Auth middleware
 * options.type = 'access' | 'refresh'
 */
module.exports = function (options = { type: 'access' }) {
  return function (req, res, next) {
    try {
      let token;

      if (options.type === 'refresh') {
        // Refresh token usually in header 'x-refresh-token'
        token = req.headers['x-refresh-token'];
      } else {
        // Access token in Authorization header
        const authHeader =
          req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader)
          return res
            .status(401)
            .json({ message: 'No token, authorization denied' });

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer')
          return res
            .status(401)
            .json({ message: 'Invalid authorization format' });

        token = parts[1];
      }

      if (!token) return res.status(401).json({ message: 'Token not found' });

      const secret =
        options.type === 'refresh'
          ? process.env.JWT_REFRESH_SECRET
          : process.env.JWT_SECRET;

      const decoded = jwt.verify(token, secret);

      // attach only id to req.user
      req.user = { id: decoded.id };
      next();
    } catch (err) {
      console.error('Auth middleware error:', err.message);
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

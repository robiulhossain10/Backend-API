const jwt = require('jsonwebtoken');

/**
 * Auth middleware
 * By default checks access token from Authorization header
 * If you want to verify refresh token, pass { type: 'refresh' } as second param
 */
module.exports = function (options = { type: 'access' }) {
  return function (req, res, next) {
    try {
      const authHeader =
        req.headers['authorization'] || req.headers['Authorization'];

      if (!authHeader) {
        return res
          .status(401)
          .json({ message: 'No token, authorization denied' });
      }

      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res
          .status(401)
          .json({ message: 'Invalid authorization format' });
      }

      const token = parts[1];

      const secret =
        options.type === 'refresh'
          ? process.env.JWT_REFRESH_SECRET
          : process.env.JWT_SECRET;

      const decoded = jwt.verify(token, secret);
      req.user = decoded; // attach user info
      next();
    } catch (err) {
      console.error('Auth middleware error:', err.message);
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

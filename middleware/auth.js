const jwt = require('jsonwebtoken');

/**
 * Auth middleware
 * options.type = 'access' | 'refresh'
 */
module.exports = function (options = { type: 'access' }) {
  return (req, res, next) => {
    try {
      let token;

      // -------------------- Token Extraction --------------------
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
            .json({ message: 'No token provided, authorization denied' });

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer')
          return res
            .status(401)
            .json({ message: 'Invalid authorization format' });

        token = parts[1];
      }

      if (!token)
        return res
          .status(401)
          .json({ message: 'Token not found in request headers' });

      // -------------------- Token Verification --------------------
      const secret =
        options.type === 'refresh'
          ? process.env.JWT_REFRESH_SECRET
          : process.env.JWT_SECRET;

      jwt.verify(token, secret, (err, decoded) => {
        if (err)
          return res
            .status(401)
            .json({ message: 'Token is invalid or expired' });

        // Attach only user id to req.user
        req.user = { id: decoded.id };
        next();
      });
    } catch (err) {
      console.error('Auth middleware error:', err.message);
      res.status(500).json({ message: 'Server error in auth middleware' });
    }
  };
};

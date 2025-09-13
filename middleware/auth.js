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
        token = req.headers['x-refresh-token']; // refresh token usually in this header
      } else {
        const authHeader =
          req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader)
          return res
            .status(401)
            .json({ message: 'No token provided, authorization denied' });

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer')
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

      if (!secret) {
        console.error('JWT secret not defined in environment');
        return res.status(500).json({ message: 'Server misconfiguration' });
      }

      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          console.error('JWT verification failed:', err.message);
          return res
            .status(401)
            .json({ message: 'Token is invalid or expired' });
        }

        // ✅ Attach user payload to request
        req.user = decoded; // decoded should contain id, role, email, etc.
        next();
      });
    } catch (err) {
      console.error('Auth middleware error:', err.message);
      res.status(500).json({ message: 'Server error in auth middleware' });
    }
  };
};

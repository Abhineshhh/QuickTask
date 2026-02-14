const jwt = require('jsonwebtoken');

/**
 * Authentication middleware — verifies JWT from Authorization header.
 * Attaches userId to req object for downstream route handlers.
 */
const auth = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;

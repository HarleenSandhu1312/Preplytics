/**
 * middleware/auth.js
 * JWT authentication middleware.
 * 
 * protect      — verifies JWT token, attaches req.user (required for protected routes)
 * authorizeAdmin — checks req.user.role === 'admin' (used after protect)
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── JWT PROTECT ───────────────────────────────
// Reads Bearer token from Authorization header or cookie,
// verifies it, and attaches the user to req.user.
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ── ADMIN AUTHORIZATION ───────────────────────
// Use AFTER protect. Rejects non-admins.
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access denied — Admins only.' });
};

module.exports = { protect, authorizeAdmin };

/**
 * utils/jwt.js
 * ─────────────────────────────────────────────
 * JWT UTILITY HELPERS
 *
 * JWT (JSON Web Token) = a compact, signed token used for authentication.
 * Structure: header.payload.signature
 *   - header: algorithm type
 *   - payload: user data (id, role)
 *   - signature: ensures the token wasn't tampered with
 *
 * Unlike sessions, JWTs are stateless — the server doesn't need to
 * store them; it just verifies the signature on every request.
 * ─────────────────────────────────────────────
 */

const jwt = require('jsonwebtoken');

// ─── Send token in cookie + JSON response ─────
// Centralizes the "login success" response for reuse in register/login controllers
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateJWT();

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days
    httpOnly: true,   // Cookie not accessible via JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production',             // HTTPS only in prod
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
};

module.exports = { sendTokenResponse };

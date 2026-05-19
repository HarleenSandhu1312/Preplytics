/**
 * routes/authRoutes.js
 * ─────────────────────────────────────────────
 * AUTH ROUTES
 *
 * ROUTER-LEVEL MIDDLEWARE:
 * Each route can have middleware specific to it.
 * e.g. protect middleware only runs on /me and /update routes.
 *
 * Public routes  → no middleware needed
 * Private routes → protect middleware runs first, then controller
 * ─────────────────────────────────────────────
 */

const express = require('express');
const router  = express.Router();

const { register, login, getMe, logout, updateProfile, changePassword } = require('../controllers/authController');
const { protect }       = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');
const upload            = require('../middleware/upload');

// Public routes — no authentication needed
router.post('/register', validateRegister, register);
router.post('/login',    validateLogin,    login);
router.post('/logout',   logout);

// Protected routes — JWT required (protect middleware runs first)
router.get('/me',                      protect, getMe);
router.put('/update-profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

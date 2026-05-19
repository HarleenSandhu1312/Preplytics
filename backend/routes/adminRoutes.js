/**
 * routes/adminRoutes.js
 * Admin-only routes — protected by protect + authorizeAdmin middleware
 */

const express  = require('express');
const router   = express.Router();
const { getAnalytics, getAllUsers, removeUser, createUser } = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.use(protect, authorizeAdmin);

router.get('/analytics',       getAnalytics);
router.get('/users',           getAllUsers);       // All users
router.post('/users',          createUser);        // Create admin/student user
router.delete('/users/:id',    removeUser);        // Remove any user

module.exports = router;

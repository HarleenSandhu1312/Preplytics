/**
 * middleware/validate.js
 * Input validation using express-validator.
 * Runs before controllers; returns 400 on failure.
 */

const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── REGISTER ──────────────────────────────────
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('acceptedTerms')
    .equals('true').withMessage('You must accept the Terms & Conditions'),

  handleValidation,
];

// ── LOGIN ─────────────────────────────────────
const validateLogin = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// ── STUDY PLAN ────────────────────────────────
const validateStudyPlan = [
  body('title').trim().notEmpty().withMessage('Plan title is required'),
  handleValidation,
];

module.exports = { validateRegister, validateLogin, validateStudyPlan, handleValidation };

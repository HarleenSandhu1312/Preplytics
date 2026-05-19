/**
 * controllers/authController.js
 * Auth business logic: register, login, getMe, logout, updateProfile, changePassword
 */

const User     = require('../models/User');
const Progress = require('../models/Progress');
const StudentStore = require('../models/StudentStore');
const { sendTokenResponse } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');

// ── REGISTER ─────────────────────────────────
// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, branch, examTarget, semester, acceptedTerms } = req.body;

    const accepted = acceptedTerms === true || acceptedTerms === 'true';
    if (!accepted) {
      return next(new AppError('You must accept the Terms & Conditions to register.', 400));
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(new AppError('An account with this email already exists.', 400));
    }

    // Password is hashed automatically by the pre-save hook in User model
    const user = await User.create({ name, email, password, role: 'student', branch, examTarget, semester });

    // Create a blank progress document for this user
    await Progress.create({ user: user._id });
    await StudentStore.create({ user: user._id });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ── LOGIN ─────────────────────────────────────
// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Need +password because select: false on the field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── GET CURRENT USER ──────────────────────────
// GET /api/auth/me  (protected)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ── LOGOUT ────────────────────────────────────
// POST /api/auth/logout
const logout = (req, res) => {
  // Clear the JWT cookie
  res.cookie('token', 'none', {
    expires:  new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// ── UPDATE PROFILE ─────────────────────────────
// PUT /api/auth/update-profile  (protected)
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, branch, examTarget, dailyGoal } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (branch !== undefined) update.branch = branch;
    if (examTarget !== undefined) update.examTarget = examTarget;
    if (dailyGoal !== undefined) update.dailyGoal = Number(dailyGoal);

    if (req.file) {
      update.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ── CHANGE PASSWORD ───────────────────────────
// PUT /api/auth/change-password  (protected)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return next(new AppError('Current password is incorrect.', 400));

    user.password = newPassword;  // Pre-save hook hashes it
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, logout, updateProfile, changePassword };

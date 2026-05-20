/**
 * models/User.js — User schema (students + admins)
 * Uses bcrypt for password hashing and JWT for token generation.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,  // Never returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    branch:      { type: String, default: '' },
    examTarget:  { type: String, default: '' },
    semester:    { type: String, default: '' },
    phone:       { type: String, default: '' },
    avatar:      { type: String, default: '' },
    dailyGoal:   { type: Number, default: 8 },
    lastLogin:   { type: Date },
    isActive:    { type: Boolean, default: true },
    acceptedTerms: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password with stored hash
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
UserSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('User', UserSchema);

/**
 * models/Progress.js
 * ─────────────────────────────────────────────
 * PROGRESS MODEL (MongoDB / Mongoose)
 *
 * Tracks daily study sessions and test results for each user.
 * One Progress document per user (upsert pattern).
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');

// Each daily entry records how many hours were studied
const DailyEntrySchema = new mongoose.Schema({
  date:      { type: String, required: true },   // "YYYY-MM-DD"
  hoursStudied: { type: Number, default: 0 },
  topicsCompleted: { type: Number, default: 0 },
});

// Each test result entry
const TestResultSchema = new mongoose.Schema({
  subject:   { type: String, required: true },
  testName:  { type: String, required: true },
  score:     { type: Number, required: true },
  total:     { type: Number, default: 100 },
  takenAt:   { type: Date, default: Date.now },
});

const ProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,  // One progress doc per user
    },
    streak:        { type: Number, default: 0 },
    totalHours:    { type: Number, default: 0 },
    dailyLog:      [DailyEntrySchema],
    testResults:   [TestResultSchema],
    certificates:  [{ subject: String, earnedAt: { type: Date, default: Date.now }, filePath: String }],
    activityLog:   [{ message: String, time: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progress', ProgressSchema);

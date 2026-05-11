/**
 * models/StudyPlan.js
 * ─────────────────────────────────────────────
 * STUDY PLAN MODEL (MongoDB / Mongoose)
 *
 * Each user can have multiple study plans.
 * A plan has subjects, each with topics.
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');

// Sub-schema for individual topics inside a subject
const TopicSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  status:    { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  notes:     { type: String, default: '' },
  completedAt: { type: Date },
});

// Sub-schema for subjects
const SubjectSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  topics:     [TopicSchema],
  testScores: [{ score: Number, date: { type: Date, default: Date.now } }],
  lastScore:  { type: Number, default: 0 },
});

const StudyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',       // References the User model
      required: true,
    },
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    examDate:    { type: Date },
    subjects:    [SubjectSchema],
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);

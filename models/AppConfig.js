const mongoose = require('mongoose');

const AppConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
    },
    subjects: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    topics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    notes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    tests: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    activityLog: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    settings: {
      failThreshold: { type: Number, default: 50 },
      revDays: { type: Number, default: 3 },
      maxStreak: { type: Number, default: 30 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AppConfig', AppConfigSchema);

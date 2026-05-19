const mongoose = require('mongoose');

const StudentStoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    study: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    activity: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    revisions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    manualEvents: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentStore', StudentStoreSchema);

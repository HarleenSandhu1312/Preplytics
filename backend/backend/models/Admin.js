/**
 * models/Admin.js
 * ─────────────────────────────────────────────
 * ADMIN MODEL (MongoDB / Mongoose)
 *
 * Admins have extra permissions.
 * Stores subjects and topics created by admin for students.
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  content:   { type: String, default: '' },
  filePath:  { type: String, default: '' },  // PDF upload path
  subject:   { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const AdminSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Subjects the admin has created for the platform
    subjects: [
      {
        name:    { type: String, required: true },
        topics:  [{ name: String, description: String }],
        notes:   [NoteSchema],
      }
    ],
    announcements: [
      {
        title:    String,
        message:  String,
        postedAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', AdminSchema);

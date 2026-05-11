/**
 * middleware/upload.js
 * ─────────────────────────────────────────────
 * FILE UPLOAD MIDDLEWARE (Multer)
 *
 * Multer handles multipart/form-data (file uploads).
 * Files are stored in /uploads folder.
 * ─────────────────────────────────────────────
 */

const multer = require('multer');
const path   = require('path');

// ─── Storage Config ───────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');   // Save to /uploads directory
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const uniqueName = `${req.user?._id || 'anon'}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ─── File Filter ──────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = /pdf|jpg|jpeg|png/;
  const isAllowed = allowed.test(path.extname(file.originalname).toLowerCase())
                 && allowed.test(file.mimetype);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;

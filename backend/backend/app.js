/**
 * app.js — Express app setup
 * Clean, minimal: JWT auth only, no Passport, no sessions, no PostgreSQL.
 */

require('dotenv').config();
const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const morgan       = require('morgan');

const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ── CORS ──────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Body parsers ──────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Cookie parser ─────────────────────────────
app.use(cookieParser());

// ── Static files ──────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Logger ────────────────────────────────────
app.use(morgan('dev'));

// ── Routes ────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/plans',    require('./routes/studyPlanRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));
app.use('/api/store',    require('./routes/storeRoutes'));
app.use('/api/announcements', require('./routes/postgresAnnouncementRoutes'));

// ── Health check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', app: 'Preplytics API', time: new Date() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Preplytics API is running' });
});

// ── Error handling (must be last) ─────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;

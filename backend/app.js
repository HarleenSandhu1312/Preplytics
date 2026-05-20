/**
 * app.js — Express app setup
 * Deployment Ready Version
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Static Files
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// Logger
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/plans', require('./routes/studyPlanRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/store', require('./routes/storeRoutes'));
app.use(
  '/api/announcements',
  require('./routes/postgresAnnouncementRoutes')
);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'Preplytics API',
    environment: process.env.NODE_ENV,
    time: new Date()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Preplytics API is running'
  });
});

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
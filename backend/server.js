/**
 * server.js — Entry point
 * MongoDB + Express + Deployment Ready
 */

require('dotenv').config();

const http = require('http');

const app = require('./app');
const connectMongo = require('./config/db');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Start Server
const startServer = async () => {
  try {
    // MongoDB Connection
    await connectMongo();

    // Start Express Server
    server.listen(PORT, () => {
      console.log('');
      console.log('┌──────────────────────────────────────────┐');
      console.log('│        PREPLYTICS BACKEND STARTED       │');
      console.log('├──────────────────────────────────────────┤');
      console.log(`│  Port: ${PORT}`);
      console.log(`│  Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`│  API: http://localhost:${PORT}/api`);
      console.log('└──────────────────────────────────────────┘');
      console.log('');
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION:', err.message);

  server.close(() => {
    process.exit(1);
  });
});
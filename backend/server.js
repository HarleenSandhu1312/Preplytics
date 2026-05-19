/**
 * server.js — Entry point
 * Connects to MongoDB, starts Express server.
 * PostgreSQL and Socket.io removed for simplicity.
 */

require('dotenv').config();
const http = require('http');

const app  = require('./app');
const { connectMongo } = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectMongo();

    server.listen(PORT, () => {
      console.log('');
      console.log('┌──────────────────────────────────────────┐');
      console.log('│        PREPLYTICS BACKEND STARTED         │');
      console.log('├──────────────────────────────────────────┤');
      console.log(`│  Port:  ${PORT}                               │`);
      console.log(`│  Mode:  ${process.env.NODE_ENV || 'development'}                    │`);
      console.log(`│  API:   http://localhost:${PORT}/api          │`);
      console.log('└──────────────────────────────────────────┘');
      console.log('');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  server.close(() => process.exit(1));
});

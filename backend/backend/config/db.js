/**
 * config/db.js
 * MongoDB-only connection (PostgreSQL removed)
 */

const mongoose = require('mongoose');

const connectMongo = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  MongoDB connected: ' + conn.connection.host);
  } catch (err) {
    console.error('❌  MongoDB connection failed: ' + err.message);
    process.exit(1);
  }
};

module.exports = { connectMongo };

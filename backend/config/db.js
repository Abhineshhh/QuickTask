const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the MONGODB_URI environment variable.
 * Mongoose manages its own connection pool internally, so this
 * function is safe to call multiple times — it will only connect once.
 */
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;

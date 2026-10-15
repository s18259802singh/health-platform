// This file connects our backend to MongoDB using Mongoose.
// Mongoose is a library that makes it easy to talk to MongoDB from Node.js.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // stop the server if the database is not reachable
  }
};

module.exports = connectDB;

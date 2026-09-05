const mongoose = require('mongoose');

async function connectDB() {
  // MONGODB_URI is supported as a conventional alternative, while MONGO_URI
  // keeps existing local installations working.
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MongoDB is not configured. Set MONGODB_URI (or MONGO_URI) to your MongoDB Atlas connection string.');
  }

  // Render does not run a MongoDB server on localhost. Catch this common
  // deployment mistake early with an actionable error instead of ECONNREFUSED.
  const isLocalMongo = /^(mongodb:\/\/)?(localhost|127\.0\.0\.1|::1)(?::\d+)?(?:\/|$)/i.test(uri);
  if (process.env.NODE_ENV === 'production' && isLocalMongo) {
    throw new Error('MONGODB_URI points to localhost. On Render, set it to a MongoDB Atlas mongodb+srv:// connection string.');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
  });
  console.log('MongoDB connected');
}

module.exports = connectDB;

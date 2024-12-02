import mongoose from 'mongoose';

// Extend the global interface to include a mongoose property
declare global {
  var mongoose: any;
}

// Check if there is an existing global mongoose connection
let cached = global.mongoose;

// If not, create a new one
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to the MongoDB database using Mongoose.
 * Utilizes a cached connection to prevent multiple connections in serverless environments.
 *
 * @returns {Promise<typeof mongoose>} - The Mongoose connection instance.
 */
async function dbConnect(): Promise<typeof mongoose> {
  // Retrieve the MongoDB connection string from environment variables
  const MONGODB_URI = process.env.MONGODB_URI;

  // Throw an error if the connection string is not defined
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local',
    );
  }

  // If a connection is already established, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If there is no existing promise for a connection, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering; commands will fail immediately if the connection is not established
    };

    // Create a new promise to connect to MongoDB
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // Wait for the connection promise to resolve and cache the connection
    cached.conn = await cached.promise;
  } catch (error) {
    // If the connection fails, reset the promise cache and rethrow the error
    cached.promise = null;
    throw error;
  }

  // Return the cached connection
  return cached.conn;
}

export default dbConnect;
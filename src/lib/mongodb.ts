import mongoose, { type Mongoose as MongooseInstance } from 'mongoose';

// Define the shape of the cached object and attach it to the global scope
// to persist across hot-reloads in development.
interface MongooseCache {
  conn: MongooseInstance | null;
  promise: Promise<MongooseInstance> | null;
}

// Extend the NodeJS Global type with our Mongoose cache property
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
      'Por favor, defina a variável de ambiente MONGODB_URI dentro de .env'
  );
}

// Type assertion since we've already checked for undefined above
const mongoUri: string = MONGODB_URI;

// Initialize the cache if it doesn't exist on the global object.
let cached: MongooseCache = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * A robust function to connect to MongoDB.
 * It handles caching the connection and promise to avoid creating multiple connections
 * in serverless environments. It also checks for stale connections.
 */
async function connectDB(): Promise<MongooseInstance> {
  // If a cached connection exists, check its status.
  if (cached.conn) {
    // A readyState of 1 means the connection is open and active.
    if (mongoose.connection.readyState === 1) {
      // console.log("Using cached MongoDB connection.");
      return cached.conn;
    }

    // If the readyState is not 'connected', the connection is stale.
    // Discard the cache to force a new connection.
    console.warn("Stale MongoDB connection detected. Reconnecting...");
    cached.conn = null;
    cached.promise = null;
  }

  // If no connection promise is cached, create one.
  if (!cached.promise) {
    const opts = {
      dbName: 'doc_flow',
      bufferCommands: false, // Recommended for performance in serverless.
    };

    // console.log("Creating new MongoDB connection promise.");
    cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
      // console.log("MongoDB connection successful.");
      return mongooseInstance;
    });
  }

  try {
    // Await the connection promise. This will either resolve with the new
    // connection or throw an error if the connection fails.
    cached.conn = await cached.promise;
  } catch (e) {
    // If the connection fails, clear the promise cache and re-throw the error.
    cached.promise = null;
    console.error("Error connecting to MongoDB:", e);
    throw new Error('Failed to connect to the database.');
  }

  // Return the active connection.
  return cached.conn;
}

export default connectDB;

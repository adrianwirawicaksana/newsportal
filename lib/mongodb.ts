import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

mongoose.set("strictQuery", true);

let cached = (
  global as typeof globalThis & {
    mongoose?: {
      conn?: typeof mongoose | null;
      promise?: Promise<typeof mongoose> | null;
    };
  }
).mongoose;

if (!cached) {
  cached = (
    global as typeof globalThis & {
      mongoose?: {
        conn?: typeof mongoose | null;
        promise?: Promise<typeof mongoose> | null;
      };
    }
  ).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "newsportal",
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      maxPoolSize: 10,
      bufferCommands: false,
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export default connectToDatabase;

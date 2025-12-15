import mongoose from "mongoose";

const { MONGO_URI } = process.env;

/**
 * Establish a connection to MongoDB using mongoose.
 */
export const connectMongo = async (): Promise<typeof mongoose> => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  mongoose.set("strictQuery", false);

  const connection = await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");
  return connection;
};

/**
 * Close the active MongoDB connection.
 */
export const disconnectMongo = async (): Promise<void> => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed");
};

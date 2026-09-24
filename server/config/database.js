import loadTenantPlugin from "./tenantPluginLoader.js";

loadTenantPlugin();

import mongoose from "mongoose";
import env from "./env.js";

const requestedServerSelectionTimeout = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS);
const serverSelectionTimeoutMS = Number.isFinite(requestedServerSelectionTimeout) && requestedServerSelectionTimeout > 0
  ? Math.min(15_000, Math.max(1_000, requestedServerSelectionTimeout))
  : 10_000;

const connectDatabase = async () => {
  try {
    if (!env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured.");
    }

    const connection = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS,
      connectTimeoutMS: Math.min(serverSelectionTimeoutMS, 10_000),
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      retryReads: true,
      retryWrites: true,
    });

    console.log(`MongoDB connected: ${connection.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.name || "Error", error.code || "");
    throw error;
  }
};

export default connectDatabase;

import loadTenantPlugin from "./tenantPluginLoader.js";

loadTenantPlugin();

import mongoose from "mongoose";
import env from "./env.js";

const connectDatabase = async () => {
  try {
    if (!env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured.");
    }

    const connection = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      retryReads: true,
      retryWrites: true,
    });

    console.log(`MongoDB connected: ${connection.connection.name}`);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDatabase;

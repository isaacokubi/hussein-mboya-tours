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
      serverSelectionTimeoutMS: 5000,
    });

    // debug removed
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDatabase;

import loadTenantPlugin from "./tenantPluginLoader.js";

loadTenantPlugin();

import mongoose from "mongoose";
import env from "./env.js";
import { assertSupportedMongoVersion } from "../utils/mongodbVersion.js";

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

    const buildInfo = await connection.connection.db.admin().command({ buildInfo: 1 });
    assertSupportedMongoVersion(buildInfo.version);

    console.log(`MongoDB connected: ${connection.connection.name}`);
  } catch (error) {
    if (error?.code === "UNSUPPORTED_MONGODB_VERSION") console.error(error.message);
    else console.error("MongoDB connection failed:", error.name || "Error", error.code || "");
    throw error;
  }
};

export default connectDatabase;

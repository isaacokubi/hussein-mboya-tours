/**
 * Purpose: database configuration module. Main declarations: connectDatabase.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import loadTenantPlugin from "./tenantPluginLoader.js";

// Perform the side effect or state update expressed on the following line.
loadTenantPlugin();

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ./env.js so this module can use its exported dependencies.
import env from "./env.js";
// Load ../utils/mongodbVersion.js so this module can use its exported dependencies.
import { assertSupportedMongoVersion } from "../utils/mongodbVersion.js";

// Declare requestedServerSelectionTimeout for use by the surrounding module or function.
const requestedServerSelectionTimeout = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS);
// Declare serverSelectionTimeoutMS for use by the surrounding module or function.
const serverSelectionTimeoutMS = Number.isFinite(requestedServerSelectionTimeout) && requestedServerSelectionTimeout > 0
  ? Math.min(15_000, Math.max(1_000, requestedServerSelectionTimeout))
  : 10_000;

// Declare connectDatabase for use by the surrounding module or function.
const connectDatabase = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!env.MONGODB_URI) and run the matching branch.
    if (!env.MONGODB_URI) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("MONGODB_URI is not configured.");
    }

    // Declare connection for use by the surrounding module or function.
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

    // Declare buildInfo for use by the surrounding module or function.
    const buildInfo = await connection.connection.db.admin().command({ buildInfo: 1 });
    // Perform the side effect or state update expressed on the following line.
    assertSupportedMongoVersion(buildInfo.version);

    // Perform the side effect or state update expressed on the following line.
    console.log(`MongoDB connected: ${connection.connection.name}`);
  } catch (error) {
    // Check the condition (error?.code === "UNSUPPORTED_MONGODB_VERSION") and run the matching branch.
    if (error?.code === "UNSUPPORTED_MONGODB_VERSION") console.error(error.message);
    else console.error("MongoDB connection failed:", error.name || "Error", error.code || "");
    // Stop the current operation by raising the value of error.
    throw error;
  }
};

export default connectDatabase;

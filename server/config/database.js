// Load tenant-specific model behavior before Mongoose models are initialized.
import loadTenantPlugin from "./tenantPluginLoader.js";

// Register the tenant plugin once so tenant-owned queries receive the expected protections.
loadTenantPlugin();

// Import the MongoDB object-document mapper used by the application.
import mongoose from "mongoose";
// Read validated connection settings from the central configuration module.
import env from "./env.js";
// Reject database server versions that the application does not support.
import { assertSupportedMongoVersion } from "../utils/mongodbVersion.js";

// Read an optional connection timeout supplied by the deployment environment.
const requestedServerSelectionTimeout = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS);
// Clamp valid timeouts between 1 and 15 seconds; use 10 seconds when unset/invalid.
const serverSelectionTimeoutMS = Number.isFinite(requestedServerSelectionTimeout) && requestedServerSelectionTimeout > 0
  ? Math.min(15_000, Math.max(1_000, requestedServerSelectionTimeout))
  : 10_000;

// Connect to MongoDB and verify that the server version is supported.
const connectDatabase = async () => {
  try {
    // Do not attempt a network connection when the database URI is missing.
    if (!env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured.");
    }

    // Open the Mongoose connection with bounded pooling and retry-friendly settings.
    const connection = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10, // Limit concurrent pooled connections per application process.
      minPoolSize: 1, // Keep one connection available after the pool has been established.
      serverSelectionTimeoutMS, // Bound how long MongoDB server discovery can take.
      connectTimeoutMS: Math.min(serverSelectionTimeoutMS, 10_000), // Bound the initial socket connection attempt.
      socketTimeoutMS: 45000, // Close sockets whose operations remain inactive too long.
      heartbeatFrequencyMS: 10000, // Check server availability periodically.
      retryReads: true, // Let the driver retry operations that are safe to retry.
      retryWrites: true, // Let the driver retry supported writes when safe.
    });

    // Ask the connected server for its build metadata rather than guessing its version.
    const buildInfo = await connection.connection.db.admin().command({ buildInfo: 1 });
    // Fail startup if this server version is outside the application's supported range.
    assertSupportedMongoVersion(buildInfo.version);

    // Log the database name only; do not print the connection URI or credentials.
    console.log(`MongoDB connected: ${connection.connection.name}`);
  } catch (error) {
    // Provide a specific message for unsupported versions to help the operator fix configuration.
    if (error?.code === "UNSUPPORTED_MONGODB_VERSION") console.error(error.message);
    // Log only the error type and code for other failures to avoid leaking connection secrets.
    else console.error("MongoDB connection failed:", error.name || "Error", error.code || "");
    // Propagate the error so startup logic can keep the service unready or terminate safely.
    throw error;
  }
};

// Export the connection function for the server startup sequence and tests.
export default connectDatabase;

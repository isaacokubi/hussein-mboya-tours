export const PRODUCTION_DATABASE_NAME = "husseindb";

/**
 * Validate the production database target without logging the URI. MongoDB
 * connection strings may use either mongodb:// or mongodb+srv://; URL handles
 * both schemes and preserves query options such as retryWrites and tls.
 */
export function validateProductionMongoUri(uri) {
  if (typeof uri !== "string" || !uri.trim()) {
    throw new Error("MONGODB_URI is required in production.");
  }

  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error("Production MONGODB_URI must be a valid MongoDB connection string.");
  }

  if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) {
    throw new Error("Production MONGODB_URI must use mongodb:// or mongodb+srv://.");
  }

  let databaseName;
  try {
    databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    throw new Error("Production MONGODB_URI must contain a valid database name.");
  }

  if (databaseName !== PRODUCTION_DATABASE_NAME) {
    throw new Error(`Production MONGODB_URI must explicitly target the ${PRODUCTION_DATABASE_NAME} database.`);
  }

  return true;
}

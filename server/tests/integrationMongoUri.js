/**
 * Database integration tests must use their dedicated URI. In particular,
 * never reuse production MONGODB_URI or connect to the production database.
 */
export function getDisposableIntegrationMongoUri(environment = process.env) {
  const rawUri = environment.LIFECYCLE_TEST_MONGODB_URI;
  if (!rawUri) return null;

  let uri;
  try {
    uri = new URL(rawUri);
  } catch {
    throw new Error("LIFECYCLE_TEST_MONGODB_URI must be a valid MongoDB connection string.");
  }
  if (!["mongodb:", "mongodb+srv:"].includes(uri.protocol)) {
    throw new Error("LIFECYCLE_TEST_MONGODB_URI must use mongodb:// or mongodb+srv://.");
  }
  let databaseName;
  try {
    databaseName = decodeURIComponent(uri.pathname.replace(/^\//, ""));
  } catch {
    throw new Error("LIFECYCLE_TEST_MONGODB_URI must name a disposable test database.");
  }
  if (!databaseName || databaseName === "husseindb") {
    throw new Error("LIFECYCLE_TEST_MONGODB_URI must name a disposable test database, never husseindb.");
  }
  return rawUri;
}

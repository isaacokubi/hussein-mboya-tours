/**
 * Purpose: integration Mongo Uri automated test. Main declarations: getDisposableIntegrationMongoUri.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
/**
 * Database integration tests must use their dedicated URI. In particular,
 * never reuse production MONGODB_URI or connect to the production database.
 */
// Define getDisposableIntegrationMongoUri; its parameters and body implement this operation.
export function getDisposableIntegrationMongoUri(environment = process.env) {
  // Declare rawUri for use by the surrounding module or function.
  const rawUri = environment.LIFECYCLE_TEST_MONGODB_URI;
  // Check the condition (!rawUri) and run the matching branch.
  if (!rawUri) return null;

  // Declare uri for use by the surrounding module or function.
  let uri;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    uri = new URL(rawUri);
  } catch {
    // Stop the current operation by raising a new Error instance.
    throw new Error("LIFECYCLE_TEST_MONGODB_URI must be a valid MongoDB connection string.");
  }
  // Check the condition (!["mongodb:", "mongodb+srv:"].includes(uri.protocol)) and run the matching branch.
  if (!["mongodb:", "mongodb+srv:"].includes(uri.protocol)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("LIFECYCLE_TEST_MONGODB_URI must use mongodb:// or mongodb+srv://.");
  }
  // Declare databaseName for use by the surrounding module or function.
  let databaseName;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    databaseName = decodeURIComponent(uri.pathname.replace(/^\//, ""));
  } catch {
    // Stop the current operation by raising a new Error instance.
    throw new Error("LIFECYCLE_TEST_MONGODB_URI must name a disposable test database.");
  }
  // Check the condition (!databaseName) and run the matching branch.
  if (!databaseName) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("LIFECYCLE_TEST_MONGODB_URI must name a disposable test database.");
  }
  // Check the condition (databaseName.toLowerCase() === "husseindb" && environment.ALLOW_HUSSEI) and run the matching branch.
  if (databaseName.toLowerCase() === "husseindb" && environment.ALLOW_HUSSEINDB_TEST_DATABASE !== "true") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Using husseindb for lifecycle tests requires ALLOW_HUSSEINDB_TEST_DATABASE=true.");
  }
  // Declare explicitlyAuthorizedHusseindb for use by the surrounding module or function.
  const explicitlyAuthorizedHusseindb = databaseName.toLowerCase() === "husseindb"
    && environment.ALLOW_HUSSEINDB_TEST_DATABASE === "true";
  // Check the condition (!explicitlyAuthorizedHusseindb && !/(?:^|[_-])(test|testing|disposable) and run the matching branch.
  if (!explicitlyAuthorizedHusseindb && !/(?:^|[_-])(test|testing|disposable|integration|lifecycle)(?:[_-]|$)/i.test(databaseName)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("LIFECYCLE_TEST_MONGODB_URI database name must clearly identify a disposable test database.");
  }
  // Return the value of rawUri to the caller.
  return rawUri;
}

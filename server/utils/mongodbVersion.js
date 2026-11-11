/**
 * Purpose: mongodb Version server application module. Main declarations: assertSupportedMongoVersion.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// Mongoose 8's supported server compatibility includes MongoDB 4.2, which
// also supports the replica-set transactions used by tenant provisioning.
// CI deliberately targets MongoDB 8, but that is not an application minimum.
// Declare MINIMUM_MONGODB_VERSION for use by the surrounding module or function.
export const MINIMUM_MONGODB_VERSION = "4.2.0";

// Define assertSupportedMongoVersion; its parameters and body implement this operation.
export function assertSupportedMongoVersion(version) {
  // Declare match for use by the surrounding module or function.
  const match = String(version || "").match(/^(\d+)\.(\d+)\.(\d+)/);
  // Check the condition (!match) and run the matching branch.
  if (!match) {
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(new Error(`MongoDB ${MINIMUM_MONGODB_VERSION} or later is required; server version could not be identified.`), {
      code: "UNSUPPORTED_MONGODB_VERSION",
    });
  }
  // Declare [major, minor, patch] for use by the surrounding module or function.
  const [major, minor, patch] = match.slice(1).map(Number);
  // Check the condition (major < 4 || (major === 4 && minor < 2)) and run the matching branch.
  if (major < 4 || (major === 4 && minor < 2)) {
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(new Error(`MongoDB ${MINIMUM_MONGODB_VERSION} or later is required; connected server reports ${major}.${minor}.${patch}.`), {
      code: "UNSUPPORTED_MONGODB_VERSION",
    });
  }
  // Return the expression shown below to the caller.
  return true;
}

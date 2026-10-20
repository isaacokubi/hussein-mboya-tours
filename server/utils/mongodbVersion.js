// Mongoose 8 supports MongoDB 4.2 as the minimum server version for this application.
// That baseline also supports the replica-set transactions used during tenant provisioning.
// CI may test against MongoDB 8, but that is not the minimum required by production.
export const MINIMUM_MONGODB_VERSION = "4.2.0";

// Validate that a reported MongoDB version meets the application's minimum version.
export function assertSupportedMongoVersion(version) {
  // Capture the numeric major, minor and patch parts at the start of the version string.
  const match = String(version || "").match(/^(\d+)\.(\d+)\.(\d+)/);
  // Reject unknown or malformed version strings because compatibility cannot be established.
  if (!match) {
    // Attach a stable error code so monitoring and callers can identify this failure.
    throw Object.assign(new Error(`MongoDB ${MINIMUM_MONGODB_VERSION} or later is required; server version could not be identified.`), {
      code: "UNSUPPORTED_MONGODB_VERSION", // Identify the unsupported-version failure category.
    });
  }
  // Convert the captured version segments from strings into numbers for comparison.
  const [major, minor, patch] = match.slice(1).map(Number);
  // Reject all major versions below 4 and MongoDB 4 releases earlier than 4.2.
  if (major < 4 || (major === 4 && minor < 2)) {
    // Include the connected version in the error message to aid diagnostics.
    throw Object.assign(new Error(`MongoDB ${MINIMUM_MONGODB_VERSION} or later is required; connected server reports ${major}.${minor}.${patch}.`), {
      code: "UNSUPPORTED_MONGODB_VERSION", // Use the same machine-readable code for both failure paths.
    });
  }
  // Signal success when the supplied version is supported.
  return true;
}

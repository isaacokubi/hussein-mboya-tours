// Fix the only MongoDB database name permitted for production deployments.
export const PRODUCTION_DATABASE_NAME = "husseindb";
// Name the isolated database reserved for staging SuperAdmin bootstrap work.
export const STAGING_SUPERADMIN_DATABASE_NAME = "global_tours_test";

/** Validate the fixed database target permitted for the staging bootstrap. */
export function validateStagingSuperAdminBootstrapTarget({ nodeEnv, deploymentEnv, stagingDatabaseName, uri }) {
  // Refuse a staging bootstrap when both environment labels indicate production.
  if (nodeEnv === "production" && deploymentEnv === "production") {
    // Fail closed so staging setup cannot accidentally run against production.
    throw new Error("Staging SuperAdmin bootstrap refuses production deployment mode.");
  }
  // Require production runtime hardening even for a staging deployment.
  if (nodeEnv !== "production") {
    // Reject development/test runtime mode for this privileged bootstrap.
    throw new Error("Staging SuperAdmin bootstrap requires NODE_ENV=production.");
  }
  // Require the deployment label to explicitly identify staging.
  if (String(deploymentEnv || "").trim().toLowerCase() !== "staging") {
    // Stop when the operator has not selected the intended deployment environment.
    throw new Error("Staging SuperAdmin bootstrap requires DEPLOYMENT_ENV=staging.");
  }
  // Require the exact approved staging database name rather than an arbitrary target.
  if (String(stagingDatabaseName || "").trim() !== STAGING_SUPERADMIN_DATABASE_NAME) {
    // Explain the expected configuration without printing the potentially sensitive URI.
    throw new Error(`Staging SuperAdmin bootstrap requires STAGING_DATABASE_NAME=${STAGING_SUPERADMIN_DATABASE_NAME}.`);
  }
  // Validate the URI against the approved staging database before allowing bootstrap.
  return validateStagingMongoUri(uri, STAGING_SUPERADMIN_DATABASE_NAME);
}

// Extract and validate the database name from a MongoDB connection URI.
function getMongoDatabaseName(uri, environment) {
  // Reject missing or non-string connection settings before URL parsing.
  if (typeof uri !== "string" || !uri.trim()) {
    // Identify which deployment environment has the missing setting.
    throw new Error(`MONGODB_URI is required in ${environment}.`);
  }

  // Declare a variable that will hold the parsed URL object.
  let parsed;
  try {
    // Parse the connection URI so protocol and path can be validated safely.
    parsed = new URL(uri);
  } catch {
    // Convert malformed URL syntax into a configuration-specific error.
    throw new Error(`${environment} MONGODB_URI must be a valid MongoDB connection string.`);
  }

  // Accept only the standard MongoDB URI schemes.
  if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) {
    // Prevent accidentally supplying an HTTP URL or another unrelated protocol.
    throw new Error(`${environment} MONGODB_URI must use mongodb:// or mongodb+srv://.`);
  }

  // Declare the decoded database name extracted from the URI path.
  let databaseName;
  try {
    // Remove the leading slash and decode escaped characters in the database name.
    databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    // Reject malformed percent-encoding instead of guessing the intended name.
    throw new Error(`${environment} MONGODB_URI must contain a valid database name.`);
  }

  // Require the URI to name a database explicitly.
  if (!databaseName) {
    // Avoid connecting to an implicit/default database that may not be the intended target.
    throw new Error(`${environment} MONGODB_URI must explicitly name a database.`);
  }

  // Return the validated database name to the environment-specific checks.
  return databaseName;
}

/**
 * Validate the production database target without logging the URI. MongoDB
 * connection strings may use either mongodb:// or mongodb+srv://; URL handles
 * both schemes and preserves query options such as retryWrites and tls.
 */
export function validateProductionMongoUri(uri) {
  // Parse and validate the URI using the production-specific error context.
  const databaseName = getMongoDatabaseName(uri, "Production");

  // Reject any production URI that points at a database other than the approved one.
  if (databaseName !== PRODUCTION_DATABASE_NAME) {
    // Include only the database name requirement, never the credential-bearing URI.
    throw new Error(`Production MONGODB_URI must explicitly target the ${PRODUCTION_DATABASE_NAME} database.`);
  }

  // Signal that the production database target passed validation.
  return true;
}

/**
 * Validate the isolated staging database. The approved database name is
 * supplied at deployment time and may never be the production database.
 */
export function validateStagingMongoUri(uri, stagingDatabaseName) {
  // Normalize the configured staging database name for comparisons.
  const expectedDatabaseName = String(stagingDatabaseName || "").trim();
  // Refuse staging validation if no explicit staging database name was configured.
  if (!expectedDatabaseName) {
    // Tell deployment operators which environment setting is required.
    throw new Error("STAGING_DATABASE_NAME is required when DEPLOYMENT_ENV=staging.");
  }
  // Prevent the staging configuration from naming the production database as its target.
  if (expectedDatabaseName === PRODUCTION_DATABASE_NAME) {
    // Fail before parsing or opening a database connection.
    throw new Error("STAGING_DATABASE_NAME must not be the production database.");
  }

  // Parse the URI with staging-specific diagnostics.
  const databaseName = getMongoDatabaseName(uri, "Staging");
  // Independently reject a URI that points directly to the production database.
  if (databaseName === PRODUCTION_DATABASE_NAME) {
    // This second guard protects against a mismatch between URI and staging setting.
    throw new Error("Staging MONGODB_URI must never target the production database.");
  }
  // Require the URI database name to match the approved staging setting exactly.
  if (databaseName !== expectedDatabaseName) {
    // Prevent a staging deployment from silently using some other database.
    throw new Error("Staging MONGODB_URI must target the database named by STAGING_DATABASE_NAME.");
  }

  // Signal that the staging database target passed all safety checks.
  return true;
}

/** Keep production hardening active for staging by requiring NODE_ENV=production. */
export function validateDeploymentMongoUri({ nodeEnv, deploymentEnv, uri, stagingDatabaseName }) {
  // Reject the unsupported NODE_ENV=staging combination to avoid ambiguous configuration.
  if (nodeEnv === "staging") {
    // Explain the supported pattern: production security settings plus a staging deployment label.
    throw new Error("NODE_ENV=staging is unsupported; use NODE_ENV=production with DEPLOYMENT_ENV=staging.");
  }

  // Route staging deployments through the isolated-database validation.
  if (deploymentEnv === "staging") {
    // Staging must retain production security defaults and hardening.
    if (nodeEnv !== "production") {
      // Stop rather than allow staging to run with development settings.
      throw new Error("Staging requires NODE_ENV=production to retain production security settings.");
    }
    // Validate the staging URI and ensure it cannot target the production database.
    return validateStagingMongoUri(uri, stagingDatabaseName);
  }

  // Route production deployments through the strict production database validation.
  if (nodeEnv === "production") {
    // Accept only a recognized deployment label in production runtime mode.
    if (deploymentEnv !== "production") {
      // Reject missing or unexpected labels before database connection.
      throw new Error("DEPLOYMENT_ENV must be production or staging.");
    }
    // Validate that production explicitly targets the fixed production database.
    return validateProductionMongoUri(uri);
  }

  // Non-production local/test modes return false because production URI enforcement is not active.
  return false;
}

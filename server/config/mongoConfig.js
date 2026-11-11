/**
 * Purpose: mongo Config configuration module. Main declarations: validateStagingSuperAdminBootstrapTarget, getMongoDatabaseName, validateProductionMongoUri, validateStagingMongoUri, validateDeploymentMongoUri.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export const PRODUCTION_DATABASE_NAME = "husseindb";
// Declare STAGING_SUPERADMIN_DATABASE_NAME for use by the surrounding module or function.
export const STAGING_SUPERADMIN_DATABASE_NAME = "global_tours_test";

/** Validate the fixed database target permitted for the staging bootstrap. */
// Define validateStagingSuperAdminBootstrapTarget; its parameters and body implement this operation.
export function validateStagingSuperAdminBootstrapTarget({ nodeEnv, deploymentEnv, stagingDatabaseName, uri }) {
  // Check the condition (nodeEnv === "production" && deploymentEnv === "production") and run the matching branch.
  if (nodeEnv === "production" && deploymentEnv === "production") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Staging SuperAdmin bootstrap refuses production deployment mode.");
  }
  // Check the condition (nodeEnv !== "production") and run the matching branch.
  if (nodeEnv !== "production") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Staging SuperAdmin bootstrap requires NODE_ENV=production.");
  }
  // Check the condition (String(deploymentEnv || "").trim().toLowerCase() !== "staging") and run the matching branch.
  if (String(deploymentEnv || "").trim().toLowerCase() !== "staging") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Staging SuperAdmin bootstrap requires DEPLOYMENT_ENV=staging.");
  }
  // Check the condition (String(stagingDatabaseName || "").trim() !== STAGING_SUPERADMIN_DATABA) and run the matching branch.
  if (String(stagingDatabaseName || "").trim() !== STAGING_SUPERADMIN_DATABASE_NAME) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`Staging SuperAdmin bootstrap requires STAGING_DATABASE_NAME=${STAGING_SUPERADMIN_DATABASE_NAME}.`);
  }
  // Return the result of validateStagingMongoUri() to the caller.
  return validateStagingMongoUri(uri, STAGING_SUPERADMIN_DATABASE_NAME);
}

// Define getMongoDatabaseName; its parameters and body implement this operation.
function getMongoDatabaseName(uri, environment) {
  // Check the condition (typeof uri !== "string" || !uri.trim()) and run the matching branch.
  if (typeof uri !== "string" || !uri.trim()) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`MONGODB_URI is required in ${environment}.`);
  }

  // Declare parsed for use by the surrounding module or function.
  let parsed;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    parsed = new URL(uri);
  } catch {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`${environment} MONGODB_URI must be a valid MongoDB connection string.`);
  }

  // Check the condition (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) and run the matching branch.
  if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`${environment} MONGODB_URI must use mongodb:// or mongodb+srv://.`);
  }

  // Declare databaseName for use by the surrounding module or function.
  let databaseName;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`${environment} MONGODB_URI must contain a valid database name.`);
  }

  // Check the condition (!databaseName) and run the matching branch.
  if (!databaseName) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`${environment} MONGODB_URI must explicitly name a database.`);
  }

  // Return the value of databaseName to the caller.
  return databaseName;
}

/**
 * Validate the production database target without logging the URI. MongoDB
 * connection strings may use either mongodb:// or mongodb+srv://; URL handles
 * both schemes and preserves query options such as retryWrites and tls.
 */
// Define validateProductionMongoUri; its parameters and body implement this operation.
export function validateProductionMongoUri(uri) {
  // Declare databaseName for use by the surrounding module or function.
  const databaseName = getMongoDatabaseName(uri, "Production");

  // Check the condition (databaseName !== PRODUCTION_DATABASE_NAME) and run the matching branch.
  if (databaseName !== PRODUCTION_DATABASE_NAME) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`Production MONGODB_URI must explicitly target the ${PRODUCTION_DATABASE_NAME} database.`);
  }

  // Return the expression shown below to the caller.
  return true;
}

/**
 * Validate the isolated staging database. The approved database name is
 * supplied at deployment time and may never be the production database.
 */
// Define validateStagingMongoUri; its parameters and body implement this operation.
export function validateStagingMongoUri(uri, stagingDatabaseName) {
  // Declare expectedDatabaseName for use by the surrounding module or function.
  const expectedDatabaseName = String(stagingDatabaseName || "").trim();
  // Check the condition (!expectedDatabaseName) and run the matching branch.
  if (!expectedDatabaseName) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("STAGING_DATABASE_NAME is required when DEPLOYMENT_ENV=staging.");
  }
  // Check the condition (expectedDatabaseName === PRODUCTION_DATABASE_NAME) and run the matching branch.
  if (expectedDatabaseName === PRODUCTION_DATABASE_NAME) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("STAGING_DATABASE_NAME must not be the production database.");
  }

  // Declare databaseName for use by the surrounding module or function.
  const databaseName = getMongoDatabaseName(uri, "Staging");
  // Check the condition (databaseName === PRODUCTION_DATABASE_NAME) and run the matching branch.
  if (databaseName === PRODUCTION_DATABASE_NAME) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Staging MONGODB_URI must never target the production database.");
  }
  // Check the condition (databaseName !== expectedDatabaseName) and run the matching branch.
  if (databaseName !== expectedDatabaseName) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Staging MONGODB_URI must target the database named by STAGING_DATABASE_NAME.");
  }

  // Return the expression shown below to the caller.
  return true;
}

/** Keep production hardening active for staging by requiring NODE_ENV=production. */
// Define validateDeploymentMongoUri; its parameters and body implement this operation.
export function validateDeploymentMongoUri({ nodeEnv, deploymentEnv, uri, stagingDatabaseName }) {
  // Check the condition (nodeEnv === "staging") and run the matching branch.
  if (nodeEnv === "staging") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("NODE_ENV=staging is unsupported; use NODE_ENV=production with DEPLOYMENT_ENV=staging.");
  }

  // Check the condition (deploymentEnv === "staging") and run the matching branch.
  if (deploymentEnv === "staging") {
    // Check the condition (nodeEnv !== "production") and run the matching branch.
    if (nodeEnv !== "production") {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Staging requires NODE_ENV=production to retain production security settings.");
    }
    // Return the result of validateStagingMongoUri() to the caller.
    return validateStagingMongoUri(uri, stagingDatabaseName);
  }

  // Check the condition (nodeEnv === "production") and run the matching branch.
  if (nodeEnv === "production") {
    // Check the condition (deploymentEnv !== "production") and run the matching branch.
    if (deploymentEnv !== "production") {
      // Stop the current operation by raising a new Error instance.
      throw new Error("DEPLOYMENT_ENV must be production or staging.");
    }
    // Return the result of validateProductionMongoUri() to the caller.
    return validateProductionMongoUri(uri);
  }

  // Return the expression shown below to the caller.
  return false;
}

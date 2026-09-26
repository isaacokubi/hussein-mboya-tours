export const PRODUCTION_DATABASE_NAME = "husseindb";

function getMongoDatabaseName(uri, environment) {
  if (typeof uri !== "string" || !uri.trim()) {
    throw new Error(`MONGODB_URI is required in ${environment}.`);
  }

  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error(`${environment} MONGODB_URI must be a valid MongoDB connection string.`);
  }

  if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) {
    throw new Error(`${environment} MONGODB_URI must use mongodb:// or mongodb+srv://.`);
  }

  let databaseName;
  try {
    databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    throw new Error(`${environment} MONGODB_URI must contain a valid database name.`);
  }

  if (!databaseName) {
    throw new Error(`${environment} MONGODB_URI must explicitly name a database.`);
  }

  return databaseName;
}

/**
 * Validate the production database target without logging the URI. MongoDB
 * connection strings may use either mongodb:// or mongodb+srv://; URL handles
 * both schemes and preserves query options such as retryWrites and tls.
 */
export function validateProductionMongoUri(uri) {
  const databaseName = getMongoDatabaseName(uri, "Production");

  if (databaseName !== PRODUCTION_DATABASE_NAME) {
    throw new Error(`Production MONGODB_URI must explicitly target the ${PRODUCTION_DATABASE_NAME} database.`);
  }

  return true;
}

/**
 * Validate the isolated staging database. The approved database name is
 * supplied at deployment time and may never be the production database.
 */
export function validateStagingMongoUri(uri, stagingDatabaseName) {
  const expectedDatabaseName = String(stagingDatabaseName || "").trim();
  if (!expectedDatabaseName) {
    throw new Error("STAGING_DATABASE_NAME is required when DEPLOYMENT_ENV=staging.");
  }
  if (expectedDatabaseName === PRODUCTION_DATABASE_NAME) {
    throw new Error("STAGING_DATABASE_NAME must not be the production database.");
  }

  const databaseName = getMongoDatabaseName(uri, "Staging");
  if (databaseName === PRODUCTION_DATABASE_NAME) {
    throw new Error("Staging MONGODB_URI must never target the production database.");
  }
  if (databaseName !== expectedDatabaseName) {
    throw new Error("Staging MONGODB_URI must target the database named by STAGING_DATABASE_NAME.");
  }

  return true;
}

/** Keep production hardening active for staging by requiring NODE_ENV=production. */
export function validateDeploymentMongoUri({ nodeEnv, deploymentEnv, uri, stagingDatabaseName }) {
  if (nodeEnv === "staging") {
    throw new Error("NODE_ENV=staging is unsupported; use NODE_ENV=production with DEPLOYMENT_ENV=staging.");
  }

  if (deploymentEnv === "staging") {
    if (nodeEnv !== "production") {
      throw new Error("Staging requires NODE_ENV=production to retain production security settings.");
    }
    return validateStagingMongoUri(uri, stagingDatabaseName);
  }

  if (nodeEnv === "production") {
    if (deploymentEnv !== "production") {
      throw new Error("DEPLOYMENT_ENV must be production or staging.");
    }
    return validateProductionMongoUri(uri);
  }

  return false;
}

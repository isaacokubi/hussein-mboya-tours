# Source explanation: server/config/mongoConfig.js

**Source:** [server/config/mongoConfig.js](../../../server/config/mongoConfig.js)

## Purpose

Server configuration or provider initialization. Values and validation affect runtime startup or request behavior.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `validateStagingSuperAdminBootstrapTarget` — lines 5–19

Parameters: `{nodeEnv, deploymentEnv, stagingDatabaseName, uri}`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `if (nodeEnv === "production" && deploymentEnv === "production") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `throw new Error("Staging SuperAdmin bootstrap refuses production deployment mode.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 9:** `if (nodeEnv !== "production") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `throw new Error("Staging SuperAdmin bootstrap requires NODE_ENV=production.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 12:** `if (String(deploymentEnv || "").trim().toLowerCase() !== "staging") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `throw new Error("Staging SuperAdmin bootstrap requires DEPLOYMENT_ENV=staging.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 15:** `if (String(stagingDatabaseName || "").trim() !== STAGING_SUPERADMIN_DATABASE_NAME) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `throw new Error(\`Staging SuperAdmin bootstrap requires STAGING_DATABASE_NAME=${STAGING_SUPERADMIN_DATABASE_NAME}.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 18:** `return validateStagingMongoUri(uri, STAGING_SUPERADMIN_DATABASE_NAME);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getMongoDatabaseName` — lines 21–49

Parameters: `uri`, `environment`.
Error control: try=true, catch=false, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `if (typeof uri !== "string" || !uri.trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `throw new Error(\`MONGODB_URI is required in ${environment}.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 26:** `let parsed;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 30:** `throw new Error(\`${environment} MONGODB_URI must be a valid MongoDB connection string.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 33:** `if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `throw new Error(\`${environment} MONGODB_URI must use mongodb:// or mongodb+srv://.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 37:** `let databaseName;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 41:** `throw new Error(\`${environment} MONGODB_URI must contain a valid database name.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 44:** `if (!databaseName) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `throw new Error(\`${environment} MONGODB_URI must explicitly name a database.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 48:** `return databaseName;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateProductionMongoUri` — lines 56–64

Parameters: `uri`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 57:** `const databaseName = getMongoDatabaseName(uri, "Production");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `if (databaseName !== PRODUCTION_DATABASE_NAME) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `throw new Error(\`Production MONGODB_URI must explicitly target the ${PRODUCTION_DATABASE_NAME} database.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 63:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateStagingMongoUri` — lines 70–88

Parameters: `uri`, `stagingDatabaseName`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 71:** `const expectedDatabaseName = String(stagingDatabaseName || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `if (!expectedDatabaseName) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `throw new Error("STAGING_DATABASE_NAME is required when DEPLOYMENT_ENV=staging.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 75:** `if (expectedDatabaseName === PRODUCTION_DATABASE_NAME) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `throw new Error("STAGING_DATABASE_NAME must not be the production database.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 79:** `const databaseName = getMongoDatabaseName(uri, "Staging");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `if (databaseName === PRODUCTION_DATABASE_NAME) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `throw new Error("Staging MONGODB_URI must never target the production database.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 83:** `if (databaseName !== expectedDatabaseName) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `throw new Error("Staging MONGODB_URI must target the database named by STAGING_DATABASE_NAME.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 87:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateDeploymentMongoUri` — lines 91–111

Parameters: `{nodeEnv, deploymentEnv, uri, stagingDatabaseName}`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 92:** `if (nodeEnv === "staging") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `throw new Error("NODE_ENV=staging is unsupported; use NODE_ENV=production with DEPLOYMENT_ENV=staging.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 96:** `if (deploymentEnv === "staging") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `if (nodeEnv !== "production") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 98:** `throw new Error("Staging requires NODE_ENV=production to retain production security settings.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 100:** `return validateStagingMongoUri(uri, stagingDatabaseName);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 103:** `if (nodeEnv === "production") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `if (deploymentEnv !== "production") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `throw new Error("DEPLOYMENT_ENV must be production or staging.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 107:** `return validateProductionMongoUri(uri);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 110:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 1: `export const PRODUCTION_DATABASE_NAME = "husseindb";`.
- Line 2: `export const STAGING_SUPERADMIN_DATABASE_NAME = "global_tours_test";`.
- Line 5: `export function validateStagingSuperAdminBootstrapTarget({ nodeEnv, deploymentEnv, stagingDatabaseName, uri }) {`.
- Line 21: `function getMongoDatabaseName(uri, environment) {`.
- Line 26: `let parsed;`.
- Line 37: `let databaseName;`.
- Line 56: `export function validateProductionMongoUri(uri) {`.
- Line 57: `const databaseName = getMongoDatabaseName(uri, "Production");`.
- Line 70: `export function validateStagingMongoUri(uri, stagingDatabaseName) {`.
- Line 71: `const expectedDatabaseName = String(stagingDatabaseName || "").trim();`.
- Line 79: `const databaseName = getMongoDatabaseName(uri, "Staging");`.
- Line 91: `export function validateDeploymentMongoUri({ nodeEnv, deploymentEnv, uri, stagingDatabaseName }) {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

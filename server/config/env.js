/**
 * Purpose: env configuration module. Main declarations: truthy, hasStrongSecret.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import dotenv from "dotenv";
// Load path so this module can use its exported dependencies.
import path from "path";
// Load url so this module can use its exported dependencies.
import { fileURLToPath } from "url";
// Load ./mongoConfig.js so this module can use its exported dependencies.
import { validateDeploymentMongoUri } from "./mongoConfig.js";
// Load ./envValidation.js so this module can use its exported dependencies.
import { assertRequiredEnvironment } from "./envValidation.js";
// Load ./corsPolicy.js so this module can use its exported dependencies.
import { getConfiguredOrigins, isValidConfiguredOrigin } from "./corsPolicy.js";

// Declare __filename for use by the surrounding module or function.
const __filename = fileURLToPath(import.meta.url);
// Declare __dirname for use by the surrounding module or function.
const __dirname = path.dirname(__filename);

// Perform the side effect or state update expressed on the following line.
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// Perform the side effect or state update expressed on the following line.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Perform the side effect or state update expressed on the following line.
assertRequiredEnvironment(process.env);

// Declare nodeEnv for use by the surrounding module or function.
const nodeEnv = process.env.NODE_ENV || "development";
// Declare isProduction for use by the surrounding module or function.
const isProduction = nodeEnv === "production";
// Declare deploymentEnv for use by the surrounding module or function.
const deploymentEnv = String(process.env.DEPLOYMENT_ENV || "production").trim().toLowerCase();
// Declare truthy for use by the surrounding module or function.
const truthy = (value) => String(value || "").toLowerCase() === "true";
// Declare hasStrongSecret for use by the surrounding module or function.
const hasStrongSecret = (value) => {
  // Declare secret for use by the surrounding module or function.
  const secret = String(value || "");
  // Return the expression shown below to the caller.
  return secret.length >= 32 && /[a-z]/.test(secret) && /[A-Z]/.test(secret) && /\d/.test(secret);
};

// Perform the side effect or state update expressed on the following line.
validateDeploymentMongoUri({
  nodeEnv,
  deploymentEnv,
  uri: process.env.MONGODB_URI,
  stagingDatabaseName: process.env.STAGING_DATABASE_NAME,
});

// Check the condition (isProduction) and run the matching branch.
if (isProduction) {
  // Check the condition (!hasStrongSecret(process.env.JWT_SECRET)) and run the matching branch.
  if (!hasStrongSecret(process.env.JWT_SECRET)) throw new Error("Production JWT_SECRET must be at least 32 characters and contain upper-case, lower-case, and numeric characters.");
  // Repeat the enclosed work for each required iteration.
  for (const key of ["PAYMENT_CREDENTIAL_ENCRYPTION_KEY", "WEBHOOK_SECRET_KEY"]) {
    // Check the condition (!hasStrongSecret(process.env[key])) and run the matching branch.
    if (!hasStrongSecret(process.env[key])) throw new Error(`Production ${key} must be at least 32 characters and contain upper-case, lower-case, and numeric characters.`);
  }
  // Check the condition ((process.env.ETIMS_ADAPTER_URL || process.env.ETIMS_ADAPTER_TOKEN) && ) and run the matching branch.
  if ((process.env.ETIMS_ADAPTER_URL || process.env.ETIMS_ADAPTER_TOKEN) && !hasStrongSecret(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("ETIMS_CREDENTIAL_ENCRYPTION_KEY must be configured with at least 32 mixed-case and numeric characters when eTIMS is enabled.");
  }
  // Repeat the enclosed work for each required iteration.
  for (const key of ["ALLOW_SINGLE_TENANT_DEV_FALLBACK", "ALLOW_GLOBAL_MPESA_FALLBACK", "MFA_DEV_MODE"]) {
    // Check the condition (truthy(process.env[key])) and run the matching branch.
    if (truthy(process.env[key])) throw new Error(`${key}=true is forbidden in production.`);
  }

  // Declare origins for use by the surrounding module or function.
  const origins = getConfiguredOrigins(process.env);
  // Check the condition (!origins.length || origins.some((origin) => !isValidConfiguredOrigin(o) and run the matching branch.
  if (!origins.length || origins.some((origin) => !isValidConfiguredOrigin(origin, { production: true }))) throw new Error("Production CLIENT_ORIGINS/CLIENT_URL must contain only exact HTTPS origins.");
  // Declare platformHost for use by the surrounding module or function.
  const platformHost = String(process.env.PLATFORM_HOST || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  // Check the condition (!platformHost || /^(your-domain\.com|localhost|127\.0\.0\.1)$/i.test(p) and run the matching branch.
  if (!platformHost || /^(your-domain\.com|localhost|127\.0\.0\.1)$/i.test(platformHost) || /[/:?#\s]/.test(platformHost)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Production PLATFORM_HOST must be configured as a real hostname without a scheme or path.");
  }

  // Check the condition (process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY && String(process.env.ETIM) and run the matching branch.
  if (process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY && String(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY).length < 32) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("ETIMS_CREDENTIAL_ENCRYPTION_KEY must be at least 32 characters in production.");
  }
}

// Declare env for use by the surrounding module or function.
const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: nodeEnv,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_ORIGINS: process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173",
  CLIENT_URL: process.env.CLIENT_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AI_MODEL: process.env.AI_MODEL || "gpt-4.1-mini",
};

export default env;

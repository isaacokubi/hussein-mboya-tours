// Load key/value settings from local environment files during development.
import dotenv from "dotenv";
// Use Node's path helpers to locate environment files relative to this module.
import path from "path";
// Convert this module's URL into a filesystem path.
import { fileURLToPath } from "url";
// Validate that the configured MongoDB URI points to the intended environment/database.
import { validateDeploymentMongoUri } from "./mongoConfig.js";
// Fail early when required environment variables are missing or invalid.
import { assertRequiredEnvironment } from "./envValidation.js";

// Resolve this ES module's absolute filename.
const __filename = fileURLToPath(import.meta.url);
// Get the directory containing this configuration module.
const __dirname = path.dirname(__filename);

// Load the server-local environment file first, if it exists.
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// Also support a repository-root environment file for local development.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Validate required values before application code uses them.
assertRequiredEnvironment(process.env);

// Default to development when NODE_ENV is not supplied.
const nodeEnv = process.env.NODE_ENV || "development";
// Store a boolean so production-only checks are easy to read.
const isProduction = nodeEnv === "production";
// Normalize the deployment label used by database safety validation.
const deploymentEnv = String(process.env.DEPLOYMENT_ENV || "production").trim().toLowerCase();
// Interpret only the literal string "true" as an enabled boolean flag.
const truthy = (value) => String(value || "").toLowerCase() === "true";
// Require secrets to have length and character variety before production use.
const hasStrongSecret = (value) => {
  // Convert missing values to an empty string so validation fails safely.
  const secret = String(value || "");
  // Require at least 32 characters including lowercase, uppercase, and digits.
  return secret.length >= 32 && /[a-z]/.test(secret) && /[A-Z]/.test(secret) && /\d/.test(secret);
};

// Reject MongoDB settings that do not match the selected deployment environment.
validateDeploymentMongoUri({
  nodeEnv, // Tell the validator whether this is development, test, or production.
  deploymentEnv, // Tell the validator which deployment tier is intended.
  uri: process.env.MONGODB_URI, // Validate the configured database connection string.
  stagingDatabaseName: process.env.STAGING_DATABASE_NAME, // Supply the allowed staging database name.
});

// Apply stricter checks only when the app is running in production.
if (isProduction) {
  // JWT signatures must use a strong secret to make token forgery impractical.
  if (!hasStrongSecret(process.env.JWT_SECRET)) throw new Error("Production JWT_SECRET must be at least 32 characters and contain upper-case, lower-case, and numeric characters.");
  // Separate keys protect encrypted payment credentials and signed webhook processing.
  for (const key of ["PAYMENT_CREDENTIAL_ENCRYPTION_KEY", "WEBHOOK_SECRET_KEY"]) {
    // Stop startup instead of running production with a weak security key.
    if (!hasStrongSecret(process.env[key])) throw new Error(`Production ${key} must be at least 32 characters and contain upper-case, lower-case, and numeric characters.`);
  }
  // If eTIMS integration is configured, require its own strong encryption key.
  if ((process.env.ETIMS_ADAPTER_URL || process.env.ETIMS_ADAPTER_TOKEN) && !hasStrongSecret(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY)) {
    throw new Error("ETIMS_CREDENTIAL_ENCRYPTION_KEY must be configured with at least 32 mixed-case and numeric characters when eTIMS is enabled.");
  }
  // These development fallbacks must never weaken a production deployment.
  for (const key of ["ALLOW_SINGLE_TENANT_DEV_FALLBACK", "ALLOW_GLOBAL_MPESA_FALLBACK", "MFA_DEV_MODE"]) {
    // Refuse to start if any forbidden development shortcut is enabled.
    if (truthy(process.env[key])) throw new Error(`${key}=true is forbidden in production.`);
  }

  // Build the list of frontend origins allowed to make credentialed browser requests.
  const origins = getConfiguredOrigins(process.env);
  // Production origins must be exact HTTPS origins, not wildcards or insecure URLs.
  if (!origins.length || origins.some((origin) => !isValidConfiguredOrigin(origin, { production: true }))) throw new Error("Production CLIENT_ORIGINS/CLIENT_URL must contain only exact HTTPS origins.");
  // Normalize the platform host and remove an accidentally supplied scheme or trailing slash.
  const platformHost = String(process.env.PLATFORM_HOST || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  // Reject placeholders, local addresses, and host values containing paths or URL punctuation.
  if (!platformHost || /^(your-domain\.com|localhost|127\.0\.0\.1)$/i.test(platformHost) || /[/:?#\s]/.test(platformHost)) {
    throw new Error("Production PLATFORM_HOST must be configured as a real hostname without a scheme or path.");
  }

  // Apply a minimum length check to the optional eTIMS key whenever it is supplied.
  if (process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY && String(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY).length < 32) {
    throw new Error("ETIMS_CREDENTIAL_ENCRYPTION_KEY must be at least 32 characters in production.");
  }
}

// Export only the environment settings consumed by other modules.
const env = {
  PORT: process.env.PORT || 5000, // Use the hosting platform's port, or 5000 locally.
  NODE_ENV: nodeEnv, // Expose the normalized runtime mode.
  MONGODB_URI: process.env.MONGODB_URI, // Provide the validated database URI to the connection module.
  JWT_SECRET: process.env.JWT_SECRET, // Provide the token-signing secret to authentication code.
  JWT_EXPIRE: process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || "7d", // Set token lifetime with backward-compatible variable naming.
  CLIENT_ORIGINS: process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173", // Supply configured frontend origins to CORS handling.
  CLIENT_URL: process.env.CLIENT_URL, // Preserve the primary frontend URL for features that need it.
  OPENAI_API_KEY: process.env.OPENAI_API_KEY, // Optional server-side credential for AI features.
  AI_MODEL: process.env.AI_MODEL || "gpt-4.1-mini", // Select the AI model unless deployment overrides it.
};

// Make the normalized configuration available to the rest of the server.
export default env;

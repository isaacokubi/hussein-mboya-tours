import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const required = ["MONGODB_URI", "JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const truthy = (value) => String(value || "").toLowerCase() === "true";
const hasStrongSecret = (value) => {
  const secret = String(value || "");
  return secret.length >= 32 && /[a-z]/.test(secret) && /[A-Z]/.test(secret) && /\d/.test(secret);
};

if (isProduction) {
  if (!hasStrongSecret(process.env.JWT_SECRET)) throw new Error("Production JWT_SECRET must be at least 32 characters and contain upper-case, lower-case, and numeric characters.");
  for (const key of ["PAYMENT_CREDENTIAL_ENCRYPTION_KEY", "WEBHOOK_SECRET_KEY"]) {
    if (!hasStrongSecret(process.env[key])) throw new Error(`Production ${key} must be at least 32 characters and contain upper-case, lower-case, and numeric characters.`);
  }
  if ((process.env.ETIMS_ADAPTER_URL || process.env.ETIMS_ADAPTER_TOKEN) && !hasStrongSecret(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY)) {
    throw new Error("ETIMS_CREDENTIAL_ENCRYPTION_KEY must be configured with at least 32 mixed-case and numeric characters when eTIMS is enabled.");
  }
  for (const key of ["ALLOW_SINGLE_TENANT_DEV_FALLBACK", "ALLOW_GLOBAL_MPESA_FALLBACK", "MFA_DEV_MODE"]) {
    if (truthy(process.env[key])) throw new Error(`${key}=true is forbidden in production.`);
  }

  const origins = String(process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "").split(",").map((value) => value.trim()).filter(Boolean);
  if (!origins.length || origins.some((origin) => !/^https:\/\//i.test(origin))) throw new Error("Production CLIENT_ORIGINS/CLIENT_URL must contain only HTTPS origins.");
  const platformHost = String(process.env.PLATFORM_HOST || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!platformHost || /^(your-domain\.com|localhost|127\.0\.0\.1)$/i.test(platformHost) || /[/:?#\s]/.test(platformHost)) {
    throw new Error("Production PLATFORM_HOST must be configured as a real hostname without a scheme or path.");
  }

  if (process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY && String(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY).length < 32) {
    throw new Error("ETIMS_CREDENTIAL_ENCRYPTION_KEY must be at least 32 characters in production.");
  }
}

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

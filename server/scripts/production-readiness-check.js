import fs from "node:fs";

const requiredFiles = ["config/env.js", "app.js", "server.js", "models/Organization.js", "middleware/tenantMiddleware.js", "tenancy/tenantPlugin.js"];
const missing = requiredFiles.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error("Missing production files:", missing.join(", "));
  process.exit(1);
}

const envTemplate = fs.readFileSync(".env.example", "utf8");
const requiredEnv = ["MONGODB_URI", "JWT_SECRET", "DEFAULT_TENANT_ID"];
const missingTemplate = requiredEnv.filter((key) => !new RegExp(`^${key}=`, "m").test(envTemplate));
if (missingTemplate.length) {
  console.error("Missing environment template variables:", missingTemplate.join(", "));
  process.exit(1);
}

if (process.env.PRODUCTION_READINESS_RUNTIME === "true") {
  const missingRuntime = requiredEnv.filter((key) => !process.env[key]);
  if (missingRuntime.length) {
    console.error("Missing runtime production environment variables:", missingRuntime.join(", "));
    process.exit(1);
  }
}

console.log("Production readiness check passed");
console.log(`Runtime environment validation: ${process.env.PRODUCTION_READINESS_RUNTIME === "true" ? "enabled" : "CI/static mode"}`);

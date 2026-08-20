import fs from "fs";

const requiredFiles = [
  "config/env.js",
  "app.js",
  "server.js",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing production files:", missing.join(", "));
  process.exit(1);
}

const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  console.error("Missing production environment variables:", missingEnv.join(", "));
  process.exit(1);
}

console.log("Production readiness check passed");

import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const app = read("app.js");
const checks = [
  [
    "Dedicated MFA send limiter",
    read("middleware/authRateLimiters.js").includes("mfaSendRateLimiter"),
  ],
  [
    "Dedicated MFA verify limiter",
    read("middleware/authRateLimiters.js").includes("mfaVerifyRateLimiter"),
  ],
  [
    "MFA send route uses dedicated limiter",
    read("routes/mfaRoutes.js").includes("mfaSendRateLimiter"),
  ],
  [
    "MFA verify route uses dedicated limiter",
    read("routes/mfaRoutes.js").includes("mfaVerifyRateLimiter"),
  ],
  [
    "Production log redaction guard",
    app.includes('process.env.NODE_ENV === "production"') &&
      app.includes("sensitiveKeys") &&
      app.includes("callbackResponse") &&
      app.includes("[REDACTED]") &&
      app.includes("console.log =") &&
      app.includes("console.error ="),
  ],
  [
    "Environment template has no shell command block",
    !read(".env.example").includes("git status") &&
      !read(".env.example").includes("npm install"),
  ],
];

const failed = checks.filter(([, ok]) => !ok);

for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}

if (failed.length) {
  process.exitCode = 1;
} else {
  console.log("Security hardening checks passed.");
}

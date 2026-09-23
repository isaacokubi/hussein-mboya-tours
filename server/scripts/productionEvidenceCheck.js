import fs from "node:fs";
import path from "node:path";

const manifestPath = process.env.PRODUCTION_EVIDENCE_MANIFEST;
if (!manifestPath) {
  console.error("PRODUCTION_EVIDENCE_MANIFEST is required.");
  process.exit(2);
}
const resolved = path.resolve(manifestPath);
if (!fs.existsSync(resolved)) {
  console.error("Evidence manifest not found: " + resolved);
  process.exit(2);
}
let manifest;
try { manifest = JSON.parse(fs.readFileSync(resolved, "utf8")); }
catch (error) {
  console.error("Evidence manifest is not valid JSON: " + error.message);
  process.exit(1);
}

const requiredChecks = ["backup","restore","monitoring","payment","etims","webhooks","browser","authenticated_roles","data_integrity"];
const forbiddenPatterns = [/password/i,/secret/i,/private[_ -]?key/i,/access[_ -]?token/i,/client[_ -]?secret/i,/consumer[_ -]?key/i,/consumer[_ -]?secret/i,/passkey/i,/mfa[_ -]?(pin|code)/i];
const errors = [];
const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

if (!isObject(manifest)) errors.push("Manifest must be an object.");
if (manifest.version !== 1) errors.push("Manifest version must be 1.");

if (!isObject(manifest.deployment)) errors.push("deployment is required.");
else {
  if (!/^[a-f0-9]{40}$/i.test(manifest.deployment.commit || "")) errors.push("deployment.commit must be a 40-character Git SHA.");
  if (!manifest.deployment.environment) errors.push("deployment.environment is required.");
  if (!manifest.deployment.verifiedAt || Number.isNaN(Date.parse(manifest.deployment.verifiedAt))) errors.push("deployment.verifiedAt must be an ISO-8601 timestamp.");
}

if (!Array.isArray(manifest.checks)) errors.push("checks must be an array.");
else {
  const byId = new Map();
  for (const check of manifest.checks) {
    if (!isObject(check) || !check.id) { errors.push("Every check must be an object with an id."); continue; }
    if (byId.has(check.id)) errors.push("Duplicate check id: " + check.id);
    byId.set(check.id, check);
    if (!requiredChecks.includes(check.id)) errors.push("Unknown check id: " + check.id);
    if (check.status !== "PASS") errors.push("Check " + check.id + " is not PASS.");
    if (!check.verifiedAt || Number.isNaN(Date.parse(check.verifiedAt))) errors.push("Check " + check.id + " must have an ISO-8601 verifiedAt.");
    if (!check.evidenceRef || typeof check.evidenceRef !== "string") errors.push("Check " + check.id + " must have an evidenceRef.");
  }
  for (const id of requiredChecks) if (!byId.has(id)) errors.push("Missing required check: " + id);
}

const serialized = JSON.stringify(manifest);
for (const pattern of forbiddenPatterns) if (pattern.test(serialized)) errors.push("Manifest contains credential-like content matching " + pattern);

if (errors.length) {
  console.error("Production evidence manifest: FAIL");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}
console.log("Production evidence manifest: PASS");
console.log("Deployment commit: " + manifest.deployment.commit);
console.log("Environment: " + manifest.deployment.environment);
console.log("Checks verified: " + requiredChecks.length);

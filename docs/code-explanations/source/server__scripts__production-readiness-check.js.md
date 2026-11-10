# Source explanation: server/scripts/production-readiness-check.js

**Source:** [server/scripts/production-readiness-check.js](../../../server/scripts/production-readiness-check.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `node:fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 4: `const requiredFiles = [`.
- Line 71: `const missing = requiredFiles.filter((file) => !fs.existsSync(file));`.
- Line 77: `const envTemplate = fs.readFileSync(".env.example", "utf8");`.
- Line 78: `<sensitive declaration redacted>`.
- Line 79: `const missingTemplate = requiredEnv.filter((key) => !new RegExp(\`^${key}=\`, "m").test(envTemplate));`.
- Line 94: `const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));`.
- Line 95: `const requiredScripts = ["check:all", "test", "check:production", "reconcile:tenant-indexes", "bootstrap:first"];`.
- Line 96: `const missingScripts = requiredScripts.filter((name) => !packageJson.scripts?.[name]);`.
- Line 102: `const releaseDocs = [`.
- Line 109: `const missingReleaseDocs = releaseDocs.filter((file) => !fs.existsSync(\`../${file}\`));`.
- Line 115: `const goLiveChecklist = fs.readFileSync("../docs/PRODUCTION_GO_LIVE_CHECKLIST.md", "utf8");`.
- Line 116: `const evidenceFlags = [`.
- Line 124: `const missingDocumentedEvidence = evidenceFlags.filter((key) => !goLiveChecklist.includes(key));`.
- Line 130: `const runtimeValidation = process.env.PRODUCTION_READINESS_RUNTIME === "true";`.
- Line 132: `const missingRuntime = requiredEnv.filter((key) => !process.env[key]);`.
- Line 135: `const production = process.env.NODE_ENV === "production";`.
- Line 136: `<sensitive declaration redacted>`.
- Line 137: `const weakSecurityKeys = securityKeys.filter((key) => production && String(process.env[key] || "").length < 32);`.
- Line 138: `const unsafeFallback = production && String(process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK || "false").toLowerCase() === "true";`.
- Line 139: `const globalMpesaFallback = production && String(process.env.ALLOW_GLOBAL_MPESA_FALLBACK || "false").toLowerCase() === "true";`.
- Line 140: `const devMfa = production && String(process.env.MFA_DEV_MODE || "false").toLowerCase() === "true";`.
- Line 141: `<sensitive declaration redacted>`.
- Line 142: `const weakJwt = production && (jwt.length < 32 || new Set(jwt).size < 12);`.
- Line 143: `const origins = String(process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "").split(",").map((value) => value.trim()).filter(Boolean);`.
- Line 144: `const insecureOrigins = production && origins.some((origin) => !/^https:\/\//i.test(origin));`.
- Line 145: `const platformHost = String(process.env.PLATFORM_HOST || "").trim();`.
- Line 146: `const missingPlatformHost = production && !platformHost;`.
- Line 147: `const placeholderHost = production && /^(your-domain\.com|localhost|127\.0\.0\.1)$/i.test(platformHost);`.
- Line 148: `const paymentKeyRequired = production;`.
- Line 149: `<sensitive declaration redacted>`.
- Line 150: `<sensitive declaration redacted>`.
- Line 151: `<sensitive declaration redacted>`.
- Line 152: `const missingEvidence = production ? evidenceFlags.filter((key) => String(process.env[key] || "false").toLowerCase() !== "true") : [];`.
- Line 153: `const errors = [];`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

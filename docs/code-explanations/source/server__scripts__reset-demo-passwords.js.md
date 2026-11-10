# Source explanation: server/scripts/reset-demo-passwords.js

**Source:** [server/scripts/reset-demo-passwords.js](../../../server/scripts/reset-demo-passwords.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `bcrypt` from `bcryptjs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `TEST_LOGIN_EMAILS` from `../seeds/completeTestDemoSeed.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/seeds/completeTestDemoSeed.js](../../../server/seeds/completeTestDemoSeed.js)

## Runtime declarations and data flow

### `validatePassword` — lines 12–16

Parameters: `password`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** Sensitive-configuration/data operation; inspect source without copying secret values. — Stops the current operation with an error; callers or Express error handling determine the response.

### `main` — lines 18–78

Parameters: none.
Persistent operations detected: Organization.find; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 14 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const target = new URL(process.env.MONGODB_URI);` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 23:** `if (target.hostname.toLowerCase() !== "cluster0.cdtxzts.mongodb.net" || decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "") !== "husseindb") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** Sensitive-configuration/data operation; inspect source without copying secret values. — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 27:** `await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, maxPoolSize: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 29:** `const users = mongoose.connection.db.collection("users");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const accounts = await users.find({ email: { $in: TEST_LOGIN_EMAILS } }, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `if (accounts.length !== TEST_LOGIN_EMAILS.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `throw new Error(\`Safety check failed: expected ${TEST_LOGIN_EMAILS.length} seeded demo users, found ${accounts.length}. No changes made.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 36:** `const found = new Set(accounts.map(({ email }) => email));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (found.size !== TEST_LOGIN_EMAILS.length) throw new Error("Safety check failed: duplicate canonical demo login records were found. No changes made.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `const missing = TEST_LOGIN_EMAILS.filter((email) => !found.has(email));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (missing.length) throw new Error(\`Safety check failed: missing seeded accounts: ${missing.join(", ")}. No changes made.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const platform = accounts.filter((user) => user.email === PLATFORM_EMAIL);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const tenantUsers = accounts.filter((user) => user.email !== PLATFORM_EMAIL);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (platform.length !== 1 || platform[0].tenantId != null || platform[0].role !== "super_admin" || platform[0].status !== "active") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 7: `<sensitive declaration redacted>`.
- Line 8: `<sensitive declaration redacted>`.
- Line 9: `const PLATFORM_EMAIL = "superadmin1@husseinmboya.com";`.
- Line 10: `const TENANT_DOMAINS = { "hussein-mboya": "husseinmboya.com", "amani-trails": "amanitrails.com", "demo-safari": "demosafari.com" };`.
- Line 12: `<sensitive declaration redacted>`.
- Line 22: `const target = new URL(process.env.MONGODB_URI);`.
- Line 29: `const users = mongoose.connection.db.collection("users");`.
- Line 30: `const accounts = await users.find({ email: { $in: TEST_LOGIN_EMAILS } }, {`.
- Line 36: `const found = new Set(accounts.map(({ email }) => email));`.
- Line 38: `const missing = TEST_LOGIN_EMAILS.filter((email) => !found.has(email));`.
- Line 40: `const platform = accounts.filter((user) => user.email === PLATFORM_EMAIL);`.
- Line 41: `const tenantUsers = accounts.filter((user) => user.email !== PLATFORM_EMAIL);`.
- Line 48: `const tenants = new Set(tenantUsers.map((user) => String(user.tenantId)));`.
- Line 50: `const tenantDocs = await Organization.find({ slug: { $in: Object.keys(TENANT_DOMAINS) } }).select("_id slug").lean();`.
- Line 51: `const tenantIdBySlug = new Map(tenantDocs.map((tenant) => [tenant.slug, String(tenant._id)]));`.
- Line 54: `const slug = Object.entries(TENANT_DOMAINS).find(([, domain]) => account.email.endsWith(\`@${domain}\`))?.[0];`.
- Line 55: `const local = account.email.split("@")[0];`.
- Line 56: `const expectedRole = local === "admin1" ? "admin" : local === "tourmanager1" ? "tour_manager" : local.startsWith("agent") ? "agent" : local.startsWith("guide") ? "tour_guide" : loc`.
- Line 62: `<sensitive declaration redacted>`.
- Line 63: `const result = await users.updateMany({ _id: { $in: accounts.map((user) => user._id) }, email: { $in: TEST_LOGIN_EMAILS } }, {`.
- Line 70: `<sensitive declaration redacted>`.
- Line 81: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

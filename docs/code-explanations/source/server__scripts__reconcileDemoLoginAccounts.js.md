# Source explanation: server/scripts/reconcileDemoLoginAccounts.js

**Source:** [server/scripts/reconcileDemoLoginAccounts.js](../../../server/scripts/reconcileDemoLoginAccounts.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `bcrypt` from `bcryptjs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `randomBytes` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `pathToFileURL` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `assertTarget` — lines 37–51

Parameters: none.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 38:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `const target = new URL(process.env.MONGODB_URI);` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 40:** `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `if (target.hostname.toLowerCase() !== expectedHost || database !== expectedDatabase) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `throw new Error("Refusing demo-account reconciliation: target must be the configured demo Atlas host and husseindb database.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 44:** `if (process.env.NODE_ENV === "production") throw new Error("Refusing demo-account reconciliation with NODE_ENV=production.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (process.env.ALLOW_ATLAS_DEMO_SEED !== "YES") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `throw new Error("Set ALLOW_ATLAS_DEMO_SEED=YES to explicitly authorize the configured demo Atlas target.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 48:** `if (!isDryRun && process.env.CONFIRM_DEMO_ACCOUNT_MIGRATION !== "YES") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `throw new Error("Set CONFIRM_DEMO_ACCOUNT_MIGRATION=YES to apply the account migration. Use --dry-run to preview.");` — Stops the current operation with an error; callers or Express error handling determine the response.

### `validatePassword` — lines 53–57

Parameters: `password`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 54:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** Sensitive-configuration/data operation; inspect source without copying secret values. — Stops the current operation with an error; callers or Express error handling determine the response.

### `emailFor` — lines 59–59

Parameters: `local`, `domain`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `legacyEmailFor` — lines 60–60

Parameters: `local`, `domain`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `roleForOldPlatform` — lines 61–61

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `generatedPhone` — lines 62–62

Parameters: `index`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `main` — lines 64–236

Parameters: none.
Persistent operations detected: Role.findOne, Staff.findOne, Staff.create, Agent.findOne, Agent.create, Customer.findOne, Customer.create; verify tenant/ownership filters in the exact query. 25 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 30 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 66:** Sensitive-configuration/data operation; inspect source without copying secret values. — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 67:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, maxPoolSize: 2 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 70:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `const users = db.collection("users");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `const organizations = db.collection("organizations");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `const tenantDocs = await organizations.find({ slug: { $in: TENANTS.map((tenant) => tenant.slug) } }).toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 74:** `const tenantBySlug = new Map(tenantDocs.map((tenant) => [tenant.slug, tenant]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `if (tenantBySlug.size !== TENANTS.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `throw new Error(\`Expected all 3 demo tenants; found ${tenantBySlug.size}. No changes made.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 79:** `const plan = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `const globalOld = await users.findOne({ email: PLATFORM_OLD, tenantId: null });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 81:** `const globalNew = await users.findOne({ email: PLATFORM_NEW, tenantId: null });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 82:** `if (globalOld && globalNew && String(globalOld._id) !== String(globalNew._id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `throw new Error("Both legacy and canonical platform accounts exist with different IDs. Resolve this duplicate manually; no changes made.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 85:** `if (globalNew && !roleForOldPlatform(globalNew)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `throw new Error("Canonical platform account has an unexpected role. No changes made.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 14: `export const TENANTS = [`.
- Line 19: `export const ACCOUNT_SPECS = [`.
- Line 30: `export const PLATFORM_OLD = "superadmin@hussein-mboya.com";`.
- Line 31: `export const PLATFORM_NEW = "superadmin1@husseinmboya.com";`.
- Line 32: `const platformRoleNames = ["super_admin", "superadmin"];`.
- Line 33: `const isDryRun = process.argv.includes("--dry-run");`.
- Line 34: `const expectedHost = "cluster0.cdtxzts.mongodb.net";`.
- Line 35: `const expectedDatabase = "husseindb";`.
- Line 37: `function assertTarget() {`.
- Line 39: `const target = new URL(process.env.MONGODB_URI);`.
- Line 40: `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");`.
- Line 53: `<sensitive declaration redacted>`.
- Line 59: `export function emailFor(local, domain) { return \`${local}@${domain}\`; }`.
- Line 60: `function legacyEmailFor(local, domain) { return \`${local}@${domain}\`; }`.
- Line 61: `function roleForOldPlatform(user) { return platformRoleNames.includes(String(user?.role || "").toLowerCase()); }`.
- Line 62: `function generatedPhone(index) { return String(7900000000 + index).slice(-10); }`.
- Line 66: `<sensitive declaration redacted>`.
- Line 70: `const db = mongoose.connection.db;`.
- Line 71: `const users = db.collection("users");`.
- Line 72: `const organizations = db.collection("organizations");`.
- Line 73: `const tenantDocs = await organizations.find({ slug: { $in: TENANTS.map((tenant) => tenant.slug) } }).toArray();`.
- Line 74: `const tenantBySlug = new Map(tenantDocs.map((tenant) => [tenant.slug, tenant]));`.
- Line 79: `const plan = [];`.
- Line 80: `const globalOld = await users.findOne({ email: PLATFORM_OLD, tenantId: null });`.
- Line 81: `const globalNew = await users.findOne({ email: PLATFORM_NEW, tenantId: null });`.
- Line 90: `const tenantPlans = [];`.
- Line 92: `const tenant = tenantBySlug.get(tenantSpec.slug);`.
- Line 93: `const tenantId = tenant._id;`.
- Line 94: `const roleDocs = await db.collection("roles").find({ tenantId }).toArray();`.
- Line 95: `const roleByName = new Map(roleDocs.map((role) => [String(role.name).toLowerCase(), role]));`.
- Line 99: `const entries = [];`.
- Line 101: `const canonicalEmail = emailFor(spec.local, tenantSpec.domain);`.
- Line 102: `const oldEmail = spec.legacyLocal ? legacyEmailFor(spec.legacyLocal, tenantSpec.legacyDomain) : null;`.
- Line 103: `const canonical = await users.findOne({ tenantId, email: canonicalEmail });`.
- Line 104: `const legacy = oldEmail ? await users.findOne({ tenantId, email: oldEmail }) : null;`.
- Line 108: `const current = canonical || legacy;`.
- Line 129: `<sensitive declaration redacted>`.
- Line 130: `const now = new Date();`.
- Line 131: `const globalAccount = globalOld || globalNew;`.
- Line 139: `const role = await Role.findOne({ tenantId: null, name: "super_admin" });`.
- Line 140: `const account = new User({`.
- Line 150: `let created = 0;`.
- Line 151: `let renamed = 0;`.
- Line 155: `const { spec, canonicalEmail, current, roleDoc } = entries[i];`.
- Line 156: `let userId;`.
- Line 159: `const wasLegacy = current.email !== canonicalEmail;`.
- Line 171: `const account = new User({`.
- Line 184: `const existingStaff = await Staff.findOne({ tenantId: tenant._id, user: userId });`.
- Line 186: `const position = spec.role === "tour_guide" ? "guide" : spec.role === "driver" ? "driver" : spec.role === "tour_manager" ? "tour_manager" : "admin";`.
- Line 217: `const finalEmails = [PLATFORM_NEW, ...TENANTS.flatMap((tenant) => ACCOUNT_SPECS.map((spec) => emailFor(spec.local, tenant.domain)))];`.
- Line 218: `const finalUsers = await users.find({ email: { $in: finalEmails } }, { projection: { email: 1, role: 1, tenantId: 1, status: 1 } }).toArray();`.
- Line 219: `const emailSet = new Set(finalUsers.map(({ email }) => email));`.
- Line 220: `const missing = finalEmails.filter((email) => !emailSet.has(email));`.
- Line 222: `const global = finalUsers.find(({ email }) => email === PLATFORM_NEW);`.
- Line 225: `const tenantUsers = finalUsers.filter((user) => String(user.tenantId) === String(tenant._id));`.
- Line 230: `<sensitive declaration redacted>`.
- Line 238: `const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";`.
- Line 241: `const message = String(error?.message || "Demo account reconciliation failed.")`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

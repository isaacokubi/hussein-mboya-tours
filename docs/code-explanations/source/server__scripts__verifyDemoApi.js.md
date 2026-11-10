# Source explanation: server/scripts/verifyDemoApi.js

**Source:** [server/scripts/verifyDemoApi.js](../../../server/scripts/verifyDemoApi.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `node:fs/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fileURLToPath` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSafeDemoApiOrigin`, `LOGIN_WINDOW_MS`, `needsLoginWindowWait` from `./demoApiValidationSafety.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/scripts/demoApiValidationSafety.js](../../../server/scripts/demoApiValidationSafety.js)
- `TEST_LOGIN_EMAILS` from `../seeds/completeTestDemoSeed.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/seeds/completeTestDemoSeed.js](../../../server/seeds/completeTestDemoSeed.js)

## Runtime declarations and data flow

### `pause` — lines 15–15

Parameters: `duration`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `accountRole` — lines 19–29

Parameters: `email`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `if (email === "superadmin1@husseinmboya.com") return "super_admin";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const local = email.split("@")[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `if (local === "admin1") return "admin";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `if (local === "tourmanager1") return "tour_manager";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (local.startsWith("agent")) return "agent";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `if (local.startsWith("guide")) return "tour_guide";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (local.startsWith("driver")) return "driver";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `if (local.startsWith("customer")) return "customer";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `accountKey` — lines 30–36

Parameters: `email`, `tenant`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 31:** `if (!tenant) return "superAdmin";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `const local = email.split("@")[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (local === "admin1") return \`tenantAdmin${tenantKeys[tenant]}\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `if (local === "tourmanager1") return \`manager${tenantKeys[tenant]}\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `return \`${local}${tenantKeys[tenant]}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `request` — lines 46–68

Parameters: `endpoint`, `token`, `options (defaulted)`.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 47:** `const maxAttempts = 3;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 49:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 50:** `const response = await fetch(new URL(endpoint, baseUrl), {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 55:** `let payload = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `try { payload = await response.json(); } catch { /* status remains the assertion */ }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 60:** `if (response.status < 500 || attempt === maxAttempts) return { status: response.status, payload };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `await pause(1000 * attempt);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 63:** `if (attempt === maxAttempts) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `await pause(1000 * attempt);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 67:** `throw new Error("Demo API request retry loop exhausted unexpectedly.");` — Stops the current operation with an error; callers or Express error handling determine the response.

### `dashboardFeatureFor` — lines 70–76

Parameters: `account`, `endpoint`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 71:** `if (endpoint === "/api/admin/finance/stats") return "finance";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `if (endpoint.startsWith("/api/tourmanager/") || endpoint.startsWith("/api/guide/")) return "operations";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `if (endpoint.startsWith("/api/agent/")) return "agents";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `if (endpoint.startsWith("/api/driver/")) return "fleet";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `count` — lines 189–189

Parameters: `collection`, `filter`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 189:** `(collection, filter) => db.collection(collection).countDocuments(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `aggregateTotal` — lines 190–193

Parameters: `collection`, `pipeline`, `field (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 191:** `const [row] = await db.collection(collection).aggregate(pipeline).toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 192:** `return Number(row?.[field] || 0);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `postedRevenue` — lines 194–201

Parameters: `tenantId`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `bookingId` — lines 279–279

Parameters: `key`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 10: `const baseUrl = getSafeDemoApiOrigin(process.env.DEMO_API_BASE_URL);`.
- Line 11: `<sensitive declaration redacted>`.
- Line 13: `const defaultReportPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../reports/demo-api-validation.json");`.
- Line 14: `const reportPath = path.resolve(process.env.DEMO_API_REPORT_PATH || defaultReportPath);`.
- Line 15: `const pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration));`.
- Line 16: `const userAgent = "HusseinMboyaDemoApiValidator/1.0";`.
- Line 17: `const domains = { "husseinmboya.com": "hussein-mboya", "amanitrails.com": "amani-trails", "demosafari.com": "demo-safari" };`.
- Line 18: `const tenantKeys = { "hussein-mboya": "A", "amani-trails": "B", "demo-safari": "C" };`.
- Line 19: `const accountRole = (email) => {`.
- Line 21: `const local = email.split("@")[0];`.
- Line 30: `const accountKey = (email, tenant) => {`.
- Line 32: `const local = email.split("@")[0];`.
- Line 37: `const logins = TEST_LOGIN_EMAILS.map((email) => {`.
- Line 38: `const tenant = Object.entries(domains).find(([domain]) => email.endsWith(\`@${domain}\`))?.[1] || null;`.
- Line 41: `const customerAccounts = logins.filter(({ role }) => role === "customer");`.
- Line 43: `const report = { timestamp: new Date().toISOString(), logins: [], tenantEntitlements: [], dashboards: [], dashboardComparisons: [], financeComparisons: [], tenantIsolation: [], rba`.
- Line 44: `const sessions = new Map();`.
- Line 47: `const maxAttempts = 3;`.
- Line 50: `const response = await fetch(new URL(endpoint, baseUrl), {`.
- Line 55: `let payload = {};`.
- Line 70: `const dashboardFeatureFor = (account, endpoint) => {`.
- Line 81: `const response = await request("/api/auth/login", null, {`.
- Line 86: `const actualRole = response.payload?.user?.role;`.
- Line 87: `const actualTenantId = response.payload?.user?.tenantId || null;`.
- Line 88: `const result = { account: account.key, status: response.status, role: actualRole, authenticatedTenant: actualTenantId };`.
- Line 96: `const tenantIds = ["tenantAdminA", "tenantAdminB", "tenantAdminC"].map((key) => sessions.get(key).tenantId);`.
- Line 99: `const tenantIdBySlug = new Map([`.
- Line 108: `const tenantFeatures = new Map();`.
- Line 110: `<sensitive declaration redacted>`.
- Line 112: `const features = Array.isArray(response.payload?.features) ? response.payload.features : [];`.
- Line 127: `const dashboardChecks = [`.
- Line 164: `const payloads = new Map();`.
- Line 166: `<sensitive declaration redacted>`.
- Line 167: `const account = logins.find((candidate) => candidate.key === key);`.
- Line 168: `const requiredFeature = dashboardFeatureFor(account, endpoint);`.
- Line 169: `const planFeatureLocked = requiredFeature`.
- Line 172: `const expectedStatus = planFeatureLocked ? 403 : 200;`.
- Line 182: `const atlasTarget = new URL(process.env.MONGODB_URI || "");`.
- Line 183: `const atlasDatabase = decodeURIComponent(atlasTarget.pathname.replace(/^\//, "").split("/")[0] || "");`.
- Line 188: `const db = mongoose.connection.db;`.
- Line 189: `const count = (collection, filter) => db.collection(collection).countDocuments(filter);`.
- Line 190: `const aggregateTotal = async (collection, pipeline, field = "total") => {`.
- Line 191: `const [row] = await db.collection(collection).aggregate(pipeline).toArray();`.
- Line 194: `const postedRevenue = (tenantId) => aggregateTotal("journalentries", [`.
- Line 202: `const active = { isDeleted: { $ne: true } };`.
- Line 203: `const paidStatuses = ["paid", "completed", "success"];`.
- Line 205: `const tenantId = new mongoose.Types.ObjectId(sessions.get(account).tenantId);`.
- Line 206: `const scope = { tenantId, ...active };`.
- Line 207: `const data = payloads.get(\`${account}:/api/admin/dashboard/metrics\`)?.data;`.
- Line 208: `const [revenue, collections, refundedAmount, commission] = await Promise.all([`.
- Line 214: `const [users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, boo`.
- Line 235: `const expected = { users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, desti`.
- Line 242: `const financeData = payloads.get(\`${account}:/api/admin/finance/stats\`)?.data;`.
- Line 247: `const expectedFinance = {`.
- Line 269: `const response = await request(endpoint, null, { headers: { "X-Tenant-Slug": tenant } });`.
- Line 270: `const records = response.payload?.data || response.payload?.tours || response.payload?.destinations || [];`.
- Line 271: `const expectedTenantId = sessions.get({ "hussein-mboya": "tenantAdminA", "amani-trails": "tenantAdminB", "demo-safari": "tenantAdminC" }[tenant]).tenantId;`.
- Line 279: `const bookingId = (key) => payloads.get(\`${key}:/api/bookings/my-bookings\`)?.bookings?.[0]?._id;`.
- Line 280: `const customerBookings = customerAccounts.map(({ key, tenant }) => ({ key, tenant, bookingId: bookingId(key) }));`.
- Line 283: `const foreignBookings = customerBookings.filter((candidate) => candidate.tenant !== account.tenant);`.
- Line 285: `<sensitive declaration redacted>`.
- Line 291: `<sensitive declaration redacted>`.
- Line 296: `<sensitive declaration redacted>`.
- Line 301: `const safeMessage = String(error?.message || "Validation failed.")`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

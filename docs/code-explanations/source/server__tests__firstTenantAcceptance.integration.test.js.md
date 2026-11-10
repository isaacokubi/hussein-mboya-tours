# Source explanation: server/tests/firstTenantAcceptance.integration.test.js

**Source:** [server/tests/firstTenantAcceptance.integration.test.js](../../../server/tests/firstTenantAcceptance.integration.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `http` from `node:http`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `randomBytes` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `isolatedTestDatabaseUri` — lines 8–17

Parameters: `baseUri`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `const uri = new URL(baseUri);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const sourceDatabase = decodeURIComponent(uri.pathname.replace(/^\//, ""));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (sourceDatabase !== "global_tours_test") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `throw new Error("FIRST_TENANT_TEST_MONGODB_URI must use global_tours_test as its Atlas source connection.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 14:** `const databaseName = \`fta_${process.pid}_${randomBytes(8).toString("hex")}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `return { uri: uri.toString(), databaseName };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `call` — lines 74–90

Parameters: `url`, `arg2 (defaulted)`.
Error control: try=true, catch=false, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 75:** `const headers = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `if (url === "/api/auth/login" && options.method !== "OPTIONS") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `let email = "unknown-login-client";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `try { email = JSON.parse(options.body || "{}").email || email; } catch { /* malformed-login tests still use a stable client key */ }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 84:** `if (!loginClientIps.has(email)) loginClientIps.set(email, \`198.51.100.${loginClientIps.size + 1}\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 89:** `return fetch(\`${origin}${url}\`, { ...options, headers });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tenantInput` — lines 91–97

Parameters: `suffix`, `plan (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const testMongoUri = process.env.FIRST_TENANT_TEST_MONGODB_URI;`.
- Line 8: `const isolatedTestDatabaseUri = (baseUri) => {`.
- Line 9: `const uri = new URL(baseUri);`.
- Line 10: `const sourceDatabase = decodeURIComponent(uri.pathname.replace(/^\//, ""));`.
- Line 14: `const databaseName = \`fta_${process.pid}_${randomBytes(8).toString("hex")}\`;`.
- Line 20: `const { uri: isolatedUri, databaseName } = isolatedTestDatabaseUri(testMongoUri);`.
- Line 31: `const stagingFrontendOrigin = "https://hussein-mboya-tours-2-l3m78h6fz-isaacokubis-projects.vercel.app";`.
- Line 37: `const mongooseModule = await import("mongoose");`.
- Line 38: `const mongoose = mongooseModule.default;`.
- Line 43: `const [appModule, onboarding, userModel, organizationModel, context, paymentService, readiness] = await Promise.all([`.
- Line 48: `const app = appModule.default;`.
- Line 49: `const { assertSupportedMongoVersion } = await import("../utils/mongodbVersion.js");`.
- Line 50: `const User = userModel.default;`.
- Line 51: `const Organization = organizationModel.default;`.
- Line 52: `const server = http.createServer(app);`.
- Line 53: `let owner;`.
- Line 54: `let firstTenant;`.
- Line 55: `let secondTenant;`.
- Line 56: `<sensitive declaration redacted>`.
- Line 57: `<sensitive declaration redacted>`.
- Line 58: `<sensitive declaration redacted>`.
- Line 62: `const buildInfo = await mongoose.connection.db.admin().command({ buildInfo: 1 });`.
- Line 64: `const roles = await onboarding.ensureSystemRoles();`.
- Line 72: `const origin = \`http://127.0.0.1:${server.address().port}\`;`.
- Line 73: `const loginClientIps = new Map();`.
- Line 74: `<sensitive declaration redacted>`.
- Line 75: `const headers = {`.
- Line 82: `let email = "unknown-login-client";`.
- Line 91: `const tenantInput = (suffix, plan = "starter") => ({`.
- Line 99: `const stagingPreflight = await call("/api/auth/login", {`.
- Line 109: `const unrelatedPreflight = await call("/api/auth/login", {`.
- Line 119: `const unknownStagingLogin = await call("/api/auth/login", {`.
- Line 127: `const ownerLogin = await call("/api/auth/login", {`.
- Line 133: `const ownerLoginData = await ownerLogin.json();`.
- Line 134: `<sensitive declaration redacted>`.
- Line 137: `const aliasOwner = await context.runWithTenant({ role: "superadmin", bypass: true }, () => User.create({`.
- Line 142: `const aliasOwnerLogin = await call("/api/auth/login", {`.
- Line 148: `const aliasOwnerData = await aliasOwnerLogin.json();`.
- Line 151: `<sensitive declaration redacted>`.
- Line 154: `const publicCreate = await call("/api/superadmin/tenants", { method: "POST", body: JSON.stringify(tenantInput("public")) });`.
- Line 157: `<sensitive declaration redacted>`.
- Line 159: `const firstData = await firstResponse.json();`.
- Line 164: `const unselectedPublicBranding = await call("/api/tenant/branding");`.
- Line 167: `const adminLoginResponse = await call("/api/auth/login", {`.
- Line 172: `const adminLogin = await adminLoginResponse.json();`.
- Line 173: `<sensitive declaration redacted>`.
- Line 176: `<sensitive declaration redacted>`.
- Line 178: `const adminMeTenantId = (await adminMe.json()).user.tenantId;`.
- Line 181: `<sensitive declaration redacted>`.
- Line 184: `<sensitive declaration redacted>`.
- Line 186: `<sensitive declaration redacted>`.
- Line 188: `<sensitive declaration redacted>`.
- Line 191: `const brandingUpdate = await call("/api/tenant/branding", {`.
- Line 201: `const branding = await call("/api/tenant/branding", { tenantSlug: firstTenant.slug });`.
- Line 203: `const brandingPayload = await branding.json();`.
- Line 208: `const publicSettings = await call("/api/settings/public", { tenantSlug: firstTenant.slug });`.
- Line 210: `const publicSettingsPayload = await publicSettings.json();`.
- Line 215: `const destinationResponse = await call("/api/admin/destinations", {`.
- Line 220: `const destination = (await destinationResponse.json()).destination;`.
- Line 222: `const futureTourDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();`.
- Line 223: `const tourResponse = await call("/api/admin/tours", {`.
- Line 236: `const tour = (await tourResponse.json()).tour;`.
- Line 239: `<sensitive declaration redacted>`.
- Line 241: `const operationsSummaryData = (await operationsSummary.json()).data;`.
- Line 243: `const quoteDraft = await call("/api/tourmanager/copilot/quote-draft", {`.
- Line 257: `const invalidResponse = await call("/api/admin/packages", {`.
- Line 262: `const packageResponse = await call("/api/admin/packages", {`.
- Line 271: `const draftPackage = (await packageResponse.json()).package;`.
- Line 272: `const draftCatalogue = await call("/api/packages", { tenantSlug: firstTenant.slug });`.
- Line 274: `const publishPackage = await call(\`/api/admin/packages/${draftPackage._id}\`, {`.
- Line 278: `const createdPackage = (await publishPackage.json()).package;`.
- Line 280: `const publicCatalogue = await call("/api/destinations", { tenantSlug: firstTenant.slug });`.
- Line 283: `const publicPackages = await call("/api/packages", { tenantSlug: firstTenant.slug });`.
- Line 286: `const publicTours = await call("/api/tours", { tenantSlug: firstTenant.slug });`.
- Line 298: `const invalidResponse = await call(\`/api/admin/packages/${createdPackage._id}\`, {`.
- Line 303: `<sensitive declaration redacted>`.
- Line 304: `const unchangedPackage = (await unchangedPackageResponse.json()).packages.find((item) => item._id === createdPackage._id);`.
- Line 309: `const customerRegistration = await call("/api/auth/register", {`.
- Line 314: `const tenantIdCustomerLogin = await call("/api/auth/login", {`.
- Line 319: `const customerLogin = await call("/api/auth/login", {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

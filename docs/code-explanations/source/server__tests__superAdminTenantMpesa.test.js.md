# Source explanation: server/tests/superAdminTenantMpesa.test.js

**Source:** [server/tests/superAdminTenantMpesa.test.js](../../../server/tests/superAdminTenantMpesa.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `node:fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fileURLToPath` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createSuperAdminMpesaGatewayController` from `../controllers/superAdminMpesaGatewayController.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/controllers/superAdminMpesaGatewayController.js](../../../server/controllers/superAdminMpesaGatewayController.js)
- `superAdminOnly` from `../middleware/superAdminOnly.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/middleware/superAdminOnly.js](../../../server/middleware/superAdminOnly.js)
- `safeMpesaGatewayView`, `validateMpesaGatewaySettings` from `../services/mpesaGatewaySettings.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaGatewaySettings.js](../../../server/services/mpesaGatewaySettings.js)

## Runtime declarations and data flow

### `read` — lines 11–11

Parameters: `file`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `query` — lines 14–14

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `response` — lines 15–15

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `status` — lines 15–15

Parameters: `code`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `json` — lines 15–15

Parameters: `body`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `makeController` — lines 171–175

Parameters: `http`, `stored (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `run` — lines 176–180

Parameters: `controller`, `environment (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 177:** `const res = response();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 178:** `await controller.validate({ params: { tenantId }, body: { environment } }, res, (error) => { throw error; });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 179:** `return res.body.data;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 10: `const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");`.
- Line 11: `const read = (file) => fs.readFileSync(path.join(root, file), "utf8");`.
- Line 12: `const tenantId = "507f1f77bcf86cd799439011";`.
- Line 14: `const query = (value) => ({ select: () => ({ lean: async () => value }), lean: async () => value });`.
- Line 15: `const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });`.
- Line 18: `const routes = read("routes/superAdminRoutes.js");`.
- Line 26: `const denied = response();`.
- Line 27: `let continued = false;`.
- Line 31: `const allowed = response();`.
- Line 37: `const filters = [];`.
- Line 38: `let savedUpdate;`.
- Line 39: `const organization = { _id: tenantId, name: "Tenant A", slug: "tenant-a" };`.
- Line 40: `const organizations = { findById: (id) => { assert.equal(String(id), tenantId); return query(organization); } };`.
- Line 41: `const gateways = {`.
- Line 45: `const controller = createSuperAdminMpesaGatewayController({ organizations, gateways, tenantScope: (_context, callback) => callback(), validateSettings: () => null, encrypt: (value)`.
- Line 46: `const res = response();`.
- Line 60: `const invalidOrganizations = { findById: () => query(null) };`.
- Line 61: `const missingController = createSuperAdminMpesaGatewayController({ organizations: invalidOrganizations, gateways, tenantScope: (_context, callback) => callback() });`.
- Line 62: `const missing = response();`.
- Line 65: `const platformOrganization = { findById: () => query({ _id: tenantId, name: "Platform", slug: "platform", isSystem: true }) };`.
- Line 66: `const platformController = createSuperAdminMpesaGatewayController({ organizations: platformOrganization, gateways, tenantScope: (_context, callback) => callback() });`.
- Line 67: `const excluded = response();`.
- Line 70: `const platformSettingsController = createSuperAdminMpesaGatewayController({ organizations: { findById: () => query({ _id: tenantId, name: "Platform", slug: "platform-org", settings`.
- Line 71: `const platformSettings = response();`.
- Line 77: `const organizations = { findById: () => query({ _id: tenantId, name: "Tenant A", slug: "tenant-a" }) };`.
- Line 78: `let persisted = false;`.
- Line 79: `const gateways = {`.
- Line 83: `const controller = createSuperAdminMpesaGatewayController({ organizations, gateways, tenantScope: (_context, callback) => callback(), validateSettings: () => null });`.
- Line 84: `const res = response();`.
- Line 91: `let persisted = false;`.
- Line 92: `const controller = createSuperAdminMpesaGatewayController({`.
- Line 97: `const res = response();`.
- Line 104: `const encrypted = "ciphertext-must-not-return";`.
- Line 105: `const organizations = { findById: () => query({ _id: tenantId, name: "Tenant A", slug: "tenant-a" }) };`.
- Line 106: `const gateways = { findOne: () => query({`.
- Line 111: `const controller = createSuperAdminMpesaGatewayController({ organizations, gateways, tenantScope: (_context, callback) => callback() });`.
- Line 112: `const res = response();`.
- Line 114: `const serialized = JSON.stringify(res.body);`.
- Line 121: `const productionCallbackUrl = "https://hussein-mboya-tours.onrender.com/api/mpesa/callback";`.
- Line 122: `const shared = { productionCallbackUrl, sandboxCallbackUrl: productionCallbackUrl };`.
- Line 138: `const { getSandboxMpesaCallbackUrl } = await import("../services/mpesaGatewaySettings.js");`.
- Line 144: `const adminController = read("controllers/paymentGatewayController.js");`.
- Line 145: `const paymentService = read("services/paymentGatewayService.js");`.
- Line 152: `<sensitive declaration redacted>`.
- Line 158: `const routes = read("../client/src/routes/AppRoutes.jsx");`.
- Line 159: `const tenants = fs.readFileSync(path.resolve(root, "../client/src/pages/superadmin/SuperAdminTenants.jsx"), "utf8");`.
- Line 160: `const page = fs.readFileSync(path.resolve(root, "../client/src/pages/superadmin/SuperAdminTenantMpesa.jsx"), "utf8");`.
- Line 168: `const organization = { _id: tenantId, name: "Tenant A", slug: "tenant-a" };`.
- Line 169: `<sensitive declaration redacted>`.
- Line 170: `let requestedUrl; let requestOptions; let postCalls = 0;`.
- Line 171: `const makeController = (http, stored = config) => createSuperAdminMpesaGatewayController({`.
- Line 176: `const run = async (controller, environment = "sandbox") => {`.
- Line 177: `const res = response();`.
- Line 181: `<sensitive declaration redacted>`.
- Line 189: `const missing = await run(makeController({ get: async () => { throw new Error("must not call provider"); } }, { ...config, sandboxPasskeyEncrypted: "" }));`.
- Line 191: `<sensitive declaration redacted>`.
- Line 194: `const timeout = await run(makeController({ get: async () => { throw Object.assign(new Error("private raw detail"), { code: "ECONNABORTED" }); } }));`.
- Line 197: `<sensitive declaration redacted>`.
- Line 200: `<sensitive declaration redacted>`.
- Line 201: `<sensitive declaration redacted>`.
- Line 204: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

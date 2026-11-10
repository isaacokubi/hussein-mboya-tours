# Source explanation: server/controllers/superAdminMpesaGatewayController.js

**Source:** [server/controllers/superAdminMpesaGatewayController.js](../../../server/controllers/superAdminMpesaGatewayController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `PaymentGatewayConfig`, `decryptSecret`, `encryptSecret` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getEnvironmentMpesaSettings`, `safeMpesaGatewayView`, `validateMpesaGatewaySettings` from `../services/mpesaGatewaySettings.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaGatewaySettings.js](../../../server/services/mpesaGatewaySettings.js)
- `getMpesaUrls` from `../config/mpesa.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/mpesa.js](../../../server/config/mpesa.js)
- `axios` from `axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `createSuperAdminMpesaGatewayController` — lines 11–124

Parameters: `arg1 (defaulted)`.
Reads request/component inputs: req.params, req.query, req.body, req.user. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 17 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `const withTenant = (operation) => async (req, res, next) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 23:** `const tenantId = String(req.params.tenantId || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!mongoose.Types.ObjectId.isValid(tenantId)) return res.status(400).json({ success: false, message: "Invalid tenant ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const tenant = await tenantScope({ role: "super_admin", bypass: true }, () => organizations.findById(tenantId).select("_id name slug isSystem settings").lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `if (!tenant || String(tenant.slug || "").toLowerCase() === "platform" || tenant.isSystem === true || tenant.settings?.isPlatform === true || tenant.settings?.platform === true) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return res.status(404).json({ success: false, message: "Tenant not found." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `return await tenantScope({ tenantId: tenant._id, tenant, role: "admin", bypass: false }, () => operation(req, res, next, tenant));` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 33:** `const get = withTenant(async (req, res, _next, tenant) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const config = await gateways.findOne({ tenantId: tenant._id, provider: "MPESA" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 42:** `const save = withTenant(async (req, res, _next, tenant) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const body = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `if (!["sandbox", "production"].includes(String(body.environment || "").toLowerCase())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 47:** `if (typeof body.enabled !== "boolean") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `return res.status(400).json({ success: false, message: "Enabled must be a boolean." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `withTenant` — lines 21–31

Parameters: `operation`.
Reads request/component inputs: req.params. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 23:** `const tenantId = String(req.params.tenantId || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!mongoose.Types.ObjectId.isValid(tenantId)) return res.status(400).json({ success: false, message: "Invalid tenant ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const tenant = await tenantScope({ role: "super_admin", bypass: true }, () => organizations.findById(tenantId).select("_id name slug isSystem settings").lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `if (!tenant || String(tenant.slug || "").toLowerCase() === "platform" || tenant.isSystem === true || tenant.settings?.isPlatform === true || tenant.settings?.platform === true) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return res.status(404).json({ success: false, message: "Tenant not found." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `return await tenantScope({ tenantId: tenant._id, tenant, role: "admin", bypass: false }, () => operation(req, res, next, tenant));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `hasSecret` — lines 65–65

Parameters: `field`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `result` — lines 102–102

Parameters: `status`, `message`, `remoteVerified (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 102:** `(status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } })` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 9: `<sensitive declaration redacted>`.
- Line 11: `export const createSuperAdminMpesaGatewayController = ({`.
- Line 21: `const withTenant = (operation) => async (req, res, next) => {`.
- Line 23: `const tenantId = String(req.params.tenantId || "");`.
- Line 25: `const tenant = await tenantScope({ role: "super_admin", bypass: true }, () => organizations.findById(tenantId).select("_id name slug isSystem settings").lean());`.
- Line 33: `const get = withTenant(async (req, res, _next, tenant) => {`.
- Line 34: `const config = await gateways.findOne({ tenantId: tenant._id, provider: "MPESA" }).lean();`.
- Line 42: `const save = withTenant(async (req, res, _next, tenant) => {`.
- Line 43: `const body = req.body || {};`.
- Line 54: `const filter = { tenantId: tenant._id, provider: "MPESA" };`.
- Line 55: `const existing = await gateways.findOne(filter).lean();`.
- Line 56: `const environment = String(body.environment).toLowerCase();`.
- Line 57: `const envExisting = getEnvironmentMpesaSettings(existing || {}, environment);`.
- Line 58: `const callbackUrl = body.callbackUrl === undefined ? envExisting.callbackUrl : String(body.callbackUrl || "").trim();`.
- Line 59: `const shortcode = body.shortcode === undefined ? envExisting.shortcode : String(body.shortcode || "").trim();`.
- Line 60: `const settingsError = (body.enabled || callbackUrl)`.
- Line 65: `<sensitive declaration redacted>`.
- Line 70: `const update = {`.
- Line 83: `const config = await gateways.findOneAndUpdate(filter, { $set: update }, { new: true, upsert: true, runValidators: true }).lean();`.
- Line 87: `const disable = withTenant(async (req, res, _next, tenant) => {`.
- Line 88: `const config = await gateways.findOneAndUpdate(`.
- Line 97: `const validate = withTenant(async (req, res, _next, tenant) => {`.
- Line 98: `const environment = String(req.body?.environment || "").toLowerCase();`.
- Line 99: `const config = await gateways.findOne({ tenantId: tenant._id, provider: "MPESA" }).lean();`.
- Line 100: `const selected = getEnvironmentMpesaSettings(config || {}, environment);`.
- Line 101: `const timestamp = now().toISOString();`.
- Line 102: `const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });`.
- Line 104: `const callbackError = validateSettings({ environment, callbackUrl: selected.callbackUrl });`.
- Line 106: `<sensitive declaration redacted>`.
- Line 111: `const urls = getMpesaUrls(environment);`.
- Line 112: `<sensitive declaration redacted>`.
- Line 113: `const response = await http.get(urls.auth, { headers: { Authorization: \`Basic ${auth}\` }, timeout: 8000, maxRedirects: 0 });`.
- Line 117: `const status = Number(error?.response?.status);`.
- Line 126: `const controller = createSuperAdminMpesaGatewayController();`.
- Line 127: `export const getSuperAdminTenantMpesa = controller.get;`.
- Line 128: `export const saveSuperAdminTenantMpesa = controller.save;`.
- Line 129: `export const disableSuperAdminTenantMpesa = controller.disable;`.
- Line 130: `export const validateSuperAdminTenantMpesa = controller.validate;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

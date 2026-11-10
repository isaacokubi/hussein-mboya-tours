# Source explanation: server/controllers/paymentGatewayController.js

**Source:** [server/controllers/paymentGatewayController.js](../../../server/controllers/paymentGatewayController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `PaymentGatewayConfig`, `encryptSecret` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getEnvironmentMpesaSettings`, `validateMpesaGatewaySettings` from `../services/mpesaGatewaySettings.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaGatewaySettings.js](../../../server/services/mpesaGatewaySettings.js)
- `getMpesaUrls` from `../config/mpesa.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/mpesa.js](../../../server/config/mpesa.js)
- `decryptSecret` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)
- `axios` from `axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getPaypalEnvironmentSettings`, `getPaypalAccessToken` from `../services/paypalService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paypalService.js](../../../server/services/paypalService.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `isPaypalCurrencySupported`, `isStripeRuntimeEnvironmentValid` from `../services/tenantPaymentMethods.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tenantPaymentMethods.js](../../../server/services/tenantPaymentMethods.js)

## Runtime declarations and data flow

### `listGatewayConfigs` — lines 17–35

Parameters: `req`, `res`, `next`.
Persistent operations detected: PaymentGatewayConfig.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 18:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 20:** `const configs = await PaymentGatewayConfig.find({})` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `return res.json({ success: true, data: configs.map((c) => ({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `upsertGatewayConfig` — lines 37–141

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: PaymentGatewayConfig.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 20 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 38:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 39:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const provider = String(req.params.provider || "").toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `const body = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `if (["MPESA", "PAYPAL"].includes(provider) && !["sandbox", "production"].includes(String(body.environment || "sandbox").toLowerCase())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 47:** `const existing = ["MPESA", "PAYPAL"].includes(provider) ? await PaymentGatewayConfig.findOne({ tenantId, provider }).lean() : null;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `const environment = String(body.environment || existing?.environment || "sandbox").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const envExisting = provider === "MPESA" ? getEnvironmentMpesaSettings(existing || {}, environment) : {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const update = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `if (provider === "MPESA" && update.enabled) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 78:** `if (provider === "MPESA" && (update.enabled || update.callbackUrl)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `const validationError = validateMpesaGatewaySettings({ environment: update.environment, callbackUrl: update.callbackUrl });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getGatewayConfig` — lines 143–175

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.query. Persistent operations detected: PaymentGatewayConfig.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 144:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 145:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 146:** `const provider = String(req.params.provider || "").toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 147:** `if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 148:** `const config = await PaymentGatewayConfig.findOne({ tenantId, provider }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 149:** `if (!config) return res.json({ success: true, data: { provider, configured: false, enabled: false } });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 150:** `const requestedEnvironment = String(req.query?.environment || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 151:** `if (provider === "MPESA" && requestedEnvironment && !["sandbox", "production"].includes(requestedEnvironment)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 152:** `return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 154:** `if (provider === "PAYPAL" && requestedEnvironment && !["sandbox", "production"].includes(requestedEnvironment)) return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 155:** `const environment = ["MPESA", "PAYPAL"].includes(provider) ? requestedEnvironment || config.environment || "sandbox" : config.environment;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 156:** `const environmentSettings = provider === "MPESA" ? getEnvironmentMpesaSettings(config, environment) : {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 157:** `const paypalSettings = provider === "PAYPAL" ? getPaypalEnvironmentSettings(config, environment) : {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 158:** `const tenantSettings = provider === "PAYPAL" ? await getSystemSettings(req) : null;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 159:** `const paypalCheckoutAvailable = provider === "PAYPAL" && Boolean(config.enabled && config.environment === environment && paypalSettings.configured && paypalSettings.validatedAt && isPaypalCurrencySupported(tenantSettings` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 160:** `return res.json({ success: true, data: {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `disableGatewayConfig` — lines 177–190

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 178:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 179:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 180:** `const provider = String(req.params.provider || "").toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 181:** `if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 182:** `const config = await PaymentGatewayConfig.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 187:** `if (!config) return res.status(404).json({ success: false, message: "Payment gateway configuration not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 188:** `return res.json({ success: true, message: \`${provider} has been disabled.\` });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateMpesaGateway` — lines 192–214

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: PaymentGatewayConfig.findOne; verify tenant/ownership filters in the exact query. HTTP operations detected: axios.get; response/error handling occurs in this function and its caller. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 193:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 194:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 195:** `const environment = String(req.body?.environment || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 196:** `const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 197:** `const selected = getEnvironmentMpesaSettings(config || {}, environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 198:** `const timestamp = new Date().toISOString();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 199:** `const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 200:** `if (!config || !["sandbox", "production"].includes(environment)) return result("invalid", "Select sandbox or production and save its settings first.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 201:** `const callbackError = validateMpesaGatewaySettings({ environment, callbackUrl: selected.callbackUrl });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 202:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 203:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 204:** Sensitive-configuration/data operation; inspect source without copying secret values. — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 205:** Sensitive-configuration/data operation; inspect source without copying secret values. — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.
- **Line 206:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 207:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 209:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 210:** `if (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) return res.json({ success: true, data: { status: "unverified", environment: req.body?.environment, timestamp: new Date().toISOString(), remoteVerified: false, mess` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 211:** `if (error?.response) return res.json({ success: true, data: { status: "provider_error", environment: req.body?.environment, timestamp: new Date().toISOString(), remoteVerified: false, message: \`Daraja returned HTTP ${Nu` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `result` — lines 199–199

Parameters: `status`, `message`, `remoteVerified (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 199:** `(status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } })` — Sends a JSON response; inspect its caller for status and error semantics.

### `validateStripeGateway` — lines 216–232

Parameters: `req`, `res`, `next`.
HTTP operations detected: axios.get; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 217:** `const timestamp = new Date().toISOString();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 218:** Sensitive-configuration/data operation; inspect source without copying secret values. — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 219:** Sensitive-configuration/data operation; inspect source without copying secret values. — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 220:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 221:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 222:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 223:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 224:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 225:** `return response.data?.id ? result("connected", "Stripe API connectivity verified. No payment was initiated.", true) : result("provider_error", "Stripe did not return account metadata.");` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 227:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 228:** `if (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) return result("unverified", "Stripe validation timed out. Connectivity remains unverified.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 229:** `if (error?.response) return result("provider_error", \`Stripe returned HTTP ${Number(error.response.status) || 0}.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 230:** `return result("unverified", "Stripe could not be reached. Connectivity remains unverified.");` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `result` — lines 218–218

Parameters: `status`, `message`, `remoteVerified (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 218:** Sensitive-configuration/data operation; inspect source without copying secret values. — Sends a JSON response; inspect its caller for status and error semantics.

### `validatePaypalGateway` — lines 234–258

Parameters: `req`, `res`.
Reads request/component inputs: req.body. Persistent operations detected: PaymentGatewayConfig.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 235:** `const environment = String(req.body?.environment || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 236:** `const timestamp = new Date().toISOString();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 237:** `const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 238:** `if (!["sandbox", "production"].includes(environment)) return result("invalid", "Select sandbox or production and save its settings first.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 239:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 240:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 241:** `const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 242:** `const selected = getPaypalEnvironmentSettings(config || {}, environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 243:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 244:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 245:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 247:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 248:** `if (error?.name === "TimeoutError" || error?.name === "AbortError") return result("unverified", "PayPal validation timed out. Connectivity remains unverified.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 249:** `if (error?.status) return result("provider_error", \`PayPal returned HTTP ${Number(error.status) || 0}.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 250:** `return result("unverified", "PayPal could not be reached. Connectivity remains unverified.");` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 253:** `await config.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 254:** `return result("connected", "PayPal OAuth connectivity verified. No order or payment was created.", true);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 256:** `return result("unverified", "PayPal validation could not be completed. Check the selected configuration and retry.");` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `result` — lines 237–237

Parameters: `status`, `message`, `remoteVerified (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 237:** `(status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } })` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 11: `<sensitive declaration redacted>`.
- Line 15: `const ALLOWED_PROVIDERS = ["MPESA", "STRIPE", "PAYPAL", "PESAPAL", "BANK"];`.
- Line 17: `export const listGatewayConfigs = async (req, res, next) => {`.
- Line 20: `const configs = await PaymentGatewayConfig.find({})`.
- Line 37: `export const upsertGatewayConfig = async (req, res, next) => {`.
- Line 39: `const tenantId = requireTenantId();`.
- Line 40: `const provider = String(req.params.provider || "").toUpperCase();`.
- Line 43: `const body = req.body || {};`.
- Line 47: `const existing = ["MPESA", "PAYPAL"].includes(provider) ? await PaymentGatewayConfig.findOne({ tenantId, provider }).lean() : null;`.
- Line 48: `const environment = String(body.environment || existing?.environment || "sandbox").toLowerCase();`.
- Line 49: `const envExisting = provider === "MPESA" ? getEnvironmentMpesaSettings(existing || {}, environment) : {};`.
- Line 50: `const update = {`.
- Line 63: `<sensitive declaration redacted>`.
- Line 67: `<sensitive declaration redacted>`.
- Line 79: `const validationError = validateMpesaGatewaySettings({ environment: update.environment, callbackUrl: update.callbackUrl });`.
- Line 97: `const prefix = environment === "sandbox" ? "sandbox" : "production";`.
- Line 98: `const oldPaypal = getPaypalEnvironmentSettings(existing || {}, environment);`.
- Line 99: `const clientIdProvided = typeof body.clientId === "string" && body.clientId.trim() !== "";`.
- Line 100: `<sensitive declaration redacted>`.
- Line 101: `const clientId = clientIdProvided ? body.clientId.trim() : oldPaypal.clientId;`.
- Line 102: `<sensitive declaration redacted>`.
- Line 103: `const webhookId = body.webhookId === undefined ? oldPaypal.webhookId : String(body.webhookId || "").trim();`.
- Line 104: `const merchantId = body.merchantId === undefined ? oldPaypal.merchantId : String(body.merchantId || "").trim();`.
- Line 109: `<sensitive declaration redacted>`.
- Line 122: `const config = await PaymentGatewayConfig.findOneAndUpdate(`.
- Line 128: `const configuredSettings = provider === "MPESA" ? getEnvironmentMpesaSettings(config, environment) : {};`.
- Line 129: `const paypalSettings = provider === "PAYPAL" ? getPaypalEnvironmentSettings(config, environment) : {};`.
- Line 130: `const configured = provider === "MPESA"`.
- Line 143: `export const getGatewayConfig = async (req, res, next) => {`.
- Line 145: `const tenantId = requireTenantId();`.
- Line 146: `const provider = String(req.params.provider || "").toUpperCase();`.
- Line 148: `const config = await PaymentGatewayConfig.findOne({ tenantId, provider }).lean();`.
- Line 150: `const requestedEnvironment = String(req.query?.environment || "").toLowerCase();`.
- Line 155: `const environment = ["MPESA", "PAYPAL"].includes(provider) ? requestedEnvironment || config.environment || "sandbox" : config.environment;`.
- Line 156: `const environmentSettings = provider === "MPESA" ? getEnvironmentMpesaSettings(config, environment) : {};`.
- Line 157: `const paypalSettings = provider === "PAYPAL" ? getPaypalEnvironmentSettings(config, environment) : {};`.
- Line 158: `const tenantSettings = provider === "PAYPAL" ? await getSystemSettings(req) : null;`.
- Line 159: `const paypalCheckoutAvailable = provider === "PAYPAL" && Boolean(config.enabled && config.environment === environment && paypalSettings.configured && paypalSettings.validatedAt && `.
- Line 177: `export const disableGatewayConfig = async (req, res, next) => {`.
- Line 179: `const tenantId = requireTenantId();`.
- Line 180: `const provider = String(req.params.provider || "").toUpperCase();`.
- Line 182: `const config = await PaymentGatewayConfig.findOneAndUpdate(`.
- Line 192: `export const validateMpesaGateway = async (req, res, next) => {`.
- Line 194: `const tenantId = requireTenantId();`.
- Line 195: `const environment = String(req.body?.environment || "").toLowerCase();`.
- Line 196: `const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();`.
- Line 197: `const selected = getEnvironmentMpesaSettings(config || {}, environment);`.
- Line 198: `const timestamp = new Date().toISOString();`.
- Line 199: `const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });`.
- Line 201: `const callbackError = validateMpesaGatewaySettings({ environment, callbackUrl: selected.callbackUrl });`.
- Line 203: `<sensitive declaration redacted>`.
- Line 206: `<sensitive declaration redacted>`.
- Line 216: `export const validateStripeGateway = async (req, res, next) => {`.
- Line 217: `const timestamp = new Date().toISOString();`.
- Line 218: `<sensitive declaration redacted>`.
- Line 219: `<sensitive declaration redacted>`.
- Line 224: `<sensitive declaration redacted>`.
- Line 234: `export const validatePaypalGateway = async (req, res) => {`.
- Line 235: `const environment = String(req.body?.environment || "").toLowerCase();`.
- Line 236: `const timestamp = new Date().toISOString();`.
- Line 237: `const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });`.
- Line 240: `const tenantId = requireTenantId();`.
- Line 241: `const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" });`.
- Line 242: `const selected = getPaypalEnvironmentSettings(config || {}, environment);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

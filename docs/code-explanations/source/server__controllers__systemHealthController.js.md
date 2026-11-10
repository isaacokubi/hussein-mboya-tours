# Source explanation: server/controllers/systemHealthController.js

**Source:** [server/controllers/systemHealthController.js](../../../server/controllers/systemHealthController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `axios` from `axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `cloudinary` from `../config/cloudinary.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/cloudinary.js](../../../server/config/cloudinary.js)
- `getTenantMpesaConfig`, `getTenantMpesaUrls` from `../services/paymentGatewayService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentGatewayService.js](../../../server/services/paymentGatewayService.js)

## Runtime declarations and data flow

### `checkCloudinary` — lines 7–22

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 9:** `const configured = Boolean(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (!configured) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 17:** `await cloudinary.api.ping();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `return { status: "connected", message: "Cloudinary is reachable" };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 20:** `return { status: "unavailable", message: "Cloudinary is configured but the connection check failed" };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `checkMpesa` — lines 24–49

Parameters: none.
HTTP operations detected: axios.get; response/error handling occurs in this function and its caller. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 26:** `const config = await getTenantMpesaConfig();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const urls = getTenantMpesaUrls(config);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const { data } = await axios.get(urls.auth, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 40:** `const message = String(error?.message || "M-Pesa gateway check failed");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getSystemHealth` — lines 51–73

Parameters: `req`, `res`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 52:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 53:** `const memory = process.memoryUsage();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const [cloudinaryCheck, mpesaCheck] = await Promise.all([checkCloudinary(), checkMpesa()]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `const system = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `return res.json({ success: true, ...system, system });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 71:** `return res.status(500).json({ success: false, message: publicErrorMessage(error) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `healthCheck` — lines 77–77

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const checkCloudinary = async () => {`.
- Line 9: `const configured = Boolean(`.
- Line 24: `const checkMpesa = async () => {`.
- Line 26: `const config = await getTenantMpesaConfig();`.
- Line 27: `<sensitive declaration redacted>`.
- Line 28: `const urls = getTenantMpesaUrls(config);`.
- Line 29: `const { data } = await axios.get(urls.auth, {`.
- Line 40: `const message = String(error?.message || "M-Pesa gateway check failed");`.
- Line 41: `<sensitive declaration redacted>`.
- Line 51: `export const getSystemHealth = async (req, res) => {`.
- Line 53: `const memory = process.memoryUsage();`.
- Line 54: `const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";`.
- Line 55: `const [cloudinaryCheck, mpesaCheck] = await Promise.all([checkCloudinary(), checkMpesa()]);`.
- Line 56: `const system = {`.
- Line 77: `export const healthCheck = async (req, res) => getSystemHealth(req, res);`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

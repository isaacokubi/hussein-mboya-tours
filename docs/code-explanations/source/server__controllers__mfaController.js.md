# Source explanation: server/controllers/mfaController.js

**Source:** [server/controllers/mfaController.js](../../../server/controllers/mfaController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `createAuditLog` from `../services/auditService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/auditService.js](../../../server/services/auditService.js)
- `generateLoginPin`, `hashLoginPin`, `verifyLoginPin`, `normalizeMfaPhone` from `../services/mfaService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mfaService.js](../../../server/services/mfaService.js)
- `sendSMS` from `../services/smsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/smsService.js](../../../server/services/smsService.js)
- `generateToken` from `../utils/generateToken.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/generateToken.js](../../../server/utils/generateToken.js)
- `buildPermissions` from `../utils/buildPermissions.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/buildPermissions.js](../../../server/utils/buildPermissions.js)
- `setAuthCookie` from `../utils/authCookie.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/authCookie.js](../../../server/utils/authCookie.js)

## Runtime declarations and data flow

### `isCustomer` — lines 14–17

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 15:** `const role = String(user?.roleId?.name || user?.role || user?.legacyRole || "").trim().toLowerCase().replace(/[\s-]+/g, "_");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `return role === "customer";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createCustomerLoginChallenge` — lines 19–62

Parameters: `user`.
Persistent operations detected: Organization.findById; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `if (!user?._id) throw new Error("Invalid MFA user.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const phone = normalizeMfaPhone(user.phone);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `if (!phone) throw new Error("This account does not have a valid registered phone number.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const now = Date.now();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (user.loginPinLastSentAt && now - new Date(user.loginPinLastSentAt).getTime() < MFA_RESEND_DELAY_MS) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `throw new Error("Please wait before requesting another verification PIN.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 29:** `const pin = generateLoginPin();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `await user.save({ validateBeforeSave: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 37:** `let companyName = "Your Travel Company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (user.tenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const organization = await Organization.findById(user.tenantId)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `if (organization?.name) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `await sendSMS(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 57:** `await user.save({ validateBeforeSave: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 58:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 61:** `return { userId: user._id, phone, pin };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendCustomerLoginPin` — lines 64–85

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 66:** `const userId = String(req.body?.userId || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `if (!userId) return res.status(400).json({ success: false, message: "MFA user ID is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `const user = await User.findById(userId).select("+loginPinHash +loginPinExpiresAt +loginPinAttempts +loginPinLastSentAt");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `if (!user || !isCustomer(user)) return res.status(401).json({ success: false, message: "Invalid MFA request." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `const challenge = await createCustomerLoginChallenge(user);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 82:** `if (error.message.includes("wait before requesting")) return res.status(429).json({ success: false, message: error.message });` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `verifyCustomerLoginPin` — lines 87–160

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 88:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 89:** `const userId = String(req.body?.userId || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const pin = String(req.body?.pin || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `if (!userId || !/^\d{4}$/.test(pin)) return res.status(400).json({ success: false, message: "User ID and 4-digit PIN are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `const user = await User.findById(userId)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 98:** `if (!user || !isCustomer(user)) return res.status(401).json({ success: false, message: "Invalid MFA request." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `if (!user.loginPinHash || !user.loginPinExpiresAt) return res.status(400).json({ success: false, message: "No active login PIN exists. Request a new PIN." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 101:** `if (new Date(user.loginPinExpiresAt).getTime() < Date.now()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `await user.save({ validateBeforeSave: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 106:** `return res.status(401).json({ success: false, message: "The login PIN has expired. Request a new PIN." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 109:** `const attempts = Number(user.loginPinAttempts || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `if (attempts >= MAX_MFA_ATTEMPTS) return res.status(429).json({ success: false, message: "Too many incorrect PIN attempts. Request a new PIN." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 112:** `const valid = await verifyLoginPin(pin, user.loginPinHash);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 113:** `if (!valid) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 115:** `await user.save({ validateBeforeSave: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 116:** `return res.status(401).json({ success: false, message: "Incorrect verification PIN.", attemptsRemaining: Math.max(0, MAX_MFA_ATTEMPTS - user.loginPinAttempts) });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 119:** `const permissions = buildPermissions(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 120:** `const effectiveRole = String(user.roleId?.name || user.role || user.legacyRole || "customer").trim().toLowerCase().replace(/[\s-]+/g, "_");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 10: `const MAX_MFA_ATTEMPTS = 5;`.
- Line 11: `const MFA_EXPIRY_MS = 5 * 60 * 1000;`.
- Line 12: `const MFA_RESEND_DELAY_MS = 30 * 1000;`.
- Line 14: `const isCustomer = (user) => {`.
- Line 15: `const role = String(user?.roleId?.name || user?.role || user?.legacyRole || "").trim().toLowerCase().replace(/[\s-]+/g, "_");`.
- Line 19: `export const createCustomerLoginChallenge = async (user) => {`.
- Line 21: `const phone = normalizeMfaPhone(user.phone);`.
- Line 24: `const now = Date.now();`.
- Line 29: `const pin = generateLoginPin();`.
- Line 37: `let companyName = "Your Travel Company";`.
- Line 40: `const organization = await Organization.findById(user.tenantId)`.
- Line 64: `export const sendCustomerLoginPin = async (req, res, next) => {`.
- Line 66: `const userId = String(req.body?.userId || "").trim();`.
- Line 68: `const user = await User.findById(userId).select("+loginPinHash +loginPinExpiresAt +loginPinAttempts +loginPinLastSentAt");`.
- Line 71: `const challenge = await createCustomerLoginChallenge(user);`.
- Line 87: `export const verifyCustomerLoginPin = async (req, res, next) => {`.
- Line 89: `const userId = String(req.body?.userId || "").trim();`.
- Line 90: `const pin = String(req.body?.pin || "").trim();`.
- Line 93: `const user = await User.findById(userId)`.
- Line 109: `const attempts = Number(user.loginPinAttempts || 0);`.
- Line 112: `const valid = await verifyLoginPin(pin, user.loginPinHash);`.
- Line 119: `const permissions = buildPermissions(user);`.
- Line 120: `const effectiveRole = String(user.roleId?.name || user.role || user.legacyRole || "customer").trim().toLowerCase().replace(/[\s-]+/g, "_");`.
- Line 130: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

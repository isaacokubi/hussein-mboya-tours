# Source explanation: server/services/smsService.js

**Source:** [server/services/smsService.js](../../../server/services/smsService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `AfricasTalking` from `africastalking`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `isLocalSmsFallbackEnabled` — lines 10–12

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getSMSClient` — lines 14–25

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** Sensitive-configuration/data operation; inspect source without copying secret values. — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 19:** `const africasTalking = AfricasTalking({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `return africasTalking.SMS;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendSMS` — lines 33–72

Parameters: `phone`, `message`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `if (!phone) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `throw new Error("Phone number is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 38:** `if (!message) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `throw new Error("SMS message is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 42:** `const normalizedPhone = /^0\d{9}$/.test(String(phone).trim())` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `return { devMode: true, phone: normalizedPhone, message };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 55:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 56:** `const sms = getSMSClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `const response = await sms.send({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `return response;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 70:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.

### `sendBulkSMS` — lines 80–106

Parameters: `phones`, `message`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 81:** `if (!Array.isArray(phones) || phones.length === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `throw new Error("At least one phone number is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 85:** `if (!message) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `throw new Error("SMS message is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 89:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 90:** `const sms = getSMSClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `const response = await sms.send({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 98:** `return response;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 104:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.

## Module-level declarations

- Line 10: `const isLocalSmsFallbackEnabled = () =>`.
- Line 14: `const getSMSClient = () => {`.
- Line 19: `const africasTalking = AfricasTalking({`.
- Line 33: `export const sendSMS = async (phone, message) => {`.
- Line 42: `const normalizedPhone = /^0\d{9}$/.test(String(phone).trim())`.
- Line 56: `const sms = getSMSClient();`.
- Line 57: `const response = await sms.send({`.
- Line 80: `export const sendBulkSMS = async (phones, message) => {`.
- Line 90: `const sms = getSMSClient();`.
- Line 91: `const response = await sms.send({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

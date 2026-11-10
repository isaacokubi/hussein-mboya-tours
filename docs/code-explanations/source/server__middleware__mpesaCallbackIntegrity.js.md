# Source explanation: server/middleware/mpesaCallbackIntegrity.js

**Source:** [server/middleware/mpesaCallbackIntegrity.js](../../../server/middleware/mpesaCallbackIntegrity.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `SubscriptionPayment` from `../models/SubscriptionPayment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SubscriptionPayment.js](../../../server/models/SubscriptionPayment.js)
- `queryStkPush`, `classifyStkQueryResult` from `../services/mpesaQueryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaQueryService.js](../../../server/services/mpesaQueryService.js)
- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getTenantMpesaConfig` from `../services/paymentGatewayService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentGatewayService.js](../../../server/services/paymentGatewayService.js)
- `hasLegacyMpesaConfig`, `mpesaConfig` from `../config/mpesa.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/mpesa.js](../../../server/config/mpesa.js)
- `getCheckoutRequestId`, `getStkCallback`, `validateStkCallback` from `../services/mpesaCallbackPayload.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaCallbackPayload.js](../../../server/services/mpesaCallbackPayload.js)

## Runtime declarations and data flow

### `validateMpesaCallbackPayload` — lines 9–13

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `const validationError = validateStkCallback(getStkCallback(req.body));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (validationError) return res.status(400).json({ ResultCode: 1, ResultDesc: validationError });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createVerifyMpesaCallbackIntegrity` — lines 15–56

Parameters: `arg1 (defaulted)`.
Reads request/component inputs: req.body, req.tenantId, req.tenant. Persistent operations detected: Payment.findOne, SubscriptionPayment.findOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `findPayment = (filter) => Payment.findOne(filter).select("_id providerEnvironment").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 17:** `findSubscriptionPayment = (filter) => SubscriptionPayment.findOne(filter).select("_id").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 22:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 23:** `const callback = getStkCallback(req.body);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const validationError = validateStkCallback(callback);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (validationError) return res.status(400).json({ ResultCode: 1, ResultDesc: validationError });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const checkoutRequestID = getCheckoutRequestId(callback);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const tenantId = String(req.tenantId || req.tenant?.tenantId || req.tenant?.id || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const payment = tenantId` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const subscriptionPayment = tenantId` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (!payment && !subscriptionPayment) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `return res.status(400).json({ ResultCode: 1, ResultDesc: "Unknown CheckoutRequestID." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 41:** `const config = subscriptionPayment && legacyConfigCheck() ? legacyConfig : undefined;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const paymentConfig = payment?.providerEnvironment` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const queryResult = await providerQuery(checkoutRequestID, paymentConfig || config);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `const providerState = classifyStkQueryResult(queryResult?.ResultCode);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const callbackState = classifyStkQueryResult(callback.ResultCode);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (providerState === "pending" || callbackState !== providerState) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 9: `export const validateMpesaCallbackPayload = (req, res, next) => {`.
- Line 10: `const validationError = validateStkCallback(getStkCallback(req.body));`.
- Line 15: `export const createVerifyMpesaCallbackIntegrity = ({`.
- Line 23: `const callback = getStkCallback(req.body);`.
- Line 24: `const validationError = validateStkCallback(callback);`.
- Line 27: `const checkoutRequestID = getCheckoutRequestId(callback);`.
- Line 29: `const tenantId = String(req.tenantId || req.tenant?.tenantId || req.tenant?.id || "").trim();`.
- Line 30: `const payment = tenantId`.
- Line 33: `const subscriptionPayment = tenantId`.
- Line 41: `const config = subscriptionPayment && legacyConfigCheck() ? legacyConfig : undefined;`.
- Line 42: `const paymentConfig = payment?.providerEnvironment`.
- Line 45: `const queryResult = await providerQuery(checkoutRequestID, paymentConfig || config);`.
- Line 46: `const providerState = classifyStkQueryResult(queryResult?.ResultCode);`.
- Line 47: `const callbackState = classifyStkQueryResult(callback.ResultCode);`.
- Line 58: `export const verifyMpesaCallbackIntegrity = createVerifyMpesaCallbackIntegrity();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

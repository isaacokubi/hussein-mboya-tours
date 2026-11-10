# Source explanation: server/middleware/resourceTenantGuard.js

**Source:** [server/middleware/resourceTenantGuard.js](../../../server/middleware/resourceTenantGuard.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `requireTenantId`, `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `validId` — lines 9–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `fail` — lines 10–10

Parameters: `res`, `status`, `message`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 10:** `(res, status, message) => res.status(status).json({ success: false, message })` — Builds an HTTP response with an explicit status and JSON payload.

### `guardBookingResources` — lines 12–61

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Booking.findOne, Staff.findOne, Vehicle.findOne, Agent.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 15 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 15:** `if (!validId(req.params.id)) return fail(res, 400, "Invalid booking ID.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `if (!booking) return fail(res, 404, "Booking not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const ids = { guide: req.body?.guide, driver: req.body?.driver, vehicle: req.body?.vehicle, agent: req.body?.agent };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `for (const [name, id] of Object.entries(ids)) if (id && !validId(id)) return fail(res, 400, \`Invalid ${name} ID.\`);` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 24:** `const [guideDoc, driverDoc, vehicleDoc, agentDoc] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `ids.guide ? Staff.findOne(mergeTenantFilter(req, { _id: ids.guide, position: "guide", status: "active", isDeleted: { $ne: true } })).lean() : null,` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 26:** `ids.driver ? Staff.findOne(mergeTenantFilter(req, { _id: ids.driver, position: "driver", status: "active", isDeleted: { $ne: true } })).lean() : null,` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 27:** `ids.vehicle ? Vehicle.findOne(mergeTenantFilter(req, { _id: ids.vehicle, isActive: true, isDeleted: { $ne: true } })).lean() : null,` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 28:** `ids.agent ? Agent.findOne(mergeTenantFilter(req, { _id: ids.agent, status: { $ne: "deleted" } })).lean() : null,` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 31:** `if ((ids.guide && !guideDoc) || (ids.driver && !driverDoc) || (ids.vehicle && !vehicleDoc) || (ids.agent && !agentDoc)) return fail(res, 409, "One or more assigned resources do not belong to this tenant or are unavailabl` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `if (vehicleDoc && ["maintenance", "out_of_service"].includes(vehicleDoc.status)) return fail(res, 409, "Vehicle is not available for assignment.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `if (guideDoc && guideDoc.availability && !["available", "busy"].includes(guideDoc.availability)) return fail(res, 409, "Guide is not available for assignment.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `if (driverDoc && driverDoc.availability && !["available", "busy"].includes(driverDoc.availability)) return fail(res, 409, "Driver is not available for assignment.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `const resourceChecks = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const start = new Date(booking.travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (!Number.isNaN(start.getTime())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `guardPaymentRefund` — lines 63–83

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 66:** `if (!validId(req.params.id)) return fail(res, 400, "Invalid payment ID.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 67:** `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 70:** `if (!payment) return fail(res, 404, "Payment not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `if (payment.status !== "completed") return fail(res, 409, "Only completed payments can be refunded.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `if (["processing", "completed"].includes(payment.refundStatus)) return fail(res, 409, "A refund is already in progress or completed for this payment.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `const paid = Number(payment.amount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `const alreadyRefunded = Number(payment.refundedAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const requested = Number(req.body?.amount || paid - alreadyRefunded);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `const remaining = Math.max(0, paid - alreadyRefunded);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `if (!Number.isFinite(requested) || requested <= 0 || requested > remaining) return fail(res, 400, \`Invalid refund amount. Maximum refundable amount is ${remaining}.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 9: `const validId = (value) => Boolean(value) && mongoose.Types.ObjectId.isValid(value);`.
- Line 10: `const fail = (res, status, message) => res.status(status).json({ success: false, message });`.
- Line 12: `export const guardBookingResources = async (req, res, next) => {`.
- Line 16: `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }))`.
- Line 21: `const ids = { guide: req.body?.guide, driver: req.body?.driver, vehicle: req.body?.vehicle, agent: req.body?.agent };`.
- Line 24: `const [guideDoc, driverDoc, vehicleDoc, agentDoc] = await Promise.all([`.
- Line 36: `const resourceChecks = [`.
- Line 41: `const start = new Date(booking.travelDate);`.
- Line 44: `const end = new Date(start); end.setDate(end.getDate() + 1);`.
- Line 47: `const conflict = await Booking.findOne(mergeTenantFilter(req, {`.
- Line 63: `export const guardPaymentRefund = async (req, res, next) => {`.
- Line 67: `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }))`.
- Line 74: `const paid = Number(payment.amount || 0);`.
- Line 75: `const alreadyRefunded = Number(payment.refundedAmount || 0);`.
- Line 76: `const requested = Number(req.body?.amount || paid - alreadyRefunded);`.
- Line 77: `const remaining = Math.max(0, paid - alreadyRefunded);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

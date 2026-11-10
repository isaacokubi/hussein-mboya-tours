# Source explanation: server/controllers/commissionController.js

**Source:** [server/controllers/commissionController.js](../../../server/controllers/commissionController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)

## Runtime declarations and data flow

### `commissionQuery` — lines 8–24

Parameters: `req`.
Persistent operations detected: Commission.find; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 9:** `Commission.find(tenantFilter(req, { isDeleted: { $ne: true } }))` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `serializeCommission` — lines 26–61

Parameters: `commission`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 27:** `const item = commission?.toObject ? commission.toObject({ virtuals: true }) : commission;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const agent = item?.agent || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const booking = item?.booking || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const user = agent?.user || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCommissions` — lines 63–72

Parameters: `req`, `res`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 65:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 66:** `const commissions = await commissionQuery(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 67:** `return res.json({ success: true, data: commissions.map(serializeCommission) });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 70:** `return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAgentCommissions` — lines 74–104

Parameters: `req`, `res`.
Reads request/component inputs: req.params. Persistent operations detected: Commission.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 76:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 77:** `if (!mongoose.isValidObjectId(req.params.agentId)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `return res.status(400).json({ success: false, message: "Invalid agent ID." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 80:** `const commissions = await Commission.find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 99:** `return res.json({ success: true, data: commissions.map(serializeCommission) });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 102:** `return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `approveCommission` — lines 106–125

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Commission.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 107:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 108:** `const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 109:** `if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 110:** `if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 111:** `if (!["pending"].includes(commission.status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 112:** `return res.status(400).json({ success: false, message: "Only pending commissions can be approved." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 119:** `await commission.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 121:** `return res.json({ success: true, message: "Commission approved.", data: commission });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `payCommission` — lines 127–187

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params, req.user. Persistent operations detected: Commission.findOne, Agent.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 128:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 129:** `const { paymentMethod = "MPESA", paymentReference = "", transactionId = "", notes = "" } = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 130:** `const allowedMethods = ["BANK_TRANSFER", "MPESA", "CASH", "CHEQUE"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 131:** `if (!allowedMethods.includes(paymentMethod)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 132:** `return res.status(400).json({ success: false, message: "Invalid commission payment method." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 134:** `const normalizedReference = String(paymentReference || transactionId || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 135:** `if (!normalizedReference) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 136:** `return res.status(400).json({ success: false, message: "A payment reference or transaction ID is required." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 139:** `const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 140:** `if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 141:** `if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 142:** `if (!["approved", "processing"].includes(commission.status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 143:** `return res.status(400).json({ success: false, message: "Only an approved or processing commission can be paid." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 146:** `const duplicatePayment = await Commission.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 157:** `if (duplicatePayment) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 158:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 171:** `if (notes) commission.financeNotes = String(notes).trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 172:** `await commission.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 8: `const commissionQuery = (req) =>`.
- Line 26: `const serializeCommission = (commission) => {`.
- Line 27: `const item = commission?.toObject ? commission.toObject({ virtuals: true }) : commission;`.
- Line 28: `const agent = item?.agent || null;`.
- Line 29: `const booking = item?.booking || null;`.
- Line 30: `const user = agent?.user || null;`.
- Line 63: `export const getCommissions = async (req, res) => {`.
- Line 66: `const commissions = await commissionQuery(req);`.
- Line 74: `export const getAgentCommissions = async (req, res) => {`.
- Line 80: `const commissions = await Commission.find(`.
- Line 106: `export const approveCommission = async (req, res, next) => {`.
- Line 108: `const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 127: `export const payCommission = async (req, res, next) => {`.
- Line 129: `const { paymentMethod = "MPESA", paymentReference = "", transactionId = "", notes = "" } = req.body || {};`.
- Line 130: `const allowedMethods = ["BANK_TRANSFER", "MPESA", "CASH", "CHEQUE"];`.
- Line 134: `const normalizedReference = String(paymentReference || transactionId || "").trim();`.
- Line 139: `const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 146: `const duplicatePayment = await Commission.findOne(`.
- Line 174: `const agent = await Agent.findOne(mergeTenantFilter({ _id: commission.agent }));`.
- Line 176: `const amount = Number(commission.amount || 0);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/controllers/quotationController.js

**Source:** [server/controllers/quotationController.js](../../../server/controllers/quotationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Quotation` from `../models/Quotation.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Quotation.js](../../../server/models/Quotation.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `calculateQuotation` from `../services/quotationCalculator.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/quotationCalculator.js](../../../server/services/quotationCalculator.js)

## Runtime declarations and data flow

### `createQuotation` — lines 14–77

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body. Persistent operations detected: Agent.findOne, Quotation.create, Quotation.findById; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 17:** `const agent = await Agent.findOne(mergeTenantFilter(req, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 28:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `if (!customer || !tourPackage || !Array.isArray(items) || items.length === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 45:** `const totals = calculateQuotation(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const quotation = await Quotation.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `const populatedQuotation = await Quotation.findById(quotation._id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 68:** `return res.status(201).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAgentQuotations` — lines 87–118

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: Agent.findOne, Quotation.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 88:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 89:** `const agent = await Agent.findOne(mergeTenantFilter(req, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 93:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 94:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 100:** `const quotations = await Quotation.find(mergeTenantFilter(req, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 109:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getQuotationById` — lines 128–163

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.params. Persistent operations detected: Agent.findOne, Quotation.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 129:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 130:** `const agent = await Agent.findOne(mergeTenantFilter(req, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 134:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 135:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 141:** `const quotation = await Quotation.findOne(mergeTenantFilter(req, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 148:** `if (!quotation) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 149:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 155:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateQuotationStatus` — lines 173–235

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body, req.params. Persistent operations detected: Agent.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 174:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 175:** `const agent = await Agent.findOne(mergeTenantFilter(req, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 179:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 180:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 186:** `const { status } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 188:** `const allowedStatuses = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 196:** `if (!allowedStatuses.includes(status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 197:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 203:** `const quotation = await Quotation.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 219:** `if (!quotation) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 220:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 226:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 14: `export const createQuotation = async (req, res, next) => {`.
- Line 17: `const agent = await Agent.findOne(mergeTenantFilter(req, {`.
- Line 28: `const {`.
- Line 45: `const totals = calculateQuotation(`.
- Line 51: `const quotation = await Quotation.create({`.
- Line 64: `const populatedQuotation = await Quotation.findById(quotation._id)`.
- Line 87: `export const getAgentQuotations = async (req, res, next) => {`.
- Line 89: `const agent = await Agent.findOne(mergeTenantFilter(req, {`.
- Line 100: `const quotations = await Quotation.find(mergeTenantFilter(req, {`.
- Line 128: `export const getQuotationById = async (req, res, next) => {`.
- Line 130: `const agent = await Agent.findOne(mergeTenantFilter(req, {`.
- Line 141: `const quotation = await Quotation.findOne(mergeTenantFilter(req, {`.
- Line 173: `export const updateQuotationStatus = async (req, res, next) => {`.
- Line 175: `const agent = await Agent.findOne(mergeTenantFilter(req, {`.
- Line 186: `const { status } = req.body;`.
- Line 188: `const allowedStatuses = [`.
- Line 203: `const quotation = await Quotation.findOneAndUpdate(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

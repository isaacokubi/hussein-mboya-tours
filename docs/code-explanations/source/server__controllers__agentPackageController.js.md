# Source explanation: server/controllers/agentPackageController.js

**Source:** [server/controllers/agentPackageController.js](../../../server/controllers/agentPackageController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `TourPackage` from `../models/TourPackage.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourPackage.js](../../../server/models/TourPackage.js)

## Runtime declarations and data flow

### `isValidId` — lines 11–11

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getAgentPackages` — lines 28–189

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: TourPackage.find, TourPackage.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 31:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const currentPage = Math.max(Number(page), 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const pageSize = Math.min(Math.max(Number(limit), 1), 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const skip = (currentPage - 1) * pageSize;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const filter = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `if (category) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `if (destination) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `if (featured === "true") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 70:** `if (search) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `let sortOption = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `switch (sort) {` — This branch selects behavior by the current value; verify every case and the default path.
- **Line 104:** `case "price-low":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `case "price-high":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 116:** `case "popular":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `case "latest":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 135:** `const [packages, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 136:** `TourPackage.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getPackageDetails` — lines 201–257

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 202:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 209:** `if (!isValidId(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 210:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 222:** `const packageData = await TourPackage.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 237:** `if (!packageData) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 238:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 250:** `res.status(200).json({` — Builds an HTTP response with an explicit status and JSON payload.

## Module-level declarations

- Line 11: `const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);`.
- Line 28: `export const getAgentPackages = async (req, res, next) => {`.
- Line 31: `const {`.
- Line 41: `const currentPage = Math.max(Number(page), 1);`.
- Line 42: `const pageSize = Math.min(Math.max(Number(limit), 1), 100);`.
- Line 43: `const skip = (currentPage - 1) * pageSize;`.
- Line 51: `const filter = {`.
- Line 99: `let sortOption = {`.
- Line 135: `const [packages, total] = await Promise.all([`.
- Line 201: `export const getPackageDetails = async (req, res, next) => {`.
- Line 222: `const packageData = await TourPackage.findOneAndUpdate(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

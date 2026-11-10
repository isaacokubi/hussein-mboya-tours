# Source explanation: server/controllers/operationsCopilotController.js

**Source:** [server/controllers/operationsCopilotController.js](../../../server/controllers/operationsCopilotController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `TourCost` from `../models/TourCost.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCost.js](../../../server/models/TourCost.js)
- `OperationalAsset` from `../models/OperationalAsset.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/OperationalAsset.js](../../../server/models/OperationalAsset.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `buildTripOperations`, `buildPaymentFollowUp`, `buildAssetAlerts`, `buildQuoteDraft`, `toMoney` from `../services/operationsCopilotCalculations.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/operationsCopilotCalculations.js](../../../server/services/operationsCopilotCalculations.js)

## Runtime declarations and data flow

### `getOperationsCopilotSummary` — lines 15–129

Parameters: `req`, `res`, `next`.
Persistent operations detected: Tour.find, Booking.aggregate, TourCost.aggregate, Booking.find, OperationalAsset.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 16:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 17:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const tenantObjectId = new mongoose.Types.ObjectId(String(tenantId));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const tourFilter = mergeTenantFilter({ isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const bookingFilter = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const [tours, bookingTotals, costTotals, bookingFinancialTotals, outstandingBookings, operationalAssets] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `Tour.find(tourFilter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 33:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 43:** `TourCost.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 54:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 63:** `Booking.find({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 71:** `OperationalAsset.find({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 82:** `const bookingMap = new Map(bookingTotals.map((row) => [String(row._id), row]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `const costMap = new Map(costTotals.map((row) => [String(row._id), row]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const trips = tours.map((tour) => buildTripOperations(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `const paymentFollowUps = outstandingBookings` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const financialTotals = bookingFinancialTotals[0] || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const assetAlerts = operationalAssets` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `createOperationsQuoteDraft` — lines 135–157

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 136:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 138:** `const { tourId, travelerCount, discountPercent = 0, taxPercent = 0 } = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 139:** `if (!mongoose.isValidObjectId(tourId)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 140:** `return res.status(400).json({ success: false, message: "A valid tourId is required." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 142:** `const tour = await Tour.findOne(mergeTenantFilter({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 146:** `if (!tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 147:** `return res.status(404).json({ success: false, message: "Tour was not found in this tenant." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 149:** `const quote = buildQuoteDraft(tour, travelerCount, discountPercent, taxPercent);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 150:** `return res.status(200).json({ success: true, data: quote });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 152:** `if (/Travellers must|Discount must|Tax rate must|Tour has no valid price/.test(error.message)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 153:** `return res.status(400).json({ success: false, message: error.message });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 155:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 15: `export const getOperationsCopilotSummary = async (req, res, next) => {`.
- Line 17: `const tenantId = requireTenantId();`.
- Line 19: `const tenantObjectId = new mongoose.Types.ObjectId(String(tenantId));`.
- Line 20: `const tourFilter = mergeTenantFilter({ isDeleted: { $ne: true } });`.
- Line 21: `const bookingFilter = {`.
- Line 27: `const [tours, bookingTotals, costTotals, bookingFinancialTotals, outstandingBookings, operationalAssets] = await Promise.all([`.
- Line 82: `const bookingMap = new Map(bookingTotals.map((row) => [String(row._id), row]));`.
- Line 83: `const costMap = new Map(costTotals.map((row) => [String(row._id), row]));`.
- Line 84: `const trips = tours.map((tour) => buildTripOperations(`.
- Line 89: `const paymentFollowUps = outstandingBookings`.
- Line 92: `const financialTotals = bookingFinancialTotals[0] || {};`.
- Line 93: `const assetAlerts = operationalAssets`.
- Line 96: `const totalBookedValue = toMoney(financialTotals.bookedValue);`.
- Line 97: `const totalCollectedValue = toMoney(financialTotals.collectedValue);`.
- Line 98: `const totalEstimatedCost = toMoney(trips.reduce((sum, trip) => sum + trip.estimatedCost, 0));`.
- Line 135: `export const createOperationsQuoteDraft = async (req, res, next) => {`.
- Line 138: `const { tourId, travelerCount, discountPercent = 0, taxPercent = 0 } = req.body || {};`.
- Line 142: `const tour = await Tour.findOne(mergeTenantFilter({`.
- Line 149: `const quote = buildQuoteDraft(tour, travelerCount, discountPercent, taxPercent);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

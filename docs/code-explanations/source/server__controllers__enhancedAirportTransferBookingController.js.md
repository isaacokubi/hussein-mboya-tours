# Source explanation: server/controllers/enhancedAirportTransferBookingController.js

**Source:** [server/controllers/enhancedAirportTransferBookingController.js](../../../server/controllers/enhancedAirportTransferBookingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `AirportTransfer` from `../models/AirportTransfer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransfer.js](../../../server/models/AirportTransfer.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `ensureHospitalityInvoice` from `../services/hospitalityInvoiceService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/hospitalityInvoiceService.js](../../../server/services/hospitalityInvoiceService.js)

## Runtime declarations and data flow

### `tenantIdOf` — lines 6–6

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user.

Key statements:

### `clean` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `bookingReference` — lines 8–8

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `resolveCustomer` — lines 10–36

Parameters: `req`, `body`.
Reads request/component inputs: req.user. Persistent operations detected: Customer.findOne, Customer.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `if (!req.user?._id) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `let customer = await Customer.findOne({ tenantId, user: req.user._id });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `if (customer) return customer;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const nameParts = clean(body.passengerName || req.user.name || "Guest")` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const firstName = clean(body.firstName || req.user.firstName || nameParts[0] || "Guest");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const lastName = clean(body.lastName || req.user.lastName || nameParts.slice(1).join(" ") || "Customer");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const phone = clean(body.passengerPhone || body.phone || req.user.phone);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!phone) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `return Customer.create({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createEnhancedTransferBooking` — lines 38–172

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: AirportTransfer.findOne, AirportTransferBooking.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 40:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const { transferId } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `if (!tenantId || !transferId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** `const transfer = await AirportTransfer.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `if (!transfer) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `return res.status(404).json({ success: false, message: "Transfer service not found." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 60:** `const passengers = Number(req.body.passengers || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const luggage = Number(req.body.luggage || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const pickupDateTime = new Date(req.body.pickupDateTime);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const arrivalDateTime = req.body.flightArrivalDateTime` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `const departureDateTime = req.body.flightDepartureDateTime` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const childSeats = Number(req.body.childSeats || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const boosterSeats = Number(req.body.boosterSeats || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `if (!Number.isInteger(passengers) || passengers < 1 || passengers > Number(transfer.passengerCapacity || 0)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 79:** `if (!Number.isInteger(luggage) || luggage < 0 || luggage > Number(transfer.luggageCapacity || 0)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;`.
- Line 7: `const clean = (value) => String(value ?? "").trim();`.
- Line 8: `const bookingReference = () => \`TRF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}\`;`.
- Line 13: `const tenantId = tenantIdOf(req);`.
- Line 14: `let customer = await Customer.findOne({ tenantId, user: req.user._id });`.
- Line 17: `const nameParts = clean(body.passengerName || req.user.name || "Guest")`.
- Line 20: `const firstName = clean(body.firstName || req.user.firstName || nameParts[0] || "Guest");`.
- Line 21: `const lastName = clean(body.lastName || req.user.lastName || nameParts.slice(1).join(" ") || "Customer");`.
- Line 22: `const phone = clean(body.passengerPhone || body.phone || req.user.phone);`.
- Line 40: `const tenantId = tenantIdOf(req);`.
- Line 41: `const { transferId } = req.body;`.
- Line 50: `const transfer = await AirportTransfer.findOne({`.
- Line 60: `const passengers = Number(req.body.passengers || 1);`.
- Line 61: `const luggage = Number(req.body.luggage || 0);`.
- Line 62: `const pickupDateTime = new Date(req.body.pickupDateTime);`.
- Line 63: `const arrivalDateTime = req.body.flightArrivalDateTime`.
- Line 66: `const departureDateTime = req.body.flightDepartureDateTime`.
- Line 69: `const childSeats = Number(req.body.childSeats || 0);`.
- Line 70: `const boosterSeats = Number(req.body.boosterSeats || 0);`.
- Line 105: `const customer = await resolveCustomer(req, req.body);`.
- Line 114: `const basePrice = Number(transfer.price || 0);`.
- Line 115: `const subtotal = transfer.pricingModel === "per_passenger" ? basePrice * passengers : basePrice;`.
- Line 116: `const taxes = Number(req.body.taxes || 0);`.
- Line 117: `const fees = Number(req.body.fees || 0);`.
- Line 118: `const totalAmount = subtotal + taxes + fees;`.
- Line 120: `const booking = await AirportTransferBooking.create({`.
- Line 161: `const invoice = await ensureHospitalityInvoice({ type: "airport_transfer", booking });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/controllers/customerBookingController.js

**Source:** [server/controllers/customerBookingController.js](../../../server/controllers/customerBookingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `CorporateAccount` from `../models/CorporateAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CorporateAccount.js](../../../server/models/CorporateAccount.js)
- `reserveSlots`, `validateTourCapacity`, `releaseSlots` from `../services/inventoryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/inventoryService.js](../../../server/services/inventoryService.js)
- `PAYMENT_METHODS` from `../constants/bookingConstants.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/constants/bookingConstants.js](../../../server/constants/bookingConstants.js)
- `calculateBookingAmounts` from `../utils/bookingPricing.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/bookingPricing.js](../../../server/utils/bookingPricing.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `isTenantPaymentMethodAvailable`, `normalizeTenantPaymentMethod` from `../services/tenantPaymentMethods.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tenantPaymentMethods.js](../../../server/services/tenantPaymentMethods.js)

## Runtime declarations and data flow

### `createCustomerBooking` — lines 13–80

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Tour.findOne, CorporateAccount.findOne, Booking.create, User.find, CorporateAccount.updateOne; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 16 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `let corporateReserved = false;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `let corporateAccountId = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `let corporateAmount = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 19:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (!tour || !travelDate) return res.status(400).json({ success: false, message: "Tour and travel date are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const normalizedPaymentMethod = normalizeTenantPaymentMethod(paymentMethod);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const tenantSettings = await getSystemSettings(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `if (!normalizedPaymentMethod || !isTenantPaymentMethodAvailable(tenantSettings, normalizedPaymentMethod)) return res.status(409).json({ success: false, message: "This payment method is not currently available for this te` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const normalizedType = String(bookingType).toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `if (!["individual", "group", "corporate"].includes(normalizedType)) return res.status(400).json({ success: false, message: "Invalid booking type." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const tourData = await Tour.findOne(mergeTenantFilter({ _id: tour, isDeleted: false }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `if (!tourData) return res.status(404).json({ success: false, message: "Tour not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `const guests = Math.max(Number(numberOfGuests) || travelers.length || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (normalizedType === "group" && guests < 2) return res.status(400).json({ success: false, message: "Group bookings require at least two guests." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `const capacityAvailable = await validateTourCapacity(tourData._id, guests, travelDate);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `if (!capacityAvailable) return res.status(409).json({ success: false, message: "Not enough available tour slots for this booking." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `const amounts = calculateBookingAmounts(tourData, guests);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 13: `export const createCustomerBooking = async (req, res, next) => {`.
- Line 15: `let corporateReserved = false;`.
- Line 16: `let corporateAccountId = null;`.
- Line 17: `let corporateAmount = 0;`.
- Line 19: `const {`.
- Line 27: `const normalizedPaymentMethod = normalizeTenantPaymentMethod(paymentMethod);`.
- Line 28: `const tenantSettings = await getSystemSettings(req);`.
- Line 30: `const normalizedType = String(bookingType).toLowerCase();`.
- Line 33: `const tourData = await Tour.findOne(mergeTenantFilter({ _id: tour, isDeleted: false }));`.
- Line 36: `const guests = Math.max(Number(numberOfGuests) || travelers.length || 1, 1);`.
- Line 38: `const capacityAvailable = await validateTourCapacity(tourData._id, guests, travelDate);`.
- Line 41: `const amounts = calculateBookingAmounts(tourData, guests);`.
- Line 42: `const totalAmount = Number(amounts.totalAmount || 0);`.
- Line 48: `const account = await CorporateAccount.findOne(mergeTenantFilter({ _id: corporateAccountId, status: "active", $expr: { $or: [{ $eq: ["$creditLimit", 0] }, { $lte: [{ $add: ["$curre`.
- Line 51: `const reserved = await CorporateAccount.findOneAndUpdate(mergeTenantFilter({ _id: account._id, status: "active", $expr: { $or: [{ $eq: ["$creditLimit", 0] }, { $lte: [{ $add: ["$cu`.
- Line 59: `const booking = await Booking.create({`.
- Line 70: `const admins = await User.find(mergeTenantFilter({ $or: [{ role: { $in: ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } }, { legacyRole: { $in: [`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

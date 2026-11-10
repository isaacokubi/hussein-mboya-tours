# Source explanation: server/middleware/bookingCommercialGuard.js

**Source:** [server/middleware/bookingCommercialGuard.js](../../../server/middleware/bookingCommercialGuard.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CorporateAccount` from `../models/CorporateAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CorporateAccount.js](../../../server/models/CorporateAccount.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `calculateBookingAmounts` from `../utils/bookingPricing.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/bookingPricing.js](../../../server/utils/bookingPricing.js)

## Runtime declarations and data flow

### `fail` — lines 8–8

Parameters: `res`, `status`, `message`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 8:** `(res, status, message) => res.status(status).json({ success: false, message })` — Builds an HTTP response with an explicit status and JSON payload.

### `guardCorporateBooking` — lines 10–37

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: CorporateAccount.findOne, Tour.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 12 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `const body = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const type = String(body.bookingType || "individual").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (!["individual", "group", "corporate"].includes(type)) return fail(res, 400, "Invalid booking type.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `const guests = Math.max(Number(body.numberOfGuests) || (Array.isArray(body.travelers) ? body.travelers.length : 1), 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (type === "group" && guests < 2) return fail(res, 400, "Group bookings require at least two guests.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (type !== "corporate") return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `if (!body.corporateAccount || !mongoose.isValidObjectId(body.corporateAccount)) return fail(res, 400, "A valid corporate account is required for corporate bookings.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const account = await CorporateAccount.findOne(mergeTenantFilter(req, { _id: body.corporateAccount }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `if (!account || account.status !== "active") return fail(res, 409, "Corporate account is not active in this tenant.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (account.requiresPurchaseOrder && !String(body.purchaseOrderNumber || "").trim()) return fail(res, 400, "This corporate account requires a purchase order number.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `let amount = Number(body.totalAmount || body.amount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (body.tour && mongoose.isValidObjectId(body.tour)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: body.tour, isDeleted: { $ne: true } })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `if (!tour) return fail(res, 404, "Tour not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (!Number.isFinite(amount) || amount <= 0) return fail(res, 400, "A valid booking amount is required for corporate credit control.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `const availableCredit = account.creditLimit > 0 ? Math.max(0, account.creditLimit - Number(account.currentBalance || 0)) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `if (availableCredit !== null && amount > availableCredit) return fail(res, 409, \`Corporate credit limit exceeded. Available credit is KES ${availableCredit.toFixed(2)}.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 8: `const fail = (res, status, message) => res.status(status).json({ success: false, message });`.
- Line 13: `const body = req.body || {};`.
- Line 14: `const type = String(body.bookingType || "individual").toLowerCase();`.
- Line 16: `const guests = Math.max(Number(body.numberOfGuests) || (Array.isArray(body.travelers) ? body.travelers.length : 1), 1);`.
- Line 20: `const account = await CorporateAccount.findOne(mergeTenantFilter(req, { _id: body.corporateAccount }));`.
- Line 24: `let amount = Number(body.totalAmount || body.amount || 0);`.
- Line 26: `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: body.tour, isDeleted: { $ne: true } })).lean();`.
- Line 31: `const availableCredit = account.creditLimit > 0 ? Math.max(0, account.creditLimit - Number(account.currentBalance || 0)) : null;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

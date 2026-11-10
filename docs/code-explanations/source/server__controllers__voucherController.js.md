# Source explanation: server/controllers/voucherController.js

**Source:** [server/controllers/voucherController.js](../../../server/controllers/voucherController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `PDFDocument` from `pdfkit`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)

## Runtime declarations and data flow

### `generateVoucher` — lines 26–686

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 20 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 28:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 30:** `const settings = await getSystemSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `const companyName =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const currency =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 58:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 84:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 91:** `const bookingNumber = booking.bookingNumber || String(booking._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const travelDate = booking.travelDate ? new Date(booking.travelDate).toLocaleDateString("en-KE") : "Not specified";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const guests = Number(booking.numberOfGuests || booking.travelers?.length || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const amount = Number(booking.amountPaid || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `const allowedRoles = new Set([` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `const userRole = String(req.user?.role?.name || req.user?.role || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `const isAdmin = allowedRoles.has(userRole);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `const bookingUserId = booking.user?._id || booking.user;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `const isOwner = bookingUserId && String(bookingUserId) === String(req.user?._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 26: `export const generateVoucher = async (req, res, next) => {`.
- Line 30: `const settings = await getSystemSettings();`.
- Line 32: `const companyName =`.
- Line 35: `const currency =`.
- Line 58: `const booking = await Booking.findOne(`.
- Line 91: `const bookingNumber = booking.bookingNumber || String(booking._id);`.
- Line 92: `const travelDate = booking.travelDate ? new Date(booking.travelDate).toLocaleDateString("en-KE") : "Not specified";`.
- Line 93: `const guests = Number(booking.numberOfGuests || booking.travelers?.length || 1);`.
- Line 94: `const amount = Number(booking.amountPaid || 0);`.
- Line 102: `const allowedRoles = new Set([`.
- Line 106: `const userRole = String(req.user?.role?.name || req.user?.role || "").trim().toLowerCase();`.
- Line 107: `const isAdmin = allowedRoles.has(userRole);`.
- Line 108: `const bookingUserId = booking.user?._id || booking.user;`.
- Line 109: `const isOwner = bookingUserId && String(bookingUserId) === String(req.user?._id);`.
- Line 124: `const doc = new PDFDocument({`.
- Line 565: `const signatureY = doc.y;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

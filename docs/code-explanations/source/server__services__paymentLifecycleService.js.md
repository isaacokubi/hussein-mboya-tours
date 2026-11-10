# Source explanation: server/services/paymentLifecycleService.js

**Source:** [server/services/paymentLifecycleService.js](../../../server/services/paymentLifecycleService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `sendPaymentConfirmationEmail`, `sendBookingStatusEmail`, `sendEmailBestEffort` from `./emailService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/emailService.js](../../../server/services/emailService.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `postPaymentToLedger`, `postPaymentRefundToLedger` from `./operationalAccountingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/operationalAccountingService.js](../../../server/services/operationalAccountingService.js)
- `BOOKING_PAYMENT_STATUSES`, `PAYMENT_STATUSES`, `PAYMENT_METHODS` from `../constants/bookingConstants.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/constants/bookingConstants.js](../../../server/constants/bookingConstants.js)

## Runtime declarations and data flow

### `normalizePaymentMethod` — lines 36–60

Parameters: `method`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 39:** `const value =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const aliases = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `return aliases[value] || null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getRequesterRole` — lines 69–80

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 71:** `return String(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isStaffUser` — lines 89–104

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 91:** `const role = getRequesterRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `userOwnsBooking` — lines 113–149

Parameters: `booking`, `user`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 115:** `if (!booking || !user?._id) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 116:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 119:** `const userId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `const bookingUserId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 125:** `const bookingCustomerId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `const snapshotEmail =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 135:** `const userEmail =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 140:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `canAccessBooking` — lines 158–168

Parameters: `booking`, `user`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 160:** `if (!booking || !user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 161:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 164:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPayableBookingAmount` — lines 180–213

Parameters: `booking`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 182:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 183:** `throw new Error("Booking is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 186:** `const totalAmount =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 189:** `const balanceAmount =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 192:** `const depositDue = Number(booking.depositAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 193:** `const amountPaid = Number(booking.amountPaid || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 195:** `if (totalAmount <= 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 196:** `throw new Error("Booking has an invalid total amount.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 204:** `if (balanceAmount > 0 && amountPaid > 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 205:** `return Math.round(balanceAmount);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 208:** `if (amountPaid === 0 && depositDue > 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 209:** `return Math.round(Math.min(depositDue, totalAmount));` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 212:** `return Math.round(totalAmount);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validatePaymentStatus` — lines 222–231

Parameters: `status`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 224:** `if (!PAYMENT_STATUSES.includes(status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 225:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 230:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateBookingPaymentStatus` — lines 240–249

Parameters: `status`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 242:** `if (!BOOKING_PAYMENT_STATUSES.includes(status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 243:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 248:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `findPendingBookingPayment` — lines 258–275

Parameters: `bookingId`.
Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 262:** `return Payment.findOne(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `failBookingPayment` — lines 288–436

Parameters: `{payment, booking, failureReason, paymentData}`.
Persistent operations detected: Payment.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=true. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 295:** `if (!payment || !booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 296:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 301:** `const session =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 302:** `await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 304:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 306:** `let result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 308:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 310:** `const paymentDoc =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 311:** `await Payment.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 316:** `const bookingDoc =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 317:** `await Booking.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 322:** `if (!paymentDoc) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 323:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 328:** `if (!bookingDoc) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 329:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 340:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 350:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 367:** `if (paymentData.callbackResponse) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `completeBookingPayment` — lines 449–1078

Parameters: `{payment, booking, paymentData}`.
Persistent operations detected: Payment.findOne, Booking.findOne, Commission.findOne, Commission.create; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=true. 34 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 455:** `if (!payment || !booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 456:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 461:** `const session =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 462:** `await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 464:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 466:** `let result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 468:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 476:** `const paymentDoc =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 477:** `await Payment.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 482:** `const bookingDoc =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 483:** `await Booking.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 488:** `if (!paymentDoc) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 489:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 494:** `if (!bookingDoc) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 495:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 510:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 521:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 531:** `const canonicalPaymentMethod =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refundBookingPayment` — lines 1094–1457

Parameters: `{payment, booking, refundAmount, refundData}`.
Persistent operations detected: Payment.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 9 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=true. 21 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 1101:** `if (!payment) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1102:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 1107:** `const session =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1108:** `await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1110:** `let result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1112:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 1114:** `await session.withTransaction(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1123:** `const paymentDoc =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1124:** `await Payment.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1129:** `if (!paymentDoc) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1130:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 1135:** `const bookingId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1139:** `if (!bookingId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1140:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 1145:** `const bookingDoc =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1146:** `await Booking.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1151:** `if (!bookingDoc) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1152:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 36: `export const normalizePaymentMethod = (method) => {`.
- Line 39: `const value =`.
- Line 45: `const aliases = {`.
- Line 69: `export const getRequesterRole = (user) => {`.
- Line 89: `export const isStaffUser = (user) => {`.
- Line 91: `const role = getRequesterRole(user);`.
- Line 113: `export const userOwnsBooking = (booking, user) => {`.
- Line 119: `const userId =`.
- Line 122: `const bookingUserId =`.
- Line 125: `const bookingCustomerId =`.
- Line 128: `const snapshotEmail =`.
- Line 135: `const userEmail =`.
- Line 158: `export const canAccessBooking = (booking, user) => {`.
- Line 180: `export const getPayableBookingAmount = (booking) => {`.
- Line 186: `const totalAmount =`.
- Line 189: `const balanceAmount =`.
- Line 192: `const depositDue = Number(booking.depositAmount || 0);`.
- Line 193: `const amountPaid = Number(booking.amountPaid || 0);`.
- Line 222: `export const validatePaymentStatus = (status) => {`.
- Line 240: `export const validateBookingPaymentStatus = (status) => {`.
- Line 258: `export const findPendingBookingPayment = async (`.
- Line 288: `export const failBookingPayment = async ({`.
- Line 301: `const session =`.
- Line 306: `let result;`.
- Line 310: `const paymentDoc =`.
- Line 316: `const bookingDoc =`.
- Line 449: `export const completeBookingPayment = async ({`.
- Line 461: `const session =`.
- Line 466: `let result;`.
- Line 476: `const paymentDoc =`.
- Line 482: `const bookingDoc =`.
- Line 531: `const canonicalPaymentMethod =`.
- Line 550: `const paymentAmount =`.
- Line 573: `const totalAmount =`.
- Line 614: `const currentPaidAmount = Number(bookingDoc.amountPaid || 0);`.
- Line 615: `const remainingDue = Math.max(0, totalAmount - currentPaidAmount);`.
- Line 797: `const newPaidAmount =`.
- Line 908: `const alreadyAttached =`.
- Line 967: `const existingCommission =`.
- Line 979: `const agentRate =`.
- Line 986: `const commissionAmount =`.
- Line 1094: `export const refundBookingPayment = async ({`.
- Line 1107: `const session =`.
- Line 1110: `let result;`.
- Line 1123: `const paymentDoc =`.
- Line 1135: `const bookingId =`.
- Line 1145: `const bookingDoc =`.
- Line 1163: `const refundReference =`.
- Line 1203: `const requestedRefund =`.
- Line 1228: `const paymentTotal =`.
- Line 1250: `const previousRefunded =`.
- Line 1272: `const refundableAmount =`.
- Line 1294: `const newRefundedAmount =`.
- Line 1298: `const fullyRefunded =`.
- Line 1365: `const totalAmount =`.
- Line 1370: `const currentPaid =`.
- Line 1375: `const newPaid = Math.max(0, currentPaid - requestedRefund);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/controllers/adminPaymentController.js

**Source:** [server/controllers/adminPaymentController.js](../../../server/controllers/adminPaymentController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Refund` from `../models/Refund.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Refund.js](../../../server/models/Refund.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `refundBookingPayment`, `completeBookingPayment` from `../services/paymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentLifecycleService.js](../../../server/services/paymentLifecycleService.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `RefundAudit` from `../models/RefundAudit.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/RefundAudit.js](../../../server/models/RefundAudit.js)
- `requestMpesaRefund` from `../services/mpesaRefundService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaRefundService.js](../../../server/services/mpesaRefundService.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)

## Runtime declarations and data flow

### `getPayments` — lines 13–42

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Payment.find, Payment.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** `const page = Math.max(1, Number(req.query.page) || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const query = mergeTenantFilter(req, {});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (req.query.status) query.status = req.query.status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (req.query.method) query.method = req.query.method;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const payments = await Payment.find(query)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 37:** `const total = await Payment.countDocuments(query);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `return res.json({ success: true, page, limit, total, payments });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 40:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPaymentStats` — lines 44–56

Parameters: `req`, `res`, `next`.
Persistent operations detected: Payment.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 46:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 47:** `const stats = await Payment.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `return res.json({ success: true, stats });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 54:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updatePaymentStatus` — lines 58–107

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: Payment.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 60:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 61:** `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `const nextStatus = String(req.body?.status || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const allowedStatuses = ["pending", "processing", "completed", "failed", "cancelled", "refunded"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `if (!allowedStatuses.includes(nextStatus)) return res.status(400).json({ success: false, message: "Invalid payment status" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `if (nextStatus === "completed") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: payment.booking }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 70:** `if (!booking) return res.status(404).json({ success: false, message: "Booking not found for payment" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `if (!["BANK", "CASH"].includes(String(payment.provider || "").toUpperCase())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `return res.status(409).json({ success: false, message: "Provider payments must be confirmed by their provider callback/verification flow." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 74:** `if (payment.status === "completed") return res.status(409).json({ success: false, message: "This manual payment has already been confirmed." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `const settings = await getSystemSettings(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 76:** `const confirmationReference = String(req.body?.confirmationReference || req.body?.receiptNumber || "").trim().slice(0, 200);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `if (String(payment.provider).toUpperCase() === "CASH" && settings.cashReceiptRequired === true && !confirmationReference) return res.status(400).json({ success: false, message: "A cash receipt number is required by this ` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `const result = await completeBookingPayment({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `await result.payment.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 90:** `return res.json({ success: true, payment: result.payment, booking: result.booking });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getPayment` — lines 109–121

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 111:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 112:** `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 116:** `if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 117:** `return res.json({ success: true, payment });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 119:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `submitMpesaRefund` — lines 123–199

Parameters: `{payment, booking, amount, phone}`.
Persistent operations detected: Payment.updateOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 124:** `const refundAmount = Number(amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 125:** `const refundedAmount = Number(payment.refundedAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `const refundableAmount = Math.max(0, Number(payment.amount || 0) - refundedAmount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 127:** `if (!Number.isFinite(refundAmount) || refundAmount <= 0 || refundAmount > refundableAmount) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 128:** `throw new Error(\`Invalid refund amount. Maximum refundable amount is ${refundableAmount}.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 131:** `const transactionId = String(payment.mpesaReceiptNumber || payment.transactionId || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 132:** `if (!transactionId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 133:** `throw new Error("Original M-Pesa transaction ID is missing; verify the payment before requesting a reversal.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 139:** `const claimedPayment = await Payment.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 162:** `if (!claimedPayment) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 163:** `throw new Error("A refund is already processing, or the payment is no longer refundable.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 166:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 167:** `const refundResponse = await requestMpesaRefund({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 173:** `const refundReference = String(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 178:** `if (!refundReference) throw new Error("M-Pesa did not return a refund conversation reference.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 181:** `await claimedPayment.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 183:** `if (booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 185:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refundPayment` — lines 201–225

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 203:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 204:** `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("booking").populate("customer");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 205:** `if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 206:** `if (payment.status !== "completed") return res.status(400).json({ success: false, message: "Only completed payments can be refunded" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 207:** `if (String(payment.provider || "").toUpperCase() !== "MPESA") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 208:** `return res.status(501).json({ success: false, message: "Automated refunds are not available for this payment method. Use the authorized reconciliation workflow." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 211:** `const phone = payment.phoneNumber || payment.phone || payment.customer?.phone;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 212:** `if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 214:** `const { refundResponse, refundAmount, payment: updatedPayment } = await submitMpesaRefund({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 221:** `return res.json({ success: true, message: "Refund request submitted", refundResponse, refundAmount, payment: updatedPayment });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 223:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPaymentAnalytics` — lines 227–239

Parameters: `req`, `res`, `next`.
Persistent operations detected: Payment.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 229:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 230:** `const analytics = await Payment.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 235:** `return res.status(200).json({ success: true, analytics });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 237:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `refundBooking` — lines 241–268

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Booking.findOne, Payment.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 243:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 244:** `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 245:** `if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 247:** `const payment = await Payment.findOne(mergeTenantFilter(req, { booking: booking._id, status: "completed" })).sort({ createdAt: -1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 248:** `if (!payment) return res.status(404).json({ success: false, message: "No completed payment found for this booking" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 250:** `const phone = payment.phoneNumber || payment.phone || booking.contact?.phone || booking.customerSnapshot?.phone;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 251:** `if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 253:** `if (String(payment.provider || "").toUpperCase() !== "MPESA") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 254:** `return res.status(501).json({ success: false, message: "Automated refunds are not available for this payment method. Use the authorized reconciliation workflow." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 257:** `const { refundResponse, refundAmount, payment: updatedPayment } = await submitMpesaRefund({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 264:** `return res.status(200).json({ success: true, message: "Refund request submitted", refundResponse, refundAmount, payment: updatedPayment, booking });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 266:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `processRefund` — lines 270–310

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Refund.findOne, Payment.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 272:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 273:** `const refund = await Refund.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 274:** `if (!refund) return res.status(404).json({ success: false, message: "Refund not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 276:** `const status = String(req.body.status || "processing").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 277:** `const allowedStatuses = ["requested", "approved", "processing", "completed", "rejected"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 278:** `if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid refund status" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 281:** `if (req.body.mpesaReference) refund.mpesaReference = req.body.mpesaReference;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 282:** `if (status === "completed") refund.processedAt = new Date();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 283:** `await refund.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 285:** `if (status === "completed" && refund.payment) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 286:** `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: refund.payment }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 287:** `if (payment) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 288:** `await refundBookingPayment({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 299:** `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: refund.booking }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 300:** `if (booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 302:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 306:** `return res.status(200).json({ success: true, message: "Refund updated successfully", data: refund });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 308:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 13: `export const getPayments = async (req, res, next) => {`.
- Line 16: `const page = Math.max(1, Number(req.query.page) || 1);`.
- Line 17: `const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));`.
- Line 18: `const query = mergeTenantFilter(req, {});`.
- Line 22: `const payments = await Payment.find(query)`.
- Line 37: `const total = await Payment.countDocuments(query);`.
- Line 44: `export const getPaymentStats = async (req, res, next) => {`.
- Line 47: `const stats = await Payment.aggregate([`.
- Line 58: `export const updatePaymentStatus = async (req, res, next) => {`.
- Line 61: `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 64: `const nextStatus = String(req.body?.status || "").trim().toLowerCase();`.
- Line 65: `const allowedStatuses = ["pending", "processing", "completed", "failed", "cancelled", "refunded"];`.
- Line 69: `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: payment.booking }));`.
- Line 75: `const settings = await getSystemSettings(req);`.
- Line 76: `const confirmationReference = String(req.body?.confirmationReference || req.body?.receiptNumber || "").trim().slice(0, 200);`.
- Line 78: `const result = await completeBookingPayment({`.
- Line 109: `export const getPayment = async (req, res, next) => {`.
- Line 112: `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }))`.
- Line 123: `const submitMpesaRefund = async ({ payment, booking, amount, phone }) => {`.
- Line 124: `const refundAmount = Number(amount);`.
- Line 125: `const refundedAmount = Number(payment.refundedAmount || 0);`.
- Line 126: `const refundableAmount = Math.max(0, Number(payment.amount || 0) - refundedAmount);`.
- Line 131: `const transactionId = String(payment.mpesaReceiptNumber || payment.transactionId || "").trim();`.
- Line 139: `const claimedPayment = await Payment.findOneAndUpdate(`.
- Line 167: `const refundResponse = await requestMpesaRefund({`.
- Line 173: `const refundReference = String(`.
- Line 201: `export const refundPayment = async (req, res, next) => {`.
- Line 204: `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("booking").populate("customer");`.
- Line 211: `const phone = payment.phoneNumber || payment.phone || payment.customer?.phone;`.
- Line 214: `const { refundResponse, refundAmount, payment: updatedPayment } = await submitMpesaRefund({`.
- Line 227: `export const getPaymentAnalytics = async (req, res, next) => {`.
- Line 230: `const analytics = await Payment.aggregate([`.
- Line 241: `export const refundBooking = async (req, res, next) => {`.
- Line 244: `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 247: `const payment = await Payment.findOne(mergeTenantFilter(req, { booking: booking._id, status: "completed" })).sort({ createdAt: -1 });`.
- Line 250: `const phone = payment.phoneNumber || payment.phone || booking.contact?.phone || booking.customerSnapshot?.phone;`.
- Line 257: `const { refundResponse, refundAmount, payment: updatedPayment } = await submitMpesaRefund({`.
- Line 270: `export const processRefund = async (req, res, next) => {`.
- Line 273: `const refund = await Refund.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 276: `const status = String(req.body.status || "processing").trim().toLowerCase();`.
- Line 277: `const allowedStatuses = ["requested", "approved", "processing", "completed", "rejected"];`.
- Line 286: `const payment = await Payment.findOne(mergeTenantFilter(req, { _id: refund.payment }));`.
- Line 299: `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: refund.booking }));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

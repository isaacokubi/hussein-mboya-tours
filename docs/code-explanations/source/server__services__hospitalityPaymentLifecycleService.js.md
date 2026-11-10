# Source explanation: server/services/hospitalityPaymentLifecycleService.js

**Source:** [server/services/hospitalityPaymentLifecycleService.js](../../../server/services/hospitalityPaymentLifecycleService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `postPaymentToLedger` from `./operationalAccountingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/operationalAccountingService.js](../../../server/services/operationalAccountingService.js)
- `syncHospitalityInvoicePayments` from `./hospitalityInvoiceService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/hospitalityInvoiceService.js](../../../server/services/hospitalityInvoiceService.js)

## Runtime declarations and data flow

### `getHospitalityModel` — lines 11–12

Parameters: `type`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getHospitalityPayableAmount` — lines 14–26

Parameters: `booking`, `arg2 (defaulted)`.
Persistent operations detected: Payment.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `const total = Number(booking?.totalAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!Number.isFinite(total) || total <= 0) throw new Error("Booking has an invalid total amount.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const query = Payment.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 23:** `if (session) query.session(session);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const [paid] = await query;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `return Math.max(0, Math.round((total - Number(paid?.total || 0)) * 100) / 100);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `syncHospitalityPaymentStatus` — lines 28–46

Parameters: `{type, booking, payment, session}`.
Persistent operations detected: Payment.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `const paymentQuery = Payment.find({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 35:** `if (session) paymentQuery.session(session);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `const payments = await paymentQuery.select("amount refundedAmount").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `const paid = payments.reduce((sum, item) => sum + Math.max(0, Number(item.amount || 0) - Number(item.refundedAmount || 0)), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const total = Number(booking.totalAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `if (booking.paymentStatus === "paid" && booking.status === "pending") booking.status = "confirmed";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `await booking.save(session ? { session } : undefined);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `const invoice = await syncHospitalityInvoicePayments({ type, booking, session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `return { booking, invoice, paidAmount: paid, balance: Math.max(0, total - paid) };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `completeHospitalityPayment` — lines 48–123

Parameters: `{payment, booking, paymentData}`.
Persistent operations detected: Payment.findOne, Model.findOne, Payment.aggregate, Notification.create; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=true. 17 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 49:** `if (!payment || !booking) throw new Error("Payment and hospitality booking are required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `let result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 54:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 55:** `const paymentDoc = await Payment.findOne({ _id: payment._id, tenantId: payment.tenantId, hospitalityBooking: booking._id }).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `if (!paymentDoc) throw new Error("Payment not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `const Model = getHospitalityModel(paymentDoc.hospitalityType);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `if (!Model) throw new Error("Invalid hospitality booking type.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `const bookingDoc = await Model.findOne({ _id: booking._id, tenantId: paymentDoc.tenantId }).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `if (!bookingDoc) throw new Error("Hospitality booking not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `if (paymentDoc.status === "completed") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 68:** `const amount = Number(paymentData.amount ?? paymentDoc.amount ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `if (!Number.isFinite(amount) || amount <= 0) throw new Error("Completed payment has an invalid amount.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `const priorQuery = Payment.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 77:** `const [prior] = await priorQuery;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 79:** `const total = Number(bookingDoc.totalAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `failHospitalityPayment` — lines 125–157

Parameters: `{payment, booking, reason, paymentData}`.
Persistent operations detected: Payment.findOne, Model.findOne; verify tenant/ownership filters in the exact query. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=true. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 126:** `if (!payment) throw new Error("Payment is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 128:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 129:** `let result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 130:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 131:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 132:** `const paymentDoc = await Payment.findOne({ _id: payment._id, tenantId: payment.tenantId }).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 133:** `if (!paymentDoc) throw new Error("Payment not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 138:** `if (paymentData.checkoutRequestID) paymentDoc.checkoutRequestID = paymentData.checkoutRequestID;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 139:** `if (paymentData.callbackResponse) paymentDoc.callbackResponse = paymentData.callbackResponse;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 140:** `await paymentDoc.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 142:** `let bookingDoc = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 143:** `if (booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 144:** `const Model = getHospitalityModel(paymentDoc.hospitalityType);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 145:** `bookingDoc = Model ? await Model.findOne({ _id: booking._id, tenantId: paymentDoc.tenantId }).session(session) : null;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 146:** `if (!bookingDoc) throw new Error("Hospitality booking not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 148:** `await bookingDoc.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 149:** `await syncHospitalityInvoicePayments({ type: paymentDoc.hospitalityType, booking: bookingDoc, session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 153:** `return result;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `assertHospitalityPaymentAccess` — lines 159–164

Parameters: `booking`, `user`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 160:** `if (!booking || !user?._id) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 161:** `const role = String(user.role || user.legacyRole || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 162:** `const staff = ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager", "agent"].includes(role);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 163:** `return staff || String(booking.user || "") === String(user._id) || String(booking.customer || "") === String(user._id);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 9: `const MODELS = { hotel: HotelBooking, airport_transfer: AirportTransferBooking };`.
- Line 11: `export const getHospitalityModel = (type) =>`.
- Line 14: `export const getHospitalityPayableAmount = async (booking, { session = null } = {}) => {`.
- Line 15: `const total = Number(booking?.totalAmount || 0);`.
- Line 18: `const query = Payment.aggregate([`.
- Line 24: `const [paid] = await query;`.
- Line 28: `export const syncHospitalityPaymentStatus = async ({ type, booking, payment, session = null }) => {`.
- Line 29: `const paymentQuery = Payment.find({`.
- Line 36: `const payments = await paymentQuery.select("amount refundedAmount").lean();`.
- Line 38: `const paid = payments.reduce((sum, item) => sum + Math.max(0, Number(item.amount || 0) - Number(item.refundedAmount || 0)), 0);`.
- Line 39: `const total = Number(booking.totalAmount || 0);`.
- Line 44: `const invoice = await syncHospitalityInvoicePayments({ type, booking, session });`.
- Line 48: `export const completeHospitalityPayment = async ({ payment, booking, paymentData = {} }) => {`.
- Line 51: `const session = await mongoose.startSession();`.
- Line 52: `let result;`.
- Line 55: `const paymentDoc = await Payment.findOne({ _id: payment._id, tenantId: payment.tenantId, hospitalityBooking: booking._id }).session(session);`.
- Line 58: `const Model = getHospitalityModel(paymentDoc.hospitalityType);`.
- Line 60: `const bookingDoc = await Model.findOne({ _id: booking._id, tenantId: paymentDoc.tenantId }).session(session);`.
- Line 68: `const amount = Number(paymentData.amount ?? paymentDoc.amount ?? 0);`.
- Line 71: `const priorQuery = Payment.aggregate([`.
- Line 77: `const [prior] = await priorQuery;`.
- Line 79: `const total = Number(bookingDoc.totalAmount || 0);`.
- Line 80: `const remaining = Math.max(0, total - Number(prior?.total || 0));`.
- Line 103: `const synced = await syncHospitalityPaymentStatus({ type: paymentDoc.hospitalityType, booking: bookingDoc, payment: paymentDoc, session });`.
- Line 106: `const label = paymentDoc.hospitalityType === "hotel" ? "Hotel reservation" : "Airport transfer";`.
- Line 125: `export const failHospitalityPayment = async ({ payment, booking, reason = "Payment failed.", paymentData = {} }) => {`.
- Line 128: `const session = await mongoose.startSession();`.
- Line 129: `let result;`.
- Line 132: `const paymentDoc = await Payment.findOne({ _id: payment._id, tenantId: payment.tenantId }).session(session);`.
- Line 142: `let bookingDoc = null;`.
- Line 144: `const Model = getHospitalityModel(paymentDoc.hospitalityType);`.
- Line 159: `export const assertHospitalityPaymentAccess = (booking, user) => {`.
- Line 161: `const role = String(user.role || user.legacyRole || "").toLowerCase();`.
- Line 162: `const staff = ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager", "agent"].includes(role);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/services/hospitalityInvoiceService.js

**Source:** [server/services/hospitalityInvoiceService.js](../../../server/services/hospitalityInvoiceService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)

## Runtime declarations and data flow

### `getHospitalityInvoiceModel` — lines 8–8

Parameters: `type`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ensureHospitalityInvoice` — lines 10–46

Parameters: `{type, booking, customerSnapshot, session}`.
Persistent operations detected: Invoice.findOne, Invoice.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `if (!booking?.tenantId || !booking?._id) throw new Error("Hospitality booking is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const normalizedType = String(type || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (!getHospitalityInvoiceModel(normalizedType)) throw new Error("Invalid hospitality invoice type.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `const existingQuery = Invoice.findOne({ tenantId: booking.tenantId, hospitalityBooking: booking._id, hospitalityType: normalizedType, isDeleted: { $ne: true } });` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 16:** `if (session) existingQuery.session(session);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const existing = await existingQuery;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `if (existing) return existing;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const snapshot = customerSnapshot || {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const invoiceData = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const invoice = session ? (await Invoice.create([invoiceData], { session }))[0] : await Invoice.create(invoiceData);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `return invoice;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `syncHospitalityInvoicePayments` — lines 48–63

Parameters: `{type, booking, session}`.
Persistent operations detected: Payment.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 49:** `const invoice = await ensureHospitalityInvoice({ type, booking, session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 50:** `const paymentQuery = Payment.find({ tenantId: booking.tenantId, hospitalityBooking: booking._id, hospitalityType: type, status: { $in: ["completed", "refunded"] } });` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 51:** `if (session) paymentQuery.session(session);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `const payments = await paymentQuery.select("amount refundedAmount paymentMethod transactionReference transactionId mpesaReceiptNumber updatedAt").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** `const paid = payments.reduce((sum, p) => sum + Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0)), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const totalRefunded = payments.reduce((sum, p) => sum + Math.max(0, Number(p.refundedAmount || 0)), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `const latest = payments.slice().sort((a, b) => Number(new Date(b.updatedAt || 0)) - Number(new Date(a.updatedAt || 0)))[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `if (latest) invoice.paymentMethod = latest.paymentMethod || invoice.paymentMethod;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `if (latest) invoice.paymentReference = latest.mpesaReceiptNumber || latest.transactionReference || latest.transactionId || invoice.paymentReference;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `await invoice.save(session ? { session } : undefined);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `return invoice;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const MODELS = { hotel: HotelBooking, airport_transfer: AirportTransferBooking };`.
- Line 8: `export const getHospitalityInvoiceModel = (type) => MODELS[String(type || "").trim().toLowerCase()] || null;`.
- Line 10: `export const ensureHospitalityInvoice = async ({ type, booking, customerSnapshot = null, session = null }) => {`.
- Line 12: `const normalizedType = String(type || "").trim().toLowerCase();`.
- Line 15: `const existingQuery = Invoice.findOne({ tenantId: booking.tenantId, hospitalityBooking: booking._id, hospitalityType: normalizedType, isDeleted: { $ne: true } });`.
- Line 17: `const existing = await existingQuery;`.
- Line 20: `const snapshot = customerSnapshot || {`.
- Line 26: `const invoiceData = {`.
- Line 44: `const invoice = session ? (await Invoice.create([invoiceData], { session }))[0] : await Invoice.create(invoiceData);`.
- Line 48: `export const syncHospitalityInvoicePayments = async ({ type, booking, session = null }) => {`.
- Line 49: `const invoice = await ensureHospitalityInvoice({ type, booking, session });`.
- Line 50: `const paymentQuery = Payment.find({ tenantId: booking.tenantId, hospitalityBooking: booking._id, hospitalityType: type, status: { $in: ["completed", "refunded"] } });`.
- Line 52: `const payments = await paymentQuery.select("amount refundedAmount paymentMethod transactionReference transactionId mpesaReceiptNumber updatedAt").lean();`.
- Line 53: `const paid = payments.reduce((sum, p) => sum + Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0)), 0);`.
- Line 54: `const totalRefunded = payments.reduce((sum, p) => sum + Math.max(0, Number(p.refundedAmount || 0)), 0);`.
- Line 58: `const latest = payments.slice().sort((a, b) => Number(new Date(b.updatedAt || 0)) - Number(new Date(a.updatedAt || 0)))[0];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

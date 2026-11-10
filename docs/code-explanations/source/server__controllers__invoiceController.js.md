# Source explanation: server/controllers/invoiceController.js

**Source:** [server/controllers/invoiceController.js](../../../server/controllers/invoiceController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `fs` from `fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)

## Runtime declarations and data flow

### `createInvoice` — lines 15–101

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId. Persistent operations detected: Booking.findOne, Invoice.findOne, Invoice.create, Invoice.findById; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 18:** `const { booking } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 27:** `const bookingData = await Booking.findOne(mergeTenantFilter(req, { _id: booking }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `if (!bookingData) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 39:** `const existingInvoice = await Invoice.findOne(mergeTenantFilter(req, { booking }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `if (existingInvoice) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** `const subtotal = Number(bookingData.subtotal || bookingData.totalAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const discount = Number(bookingData.discountAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const tax = Number(bookingData.taxAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const totalAmount = Number(bookingData.totalAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const amountPaid = Number(bookingData.depositAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const invoice = await Invoice.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 79:** `const populatedInvoice = await Invoice.findById(invoice._id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 93:** `res.status(201).json({` — Builds an HTTP response with an explicit status and JSON payload.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getInvoices` — lines 107–134

Parameters: `req`, `res`, `next`.
Persistent operations detected: Invoice.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 108:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 109:** `const invoices = await Invoice.find(tenantFilter(req))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 126:** `res.status(200).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `getInvoice` — lines 140–173

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Invoice.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 141:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 142:** `const invoice = await Invoice.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 159:** `if (!invoice) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 160:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 166:** `res.status(200).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `downloadInvoice` — lines 179–214

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 180:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 181:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 187:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 188:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 194:** `const filePath = path.join(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 200:** `if (!fs.existsSync(filePath)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 201:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 207:** `return res.download(` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 15: `export const createInvoice = async (req, res, next) => {`.
- Line 18: `const { booking } = req.body;`.
- Line 27: `const bookingData = await Booking.findOne(mergeTenantFilter(req, { _id: booking }))`.
- Line 39: `const existingInvoice = await Invoice.findOne(mergeTenantFilter(req, { booking }));`.
- Line 50: `const subtotal = Number(bookingData.subtotal || bookingData.totalAmount || 0);`.
- Line 51: `const discount = Number(bookingData.discountAmount || 0);`.
- Line 52: `const tax = Number(bookingData.taxAmount || 0);`.
- Line 53: `const totalAmount = Number(bookingData.totalAmount || 0);`.
- Line 54: `const amountPaid = Number(bookingData.depositAmount || 0);`.
- Line 55: `const invoice = await Invoice.create({`.
- Line 79: `const populatedInvoice = await Invoice.findById(invoice._id)`.
- Line 107: `export const getInvoices = async (req, res, next) => {`.
- Line 109: `const invoices = await Invoice.find(tenantFilter(req))`.
- Line 140: `export const getInvoice = async (req, res, next) => {`.
- Line 142: `const invoice = await Invoice.findOne(`.
- Line 179: `export const downloadInvoice = async (req, res, next) => {`.
- Line 181: `const booking = await Booking.findOne(`.
- Line 194: `const filePath = path.join(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/bootstrap/invoiceIndexMigration.js

**Source:** [server/bootstrap/invoiceIndexMigration.js](../../../server/bootstrap/invoiceIndexMigration.js)

## Purpose

A startup/bootstrap hook loaded to register model behavior or prepare runtime state.

## Imports and dependencies

- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)

## Runtime declarations and data flow

### `migrateInvoiceIndexes` — lines 3–16

Parameters: none.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 4:** `const indexes = await Invoice.collection.indexes().catch((error) => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 7:** `if (error?.code === 26 || error?.codeName === "NamespaceNotFound") return [];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 10:** `const legacy = indexes.find((index) => index.name === "tenantId_1_booking_1" && !index.partialFilterExpression);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 11:** `if (legacy) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `try { await Invoice.collection.dropIndex(legacy.name); } catch (error) { if (error?.code !== 27) throw error; }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 14:** `await Invoice.collection.createIndex({ tenantId: 1, booking: 1 }, { name: "tenantId_1_booking_1", unique: true, partialFilterExpression: { booking: { $type: "objectId" } } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `await Invoice.collection.createIndex({ tenantId: 1, hospitalityBooking: 1, hospitalityType: 1 }, { name: "tenantId_1_hospitalityBooking_1_hospitalityType_1", unique: true, partialFilterExpression: { hospitalityBooking: {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 3: `export const migrateInvoiceIndexes = async () => {`.
- Line 4: `const indexes = await Invoice.collection.indexes().catch((error) => {`.
- Line 10: `const legacy = indexes.find((index) => index.name === "tenantId_1_booking_1" && !index.partialFilterExpression);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

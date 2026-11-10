# Source explanation: server/services/pdfService.js

**Source:** [server/services/pdfService.js](../../../server/services/pdfService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `PDFDocument` from `pdfkit`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `generateReceipt` — lines 11–201

Parameters: `booking`, `res`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `const settings = await getSystemSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `const companyName =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const currency =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const doc = new PDFDocument({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 170:** `if (booking.mpesaReceiptNumber) {` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 11: `export const generateReceipt = async (booking, res) => {`.
- Line 13: `const settings = await getSystemSettings();`.
- Line 15: `const companyName =`.
- Line 18: `const currency =`.
- Line 21: `const doc = new PDFDocument({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

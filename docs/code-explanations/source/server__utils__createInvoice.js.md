# Source explanation: server/utils/createInvoice.js

**Source:** [server/utils/createInvoice.js](../../../server/utils/createInvoice.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

- `PDFDocument` from `pdfkit`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `fs` from `fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `createInvoice` — lines 16–80

Parameters: `{booking, filePath}`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `const settings = await getSystemSettings({ tenantId: booking?.tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `const companyName = settings.companyName || "Company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const currency = settings.currency || "KES";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const currencySymbol = settings.currencySymbol || "KSh";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const totalAmount = Number(booking?.totalAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const paidAmount = Number(booking?.depositAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const balanceAmount = Math.max(0, Number(booking?.balanceAmount ?? totalAmount - paidAmount));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `return new Promise((resolve, reject) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 26:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 27:** `const directory = path.dirname(filePath);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const doc = new PDFDocument({ margin: 50 });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const stream = fs.createWriteStream(filePath);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const paymentStatus = String(booking?.paymentStatus || "pending").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const statusLabel = paymentStatus === "paid" ? "PAID" : paymentStatus === "partial" ? "PARTIALLY PAID" : paymentStatus.toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 16: `export const createInvoice = async ({ booking, filePath }) => {`.
- Line 17: `const settings = await getSystemSettings({ tenantId: booking?.tenantId });`.
- Line 18: `const companyName = settings.companyName || "Company";`.
- Line 19: `const currency = settings.currency || "KES";`.
- Line 20: `const currencySymbol = settings.currencySymbol || "KSh";`.
- Line 21: `const totalAmount = Number(booking?.totalAmount || 0);`.
- Line 22: `const paidAmount = Number(booking?.depositAmount || 0);`.
- Line 23: `const balanceAmount = Math.max(0, Number(booking?.balanceAmount ?? totalAmount - paidAmount));`.
- Line 27: `const directory = path.dirname(filePath);`.
- Line 30: `const doc = new PDFDocument({ margin: 50 });`.
- Line 31: `const stream = fs.createWriteStream(filePath);`.
- Line 64: `const paymentStatus = String(booking?.paymentStatus || "pending").toLowerCase();`.
- Line 65: `const statusLabel = paymentStatus === "paid" ? "PAID" : paymentStatus === "partial" ? "PARTIALLY PAID" : paymentStatus.toUpperCase();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

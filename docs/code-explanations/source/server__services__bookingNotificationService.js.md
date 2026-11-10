# Source explanation: server/services/bookingNotificationService.js

**Source:** [server/services/bookingNotificationService.js](../../../server/services/bookingNotificationService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `fs` from `fs/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `sendEmail` from `./emailService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/emailService.js](../../../server/services/emailService.js)
- `bookingConfirmationEmail` from `../utils/emailTemplates.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/emailTemplates.js](../../../server/utils/emailTemplates.js)
- `createInvoice` from `../utils/createInvoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/createInvoice.js](../../../server/utils/createInvoice.js)
- `getSystemSettings` from `./settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)

## Runtime declarations and data flow

### `sendBookingConfirmation` — lines 8–33

Parameters: `booking`.
6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `let invoicePath = "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 11:** `if (!booking) throw new Error("Booking is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const contactEmail = booking.contactEmail || booking.contact?.email || booking.customerSnapshot?.email;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (!contactEmail) throw new Error("Customer email is missing.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `const settings = await getSystemSettings({ tenantId: booking.tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `const companyName = settings.companyName || "Global Tours";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const uploadDir = path.resolve("uploads");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `await fs.mkdir(uploadDir, { recursive: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `await createInvoice({ booking, filePath: invoicePath });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `const result = await sendEmail({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `await fs.unlink(invoicePath).catch(() => {});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `return result;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `if (invoicePath) await fs.unlink(invoicePath).catch(() => {});` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.

## Module-level declarations

- Line 8: `export const sendBookingConfirmation = async (booking) => {`.
- Line 9: `let invoicePath = "";`.
- Line 12: `const contactEmail = booking.contactEmail || booking.contact?.email || booking.customerSnapshot?.email;`.
- Line 14: `const settings = await getSystemSettings({ tenantId: booking.tenantId });`.
- Line 15: `const companyName = settings.companyName || "Global Tours";`.
- Line 16: `const uploadDir = path.resolve("uploads");`.
- Line 20: `const result = await sendEmail({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

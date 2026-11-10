# Source explanation: server/services/emailService.js

**Source:** [server/services/emailService.js](../../../server/services/emailService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `Resend` from `resend`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSystemSettings` from `./settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)

## Runtime declarations and data flow

### `escapeHtml` — lines 9–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clean` — lines 10–13

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 11:** `const text = String(value ?? "").replace(/\s+/g, " ").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `return text && !/^(?:undefined|null)(?:\s+(?:undefined|null))*$/i.test(text) ? text : fallback;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDate` — lines 14–14

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `money` — lines 15–15

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clientFor` — lines 17–25

Parameters: `apiKey`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `return resendClient;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendEmail` — lines 27–48

Parameters: `{to, subject, html, text, attachments, cc, bcc, replyTo, fromName, settingsSource}`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 28:** `if (!to) throw new Error("Recipient email is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `if (!subject) throw new Error("Email subject is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (!html && !text) throw new Error("Email content is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** Sensitive-configuration/data operation; inspect source without copying secret values. — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 33:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const sender = String(process.env.RESEND_FROM_EMAIL || RESEND_TEST_SENDER).trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 35:** `if (!EMAIL_PATTERN.test(sender)) throw new Error("RESEND_FROM_EMAIL must be a valid email address.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `const settings = await getSystemSettings(settingsSource);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `const companyName = clean(fromName || process.env.RESEND_FROM_NAME || settings.companyName, "Hussein Mboya Tours");` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 39:** `const from = \`${companyName.replace(/[<>\r\n]/g, "")} <${sender}>\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `if (error) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `const statusCode = Number(error.statusCode || error.status || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `throw new Error(statusCode ? \`Resend email delivery failed (HTTP ${statusCode}).\` : "Resend email delivery failed.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 47:** `return data;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `bookingEmailAddress` — lines 50–50

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `sendBookingConfirmationEmail` — lines 52–63

Parameters: `booking`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 53:** `const settings = await getSystemSettings({ tenantId: booking?.tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 54:** `const companyName = clean(settings.companyName, "Hussein Mboya Tours");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const bookingNumber = clean(booking?.bookingNumber, "Pending");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const tour = clean(booking?.tour?.title || booking?.tour?.name || booking?.tour, "Tour package");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `const travelDate = formatDate(booking?.travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `const total = money(booking?.totalAmount ?? booking?.amount ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const subject = \`Booking confirmation - ${companyName}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `const text = \`Booking confirmation\n\nThank you for choosing ${companyName}.\n\nBooking number: ${bookingNumber}\nTour: ${tour}\nTravel date: ${travelDate}\nTotal amount: ${total}\n\nRegards,\n${companyName}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const html = \`<h2>Booking confirmation</h2><p>Thank you for choosing ${escapeHtml(companyName)}.</p><p><strong>Booking number:</strong> ${escapeHtml(bookingNumber)}<br><strong>Tour:</strong> ${escapeHtml(tour)}<br><stro` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `return sendEmail({ to: bookingEmailAddress(booking), subject, html, text, fromName: companyName });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendPaymentConfirmationEmail` — lines 65–74

Parameters: `booking`, `payment`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 66:** `const companyName = clean((await getSystemSettings({ tenantId: booking?.tenantId })).companyName, "Hussein Mboya Tours");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 67:** `const amount = money(payment?.amount ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `const reference = clean(payment?.mpesaReceiptNumber || payment?.transactionReference || payment?.transactionId, "Not provided");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `return sendEmail({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendBookingStatusEmail` — lines 76–82

Parameters: `booking`, `status`, `reason (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 77:** `const companyName = clean((await getSystemSettings({ tenantId: booking?.tenantId })).companyName, "Hussein Mboya Tours");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `const bookingNumber = clean(booking?.bookingNumber, "Pending");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `const title = status === "cancelled" ? "Booking cancelled" : status === "refunded" ? "Booking refund update" : "Booking status update";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `const message = \`${title}: booking ${bookingNumber} is now ${status}.${reason ? \` ${reason}\` : ""}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `return sendEmail({ to: bookingEmailAddress(booking), subject: \`${title} - ${companyName}\`, text: message, html: \`<h2>${escapeHtml(title)}</h2><p>Booking <strong>${escapeHtml(bookingNumber)}</strong> is now ${escapeHtm` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `resetResendClientForTests` — lines 85–85

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `setResendClientForTests` — lines 86–89

Parameters: `client`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `sendEmailBestEffort` — lines 91–98

Parameters: `send`, `context (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false.

Key statements:
- **Line 92:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 93:** `return await send();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 96:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `export const RESEND_TEST_SENDER = "onboarding@resend.dev";`.
- Line 5: `const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;`.
- Line 6: `let resendClient;`.
- Line 7: `<sensitive declaration redacted>`.
- Line 9: `const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));`.
- Line 10: `const clean = (value, fallback = "Not specified") => {`.
- Line 11: `const text = String(value ?? "").replace(/\s+/g, " ").trim();`.
- Line 14: `const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" }) : "Not specified";`.
- Line 15: `const money = (value) => \`KES ${Number(value ?? 0).toLocaleString("en-KE")}\`;`.
- Line 17: `<sensitive declaration redacted>`.
- Line 27: `export const sendEmail = async ({ to, subject, html, text, attachments = [], cc, bcc, replyTo, fromName, settingsSource }) => {`.
- Line 32: `<sensitive declaration redacted>`.
- Line 34: `const sender = String(process.env.RESEND_FROM_EMAIL || RESEND_TEST_SENDER).trim();`.
- Line 37: `const settings = await getSystemSettings(settingsSource);`.
- Line 38: `const companyName = clean(fromName || process.env.RESEND_FROM_NAME || settings.companyName, "Hussein Mboya Tours");`.
- Line 39: `const from = \`${companyName.replace(/[<>\r\n]/g, "")} <${sender}>\`;`.
- Line 40: `<sensitive declaration redacted>`.
- Line 44: `const statusCode = Number(error.statusCode || error.status || 0);`.
- Line 50: `const bookingEmailAddress = (booking) => booking?.contact?.email || booking?.contactEmail || booking?.customerSnapshot?.email || booking?.customer?.email || booking?.user?.email;`.
- Line 52: `export const sendBookingConfirmationEmail = async (booking) => {`.
- Line 53: `const settings = await getSystemSettings({ tenantId: booking?.tenantId });`.
- Line 54: `const companyName = clean(settings.companyName, "Hussein Mboya Tours");`.
- Line 55: `const bookingNumber = clean(booking?.bookingNumber, "Pending");`.
- Line 56: `const tour = clean(booking?.tour?.title || booking?.tour?.name || booking?.tour, "Tour package");`.
- Line 57: `const travelDate = formatDate(booking?.travelDate);`.
- Line 58: `const total = money(booking?.totalAmount ?? booking?.amount ?? 0);`.
- Line 59: `const subject = \`Booking confirmation - ${companyName}\`;`.
- Line 60: `const text = \`Booking confirmation\n\nThank you for choosing ${companyName}.\n\nBooking number: ${bookingNumber}\nTour: ${tour}\nTravel date: ${travelDate}\nTotal amount: ${total}`.
- Line 61: `const html = \`<h2>Booking confirmation</h2><p>Thank you for choosing ${escapeHtml(companyName)}.</p><p><strong>Booking number:</strong> ${escapeHtml(bookingNumber)}<br><strong>Tou`.
- Line 65: `export const sendPaymentConfirmationEmail = async (booking, payment) => {`.
- Line 66: `const companyName = clean((await getSystemSettings({ tenantId: booking?.tenantId })).companyName, "Hussein Mboya Tours");`.
- Line 67: `const amount = money(payment?.amount ?? 0);`.
- Line 68: `const reference = clean(payment?.mpesaReceiptNumber || payment?.transactionReference || payment?.transactionId, "Not provided");`.
- Line 76: `export const sendBookingStatusEmail = async (booking, status, reason = "") => {`.
- Line 77: `const companyName = clean((await getSystemSettings({ tenantId: booking?.tenantId })).companyName, "Hussein Mboya Tours");`.
- Line 78: `const bookingNumber = clean(booking?.bookingNumber, "Pending");`.
- Line 79: `const title = status === "cancelled" ? "Booking cancelled" : status === "refunded" ? "Booking refund update" : "Booking status update";`.
- Line 80: `const message = \`${title}: booking ${bookingNumber} is now ${status}.${reason ? \` ${reason}\` : ""}\`;`.
- Line 85: `<sensitive declaration redacted>`.
- Line 86: `export const setResendClientForTests = (client) => {`.
- Line 91: `export const sendEmailBestEffort = async (send, context = "Notification") => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

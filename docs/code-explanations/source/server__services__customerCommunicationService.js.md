# Source explanation: server/services/customerCommunicationService.js

**Source:** [server/services/customerCommunicationService.js](../../../server/services/customerCommunicationService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Subscription` from `../models/Subscription.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Subscription.js](../../../server/models/Subscription.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `sendEmail` from `./emailService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/emailService.js](../../../server/services/emailService.js)
- `sendWhatsApp` from `./whatsappService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/whatsappService.js](../../../server/services/whatsappService.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getSystemSettings` from `./settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `createInvoice` from `../utils/createInvoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/createInvoice.js](../../../server/utils/createInvoice.js)
- `fs` from `fs/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `cleanName` — lines 16–22

Parameters: `...values`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `for (const value of values) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 18:** `const name = String(value ?? "").replace(/\s+/g, " ").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (name && !/^(?:undefined|null)(?:\s+(?:undefined|null))*$/i.test(name)) return name;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `return "Customer";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `bookingContact` — lines 24–35

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `escapeHtml` — lines 36–36

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `formatDate` — lines 37–37

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `company` — lines 38–38

Parameters: `tenantId (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:

### `platform` — lines 39–39

Parameters: `fn`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `alreadySent` — lines 40–40

Parameters: `tenantId`, `eventKey`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:

### `recordInApp` — lines 42–45

Parameters: `{tenantId, recipient, title, message, type, eventKey, relatedId}`.
Persistent operations detected: Notification.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 43:** `if (!recipient || await alreadySent(tenantId, eventKey)) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `return runWithTenant({ tenantId, role: "system" }, () => Notification.create({ tenantId, recipient, user: recipient, title, message, type, metadata: { eventKey, automation: true }, relatedModel: relatedId ? "Booking" : n` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deliver` — lines 47–59

Parameters: `{booking, eventKey, title, message, emailSubject, html, attachments, type}`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `const tenantId = booking.tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `if (await alreadySent(tenantId, eventKey)) return { skipped: true, eventKey };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `const contact = bookingContact(booking);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const tasks = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `if (contact.email) tasks.push(sendEmail({ to: contact.email, subject: emailSubject, html, text: message, attachments }));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `if (booking.user) tasks.push(recordInApp({ tenantId, recipient: booking.user, title, message, type, eventKey, relatedId: booking._id }));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `const results = await Promise.allSettled(tasks);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `const failures = results.filter((result) => result.status === "rejected");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `if (failures.length === results.length && results.length) throw failures[0].reason;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `return { sent: results.length - failures.length, failed: failures.length, eventKey };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendBookingConfirmationAutomation` — lines 61–77

Parameters: `booking`.
5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 62:** `const name = bookingContact(booking).name;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const companyName = await company(booking.tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `const eventKey = \`${booking._id}:${EVENT_TYPES.BOOKING_CONFIRMATION}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `let invoicePath = "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 67:** `if (bookingContact(booking).email) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `const uploadDir = path.resolve("uploads");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `await fs.mkdir(uploadDir, { recursive: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 71:** `await createInvoice({ booking, filePath: invoicePath });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 73:** `return await deliver({ booking, eventKey, title: "Booking Confirmed", message: \`Hello ${name}, your booking ${booking.bookingNumber || ""} with ${companyName} is confirmed for ${formatDate(booking.travelDate)}. Your inv` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 75:** `if (invoicePath) await fs.unlink(invoicePath).catch(() => {});` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `sendPaymentReminderAutomation` — lines 79–84

Parameters: `booking`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 80:** `const name = bookingContact(booking).name;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const companyName = await company(booking.tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 82:** `const eventKey = \`${booking._id}:${EVENT_TYPES.PAYMENT_REMINDER}:${new Date().toISOString().slice(0, 10)}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `return deliver({ booking, eventKey, title: "Payment Reminder", message: \`Hello ${name}, this is a payment reminder for booking ${booking.bookingNumber || ""}. Please contact ${companyName} if you need assistance.\`, ema` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendTourReminderAutomation` — lines 86–91

Parameters: `booking`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 87:** `const name = bookingContact(booking).name;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const companyName = await company(booking.tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `const eventKey = \`${booking._id}:${EVENT_TYPES.TOUR_REMINDER}:${new Date(booking.travelDate).toISOString().slice(0, 10)}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `return deliver({ booking, eventKey, title: "Tour Reminder", message: \`Hello ${name}, your ${booking.tour?.title || "tour"} with ${companyName} is coming up on ${formatDate(booking.travelDate)}. We look forward to welcom` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendTourVoucherAutomation` — lines 93–98

Parameters: `booking`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 94:** `const name = bookingContact(booking).name;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `const companyName = await company(booking.tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 96:** `const eventKey = \`${booking._id}:${EVENT_TYPES.TOUR_VOUCHER}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `return deliver({ booking, eventKey, title: "Tour Voucher Ready", message: \`Your tour voucher for booking ${booking.bookingNumber || ""} is ready. Please keep your booking number available when travelling.\`, emailSubjec` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `subscriptionRecipients` — lines 100–100

Parameters: `tenantId`.
Persistent operations detected: User.find; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 100:** `async (tenantId) => platform(() => User.find({ tenantId, status: "active", isActive: { $ne: false }, role: { $in: ["admin", "administrator", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager"] } }).sel` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `sendSubscriptionReminderAutomation` — lines 102–118

Parameters: `{subscription, daysRemaining, expired}`.
Persistent operations detected: Organization.findById; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=false, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 103:** `const tenantId = subscription.tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const eventType = expired ? EVENT_TYPES.SUBSCRIPTION_EXPIRED : ({ 7: EVENT_TYPES.SUBSCRIPTION_7, 3: EVENT_TYPES.SUBSCRIPTION_3, 1: EVENT_TYPES.SUBSCRIPTION_1 }[daysRemaining] || \`subscription_${daysRemaining}_days\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `const eventKey = \`${tenantId}:${eventType}:${new Date().toISOString().slice(0, 10)}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `if (await alreadySent(tenantId, eventKey)) return { skipped: true, eventKey };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 107:** `const organization = await platform(() => Organization.findById(tenantId).select("name subscription status").lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 108:** `const companyName = organization?.name || "Your tour company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `const recipients = await subscriptionRecipients(tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 110:** `const title = expired ? "Subscription Expired" : \`Subscription Expires in ${daysRemaining} Day${daysRemaining === 1 ? "" : "s"}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 111:** `const message = expired ? \`${companyName}'s subscription has expired. Please renew to restore platform access.\` : \`${companyName}'s ${subscription.plan} subscription expires in ${daysRemaining} day${daysRemaining === ` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 112:** `await Promise.all(recipients.map(async (user) => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 113:** `if (user.email) await sendEmail({ to: user.email, subject: title, text: message, html: \`<h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p>\` }).catch((error) => console.error("Subscription email failed:", error.` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 114:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 115:** `await recordInApp({ tenantId, recipient: user._id, title, message, type: "alert", eventKey: \`${eventKey}:${user._id}\`, relatedId: null });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 117:** `return { sent: recipients.length, eventKey };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `runCommunicationAutomation` — lines 120–141

Parameters: none.
Persistent operations detected: Booking.find, Subscription.find; verify tenant/ownership filters in the exact query. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=false, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 121:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `const recent = new Date(now.getTime() - 24 * 60 * 60 * 1000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 123:** `const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `const bookings = await platform(() => Booking.find({ $or: [{ createdAt: { $gte: recent } }, { travelDate: { $gte: now, $lte: sevenDays } }], status: { $nin: ["cancelled", "completed"] }, isDeleted: { $ne: true } }).popul` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 125:** `for (const booking of bookings) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 126:** `const bookingStatus = String(booking.status || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 127:** `const paymentStatus = String(booking.paymentStatus || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `if (new Date(booking.createdAt || 0) >= recent && (bookingStatus === "confirmed" || ["paid", "completed"].includes(paymentStatus))) await sendBookingConfirmationAutomation(booking).catch((error) => console.error("Booking` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 129:** `const travel = new Date(booking.travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 130:** `const hours = (travel.getTime() - now.getTime()) / 3600000;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 131:** `if (hours >= 23 && hours <= 49) await sendTourReminderAutomation(booking).catch((error) => console.error("Tour reminder failed:", error.message));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 132:** `if (booking.paymentStatus && !["paid", "completed"].includes(paymentStatus)) await sendPaymentReminderAutomation(booking).catch((error) => console.error("Payment reminder failed:", error.message));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 134:** `const paidBookings = await platform(() => Booking.find({ paymentStatus: { $in: ["paid", "completed"] }, travelDate: { $gte: now, $lte: sevenDays }, status: { $nin: ["cancelled", "completed"] }, isDeleted: { $ne: true } }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 135:** `for (const booking of paidBookings) await sendTourVoucherAutomation(booking).catch((error) => console.error("Tour voucher automation failed:", error.message));` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 136:** `const subscriptions = await platform(() => Subscription.find({ status: { $in: ["trialing", "active"] }, currentPeriodEndsAt: { $ne: null } }).lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 137:** `for (const subscription of subscriptions) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 138:** `const days = Math.ceil((new Date(subscription.currentPeriodEndsAt).getTime() - now.getTime()) / 86400000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 139:** `if ([7, 3, 1].includes(days)) await sendSubscriptionReminderAutomation({ subscription, daysRemaining: days }).catch((error) => console.error("Subscription reminder failed:", error.message));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 14: `const EVENT_TYPES = Object.freeze({ BOOKING_CONFIRMATION: "booking_confirmation", PAYMENT_REMINDER: "payment_reminder", TOUR_REMINDER: "tour_reminder", TOUR_VOUCHER: "tour_voucher"`.
- Line 16: `const cleanName = (...values) => {`.
- Line 18: `const name = String(value ?? "").replace(/\s+/g, " ").trim();`.
- Line 24: `const bookingContact = (booking) => ({`.
- Line 36: `const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));`.
- Line 37: `const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-KE", { dateStyle: "medium" }) : "Not specified";`.
- Line 38: `const company = async (tenantId = null) => (await getSystemSettings(tenantId ? { tenantId } : {})).companyName || "Global Tours";`.
- Line 39: `const platform = (fn) => runWithTenant({ role: "super_admin", bypass: true }, fn);`.
- Line 40: `const alreadySent = async (tenantId, eventKey) => Boolean(await platform(() => Notification.exists({ tenantId, "metadata.eventKey": eventKey })));`.
- Line 42: `const recordInApp = async ({ tenantId, recipient, title, message, type, eventKey, relatedId }) => {`.
- Line 47: `const deliver = async ({ booking, eventKey, title, message, emailSubject, html, attachments = [], type = "booking" }) => {`.
- Line 48: `const tenantId = booking.tenantId;`.
- Line 50: `const contact = bookingContact(booking);`.
- Line 51: `const tasks = [];`.
- Line 55: `const results = await Promise.allSettled(tasks);`.
- Line 56: `const failures = results.filter((result) => result.status === "rejected");`.
- Line 61: `export const sendBookingConfirmationAutomation = async (booking) => {`.
- Line 62: `const name = bookingContact(booking).name;`.
- Line 63: `const companyName = await company(booking.tenantId);`.
- Line 64: `const eventKey = \`${booking._id}:${EVENT_TYPES.BOOKING_CONFIRMATION}\`;`.
- Line 65: `let invoicePath = "";`.
- Line 68: `const uploadDir = path.resolve("uploads");`.
- Line 79: `export const sendPaymentReminderAutomation = async (booking) => {`.
- Line 80: `const name = bookingContact(booking).name;`.
- Line 81: `const companyName = await company(booking.tenantId);`.
- Line 82: `const eventKey = \`${booking._id}:${EVENT_TYPES.PAYMENT_REMINDER}:${new Date().toISOString().slice(0, 10)}\`;`.
- Line 86: `export const sendTourReminderAutomation = async (booking) => {`.
- Line 87: `const name = bookingContact(booking).name;`.
- Line 88: `const companyName = await company(booking.tenantId);`.
- Line 89: `const eventKey = \`${booking._id}:${EVENT_TYPES.TOUR_REMINDER}:${new Date(booking.travelDate).toISOString().slice(0, 10)}\`;`.
- Line 93: `export const sendTourVoucherAutomation = async (booking) => {`.
- Line 94: `const name = bookingContact(booking).name;`.
- Line 95: `const companyName = await company(booking.tenantId);`.
- Line 96: `const eventKey = \`${booking._id}:${EVENT_TYPES.TOUR_VOUCHER}\`;`.
- Line 100: `const subscriptionRecipients = async (tenantId) => platform(() => User.find({ tenantId, status: "active", isActive: { $ne: false }, role: { $in: ["admin", "administrator", "super_a`.
- Line 102: `export const sendSubscriptionReminderAutomation = async ({ subscription, daysRemaining, expired = false }) => {`.
- Line 103: `const tenantId = subscription.tenantId;`.
- Line 104: `const eventType = expired ? EVENT_TYPES.SUBSCRIPTION_EXPIRED : ({ 7: EVENT_TYPES.SUBSCRIPTION_7, 3: EVENT_TYPES.SUBSCRIPTION_3, 1: EVENT_TYPES.SUBSCRIPTION_1 }[daysRemaining] || \``.
- Line 105: `const eventKey = \`${tenantId}:${eventType}:${new Date().toISOString().slice(0, 10)}\`;`.
- Line 107: `const organization = await platform(() => Organization.findById(tenantId).select("name subscription status").lean());`.
- Line 108: `const companyName = organization?.name || "Your tour company";`.
- Line 109: `const recipients = await subscriptionRecipients(tenantId);`.
- Line 110: `const title = expired ? "Subscription Expired" : \`Subscription Expires in ${daysRemaining} Day${daysRemaining === 1 ? "" : "s"}\`;`.
- Line 111: `const message = expired ? \`${companyName}'s subscription has expired. Please renew to restore platform access.\` : \`${companyName}'s ${subscription.plan} subscription expires in `.
- Line 120: `export const runCommunicationAutomation = async () => {`.
- Line 121: `const now = new Date();`.
- Line 122: `const recent = new Date(now.getTime() - 24 * 60 * 60 * 1000);`.
- Line 123: `const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);`.
- Line 124: `const bookings = await platform(() => Booking.find({ $or: [{ createdAt: { $gte: recent } }, { travelDate: { $gte: now, $lte: sevenDays } }], status: { $nin: ["cancelled", "complete`.
- Line 126: `const bookingStatus = String(booking.status || "").toLowerCase();`.
- Line 127: `const paymentStatus = String(booking.paymentStatus || "").toLowerCase();`.
- Line 129: `const travel = new Date(booking.travelDate);`.
- Line 130: `const hours = (travel.getTime() - now.getTime()) / 3600000;`.
- Line 134: `const paidBookings = await platform(() => Booking.find({ paymentStatus: { $in: ["paid", "completed"] }, travelDate: { $gte: now, $lte: sevenDays }, status: { $nin: ["cancelled", "c`.
- Line 136: `const subscriptions = await platform(() => Subscription.find({ status: { $in: ["trialing", "active"] }, currentPeriodEndsAt: { $ne: null } }).lean());`.
- Line 138: `const days = Math.ceil((new Date(subscription.currentPeriodEndsAt).getTime() - now.getTime()) / 86400000);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

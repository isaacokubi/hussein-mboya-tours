# Source explanation: server/controllers/notificationController.js

**Source:** [server/controllers/notificationController.js](../../../server/controllers/notificationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `sendSMS` from `../services/smsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/smsService.js](../../../server/services/smsService.js)
- `sendWhatsApp` from `../services/whatsappService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/whatsappService.js](../../../server/services/whatsappService.js)
- `sendEmail` from `../services/emailService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/emailService.js](../../../server/services/emailService.js)

## Runtime declarations and data flow

### `isValidId` — lines 28–29

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `escapeHtml` — lines 30–30

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getBookingContact` — lines 32–47

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getNotificationType` — lines 49–72

Parameters: `type`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 50:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `return "booking";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 57:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `return "payment";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 64:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `return "tour_update";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 71:** `return "alert";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeRole` — lines 76–84

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `requesterCanSendStaffNotifications` — lines 86–89

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getNotificationRecipients` — lines 97–188

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.query. Persistent operations detected: Role.find, User.find, Staff.find, User.findOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 99:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 100:** `if (!requesterCanSendStaffNotifications(req.user)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 101:** `return res.status(403).json({ success: false, message: "Only administrators and managers can send internal notifications." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 104:** `const requested = String(req.query.roles || "guide,driver,agent,admin,manager")` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `const roleMap = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 119:** `const allowedRoles = [...new Set(requested.flatMap((r) => roleMap[r] || []))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 120:** `const roleDocs = await Role.find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 125:** `const roleIds = roleDocs.map((role) => role._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 127:** `const users = await User.find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 143:** `const staff = await Staff.find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 161:** `const linkedIds = new Set(users.map((u) => u._id.toString()));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 162:** `const extra = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 164:** `for (const member of staff) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 165:** `if (member.user && !linkedIds.has(member.user.toString())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 166:** `const user = await User.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 174:** `if (user && user.status === "active" && user.isActive !== false) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 181:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendInternalNotification` — lines 190–289

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body. Persistent operations detected: Role.find, User.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 191:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 192:** `if (!requesterCanSendStaffNotifications(req.user)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 193:** `return res.status(403).json({ success: false, message: "Only administrators and managers can send internal notifications." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 196:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 206:** `if (!title?.trim() || !message?.trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 207:** `return res.status(400).json({ success: false, message: "Title and message are required." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 210:** `const normalizedIds = Array.isArray(recipientIds)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 214:** `const normalizedRoles = Array.isArray(roles)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 218:** `const roleMap = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 228:** `const expandedRoles = [...new Set(normalizedRoles.flatMap((r) => roleMap[r] || []))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 230:** `const filter = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 231:** `if (normalizedIds.length) filter.push({ _id: { $in: normalizedIds } });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 232:** `if (expandedRoles.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 239:** `if (!filter.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 240:** `return res.status(400).json({ success: false, message: "Select at least one recipient or recipient group." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 243:** `const roleDocs = expandedRoles.length` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 244:** `? await Role.find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 250:** `const roleIds = roleDocs.map((role) => role._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getNotifications` — lines 297–368

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query, req.user. Persistent operations detected: Notification.find, Notification.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 302:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 303:** `const page = Math.max(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 308:** `const limit = Math.min(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 316:** `const filter = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 321:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 327:** `if (req.query.type) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 332:** `const skip =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 335:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 339:** `Notification.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 347:** `Notification.countDocuments(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 352:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `markRead` — lines 385–428

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Notification.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 390:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 391:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 394:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 401:** `const notification =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 402:** `await Notification.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 408:** `if (!notification) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 409:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 416:** `await notification.markAsRead();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 418:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendBookingNotification` — lines 437–770

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Booking.findOne, Notification.create; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 25 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 442:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 443:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 448:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 455:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 456:** `await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 465:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 466:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 473:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 478:** `const allowedTypes = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 488:** `const allowedChannels = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 495:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 500:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 507:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 512:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 525:** `const recipient =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 536:** `const contact =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 547:** `let title =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 550:** `let message =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 28: `const isValidId = (id) =>`.
- Line 30: `const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));`.
- Line 32: `const getBookingContact = (booking) => ({`.
- Line 49: `const getNotificationType = (type) => {`.
- Line 76: `const normalizeRole = (value) =>`.
- Line 86: `const requesterCanSendStaffNotifications = (user) =>`.
- Line 97: `export const getNotificationRecipients = async (req, res, next) => {`.
- Line 104: `const requested = String(req.query.roles || "guide,driver,agent,admin,manager")`.
- Line 109: `const roleMap = {`.
- Line 119: `const allowedRoles = [...new Set(requested.flatMap((r) => roleMap[r] || []))];`.
- Line 120: `const roleDocs = await Role.find(`.
- Line 125: `const roleIds = roleDocs.map((role) => role._id);`.
- Line 127: `const users = await User.find(`.
- Line 143: `const staff = await Staff.find(`.
- Line 161: `const linkedIds = new Set(users.map((u) => u._id.toString()));`.
- Line 162: `const extra = [];`.
- Line 166: `const user = await User.findOne(`.
- Line 190: `export const sendInternalNotification = async (req, res, next) => {`.
- Line 196: `const {`.
- Line 210: `const normalizedIds = Array.isArray(recipientIds)`.
- Line 214: `const normalizedRoles = Array.isArray(roles)`.
- Line 218: `const roleMap = {`.
- Line 228: `const expandedRoles = [...new Set(normalizedRoles.flatMap((r) => roleMap[r] || []))];`.
- Line 230: `const filter = [];`.
- Line 243: `const roleDocs = expandedRoles.length`.
- Line 250: `const roleIds = roleDocs.map((role) => role._id);`.
- Line 253: `const recipients = await User.find(`.
- Line 265: `const docs = recipients.map((user) => ({`.
- Line 279: `const created = await Notification.insertMany(docs);`.
- Line 297: `export const getNotifications = async (`.
- Line 303: `const page = Math.max(`.
- Line 308: `const limit = Math.min(`.
- Line 316: `const filter = {`.
- Line 332: `const skip =`.
- Line 335: `const [`.
- Line 376: `export const getMyNotifications =`.
- Line 385: `export const markRead = async (`.
- Line 401: `const notification =`.
- Line 436: `export const sendBookingNotification =`.
- Line 455: `const booking =`.
- Line 473: `const {`.
- Line 478: `const allowedTypes = [`.
- Line 488: `const allowedChannels = [`.
- Line 525: `const recipient =`.
- Line 536: `const contact =`.
- Line 547: `let title =`.
- Line 550: `let message =`.
- Line 629: `let notification =`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

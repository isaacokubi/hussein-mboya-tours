# Source explanation: server/services/notificationService.js

**Source:** [server/services/notificationService.js](../../../server/services/notificationService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `sendEmail` from `./emailService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/emailService.js](../../../server/services/emailService.js)
- `sendNotificationToUser` from `../socket/socketManager.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/socket/socketManager.js](../../../server/socket/socketManager.js)

## Runtime declarations and data flow

### `createNotification` — lines 17–56

Parameters: `{recipient, title, message, type, metadata}`.
Persistent operations detected: Notification.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `if (!recipient) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `throw new Error("Notification recipient is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 29:** `if (!title) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `throw new Error("Notification title is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 33:** `if (!message) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `throw new Error("Notification message is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 37:** `const notification = await Notification.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 55:** `return notification;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendNotification` — lines 64–66

Parameters: `data`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 65:** `return createNotification(data);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `notifyUser` — lines 74–108

Parameters: `{user, subject, html, title, message, type, metadata}`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=false, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 83:** `const tasks = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `if (user?.email) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 107:** `await Promise.all(tasks);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `sendBookingConfirmation` — lines 116–152

Parameters: `user`, `booking`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 120:** `const settings = await getSystemSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 121:** `const companyName = settings.companyName || "Company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 123:** `await notifyUser({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `sendBookingNotification` — lines 160–177

Parameters: `{adminUserId, customer, booking}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `sendPaymentNotification` — lines 185–201

Parameters: `{adminUserId, booking}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `sendTourAssignmentNotification` — lines 209–225

Parameters: `{guideUserId, tour}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `notifyPaymentSuccess` — lines 233–250

Parameters: `user`, `payment`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 17: `export const createNotification = async ({`.
- Line 37: `const notification = await Notification.create({`.
- Line 64: `export const sendNotification = async (data) => {`.
- Line 74: `export const notifyUser = async ({`.
- Line 83: `const tasks = [];`.
- Line 116: `export const sendBookingConfirmation = async (`.
- Line 120: `const settings = await getSystemSettings();`.
- Line 121: `const companyName = settings.companyName || "Company";`.
- Line 160: `export const sendBookingNotification = async ({`.
- Line 185: `export const sendPaymentNotification = async ({`.
- Line 209: `export const sendTourAssignmentNotification = async ({`.
- Line 233: `export const notifyPaymentSuccess = async (`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

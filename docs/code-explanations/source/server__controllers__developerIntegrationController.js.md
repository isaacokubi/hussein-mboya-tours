# Source explanation: server/controllers/developerIntegrationController.js

**Source:** [server/controllers/developerIntegrationController.js](../../../server/controllers/developerIntegrationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ApiKey` from `../models/ApiKey.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ApiKey.js](../../../server/models/ApiKey.js)
- `Webhook` from `../models/Webhook.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Webhook.js](../../../server/models/Webhook.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `enqueueJob` from `../services/jobQueueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/jobQueueService.js](../../../server/services/jobQueueService.js)
- `protectWebhookSecret`, `validateWebhookUrl` from `../services/webhookDeliveryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/webhookDeliveryService.js](../../../server/services/webhookDeliveryService.js)

## Runtime declarations and data flow

### `tenantId` — lines 8–8

Parameters: `req`.
Reads request/component inputs: req.tenant, req.user.

Key statements:

### `keyView` — lines 9–9

Parameters: `item`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listApiKeys` — lines 12–14

Parameters: `req`, `res`, `next`.
Persistent operations detected: ApiKey.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 13:** Sensitive-configuration/data operation; inspect source without copying secret values. — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `createApiKey` — lines 16–22

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: ApiKey.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 17:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 18:** `const raw = \`gt_${crypto.randomBytes(30).toString("base64url")}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** Sensitive-configuration/data operation; inspect source without copying secret values. — Builds an HTTP response with an explicit status and JSON payload.

### `revokeApiKey` — lines 24–26

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** Sensitive-configuration/data operation; inspect source without copying secret values. — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `listWebhooks` — lines 28–30

Parameters: `req`, `res`, `next`.
Persistent operations detected: Webhook.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 29:** Sensitive-configuration/data operation; inspect source without copying secret values. — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `createWebhook` — lines 32–41

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: Webhook.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 34:** `const url = await validateWebhookUrl(req.body?.url);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `const requestedEvents = Array.isArray(req.body?.events) ? req.body.events.map(String).filter((event) => allowedEvents.has(event)) : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (Array.isArray(req.body?.events) && requestedEvents.length !== req.body.events.length) return res.status(400).json({ success: false, message: "Webhook contains unsupported event types." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** Sensitive-configuration/data operation; inspect source without copying secret values. — Builds an HTTP response with an explicit status and JSON payload.
- **Line 40:** Sensitive-configuration/data operation; inspect source without copying secret values. — Builds an HTTP response with an explicit status and JSON payload.

### `updateWebhook` — lines 43–57

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 44:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 45:** `const patch = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `if (req.body?.name !== undefined) patch.name = String(req.body.name).trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `if (req.body?.url !== undefined) patch.url = await validateWebhookUrl(req.body.url);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `if (req.body?.events !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `if (!Array.isArray(req.body.events) || req.body.events.some((event) => !allowedEvents.has(String(event)))) return res.status(400).json({ success: false, message: "Webhook contains unsupported event types." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `if (req.body?.active !== undefined) patch.active = Boolean(req.body.active);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 54:** `if (!doc) return res.status(404).json({ success: false, message: "Webhook not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `res.json({ success: true, data: doc });` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 56:** Sensitive-configuration/data operation; inspect source without copying secret values. — Builds an HTTP response with an explicit status and JSON payload.

### `testWebhook` — lines 59–84

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Webhook.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 60:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 61:** `const hook = await Webhook.findOne({ ...tenantFilter(req), _id: req.params.id }).select("_id events active").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `if (!hook) return res.status(404).json({ success: false, message: "Webhook not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `if (!hook.active) return res.status(409).json({ success: false, message: "Activate the webhook before sending a test delivery." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `const event = hook.events?.[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `if (!event) return res.status(409).json({ success: false, message: "Select at least one webhook event before testing delivery." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `const eventId = crypto.randomUUID();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `const job = await enqueueJob("webhook.delivery", {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 82:** `res.status(202).json({ success: true, message: "Webhook test queued for delivery.", jobId: job?._id || job?.id || null, event, eventId });` — Builds an HTTP response with an explicit status and JSON payload.

### `deleteWebhook` — lines 86–88

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 87:** `try { const doc = await Webhook.findOneAndDelete({ ...tenantFilter(req), _id: req.params.id }); if (!doc) return res.status(404).json({ success: false, message: "Webhook not found." }); res.json({ success: true, message:` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

## Module-level declarations

- Line 8: `const tenantId = (req) => req.tenant?.tenantId || req.tenant?.id || req.user?.tenantId;`.
- Line 9: `const keyView = (item) => ({ _id: item._id, name: item.name, prefix: item.prefix, scopes: item.scopes, expiresAt: item.expiresAt, lastUsedAt: item.lastUsedAt, revokedAt: item.revok`.
- Line 10: `const allowedEvents = new Set(["booking.created", "booking.updated", "payment.completed", "payment.failed", "invoice.created", "invoice.updated"]);`.
- Line 12: `<sensitive declaration redacted>`.
- Line 16: `<sensitive declaration redacted>`.
- Line 18: `const raw = \`gt_${crypto.randomBytes(30).toString("base64url")}\`;`.
- Line 19: `<sensitive declaration redacted>`.
- Line 24: `<sensitive declaration redacted>`.
- Line 28: `export const listWebhooks = async (req, res, next) => {`.
- Line 32: `export const createWebhook = async (req, res, next) => {`.
- Line 34: `const url = await validateWebhookUrl(req.body?.url);`.
- Line 35: `const requestedEvents = Array.isArray(req.body?.events) ? req.body.events.map(String).filter((event) => allowedEvents.has(event)) : [];`.
- Line 37: `<sensitive declaration redacted>`.
- Line 38: `<sensitive declaration redacted>`.
- Line 43: `export const updateWebhook = async (req, res, next) => {`.
- Line 45: `const patch = {};`.
- Line 53: `<sensitive declaration redacted>`.
- Line 59: `export const testWebhook = async (req, res, next) => {`.
- Line 61: `const hook = await Webhook.findOne({ ...tenantFilter(req), _id: req.params.id }).select("_id events active").lean();`.
- Line 64: `const event = hook.events?.[0];`.
- Line 66: `const eventId = crypto.randomUUID();`.
- Line 67: `const job = await enqueueJob("webhook.delivery", {`.
- Line 86: `export const deleteWebhook = async (req, res, next) => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

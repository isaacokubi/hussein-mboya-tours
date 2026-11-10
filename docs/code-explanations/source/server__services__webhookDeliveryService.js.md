# Source explanation: server/services/webhookDeliveryService.js

**Source:** [server/services/webhookDeliveryService.js](../../../server/services/webhookDeliveryService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dns` from `dns/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `net` from `net`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Webhook` from `../models/Webhook.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Webhook.js](../../../server/models/Webhook.js)
- `WebhookDelivery` from `../models/WebhookDelivery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebhookDelivery.js](../../../server/models/WebhookDelivery.js)
- `enqueueJob` from `./jobQueueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/jobQueueService.js](../../../server/services/jobQueueService.js)
- `postJsonToPinnedHttpsUrl` from `./ssrfSafeHttpsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/ssrfSafeHttpsService.js](../../../server/services/ssrfSafeHttpsService.js)

## Runtime declarations and data flow

### `secretKey` — lines 11–16

Parameters: none.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** Sensitive-configuration/data operation; inspect source without copying secret values. — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 13:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.

### `encryptSecret` — lines 17–17

Parameters: `secret`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `decryptSecret` — lines 18–18

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `isPrivateAddress` — lines 19–19

Parameters: `address`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `validateWebhookUrl` — lines 20–20

Parameters: `rawUrl`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `protectWebhookSecret` — lines 21–21

Parameters: `secret`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `queueWebhookEvent` — lines 22–22

Parameters: `{tenantId, event, data, sourceId}`.
Persistent operations detected: Webhook.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `async function queueWebhookEvent({ tenantId, event, data, sourceId = "" }) { if (process.env.DEMO_SEED_MODE === "true") return null; if (!tenantId || !event) return null; const hooks = await Webhook.find({ tenantId, acti` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `recordDelivery` — lines 23–23

Parameters: `{tenantId, webhookId, event, eventId, attempt, values}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `deliverWebhookJob` — lines 24–24

Parameters: `payload`, `job (defaulted)`.
Persistent operations detected: Webhook.findById; verify tenant/ownership filters in the exact query. 9 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 9: `const TIMEOUT_MS = Math.min(15000, Math.max(3000, Number(process.env.WEBHOOK_TIMEOUT_MS || 10000)));`.
- Line 10: `const MAX_BODY_BYTES = 64 * 1024;`.
- Line 11: `<sensitive declaration redacted>`.
- Line 12: `<sensitive declaration redacted>`.
- Line 17: `<sensitive declaration redacted>`.
- Line 18: `<sensitive declaration redacted>`.
- Line 19: `function isPrivateAddress(address) { if (net.isIPv4(address)) { const [a, b] = address.split(".").map(Number); return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

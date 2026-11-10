# Source explanation: server/services/whatsappService.js

**Source:** [server/services/whatsappService.js](../../../server/services/whatsappService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `axios` from `axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `sendWhatsApp` — lines 21–80

Parameters: `{to, message}`.
HTTP operations detected: axios.post; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 26:** `if (!to) throw new Error("WhatsApp recipient is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `if (!message) throw new Error("WhatsApp message is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `let normalizedTo = String(to).trim().replace(/[^0-9+]/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `if (/^0\d{9}$/.test(normalizedTo)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `if (!process.env.WHATSAPP_API_URL) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `throw new Error("WHATSAPP_API_URL is missing");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 39:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** Sensitive-configuration/data operation; inspect source without copying secret values. — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 43:** `const response = await axios.post(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 71:** `return response.data;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 78:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.

## Module-level declarations

- Line 21: `export const sendWhatsApp = async ({`.
- Line 29: `let normalizedTo = String(to).trim().replace(/[^0-9+]/g, "");`.
- Line 43: `const response = await axios.post(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

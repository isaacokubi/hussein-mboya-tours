# Source explanation: server/controllers/aiController.js

**Source:** [server/controllers/aiController.js](../../../server/controllers/aiController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `generateTravelAdvice` from `../services/aiService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/aiService.js](../../../server/services/aiService.js)
- `addMessage` from `../services/aiConversationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/aiConversationService.js](../../../server/services/aiConversationService.js)

## Runtime declarations and data flow

### `cleanMessage` — lines 21–22

Parameters: `message (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `askAI` — lines 33–105

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 41:** `let { message } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `if (typeof message !== "string") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 52:** `if (!message) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 59:** `if (message.length > MAX_MESSAGE_LENGTH) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 72:** `const reply = await generateTravelAdvice(message, req.user || null);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 80:** `if (!reply) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `return res.status(502).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 93:** `res.status(200).json({` — Builds an HTTP response with an explicit status and JSON payload.

## Module-level declarations

- Line 13: `const MAX_MESSAGE_LENGTH = 2000;`.
- Line 21: `const cleanMessage = (message = "") =>`.
- Line 33: `export const askAI = async (req, res, next) => {`.
- Line 41: `let { message } = req.body;`.
- Line 72: `const reply = await generateTravelAdvice(message, req.user || null);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

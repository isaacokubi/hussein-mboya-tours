# Source explanation: server/services/aiConversationService.js

**Source:** [server/services/aiConversationService.js](../../../server/services/aiConversationService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `AIConversation` from `../models/AIConversation.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AIConversation.js](../../../server/models/AIConversation.js)

## Runtime declarations and data flow

### `getConversation` — lines 5–37

Parameters: `sessionId`, `user (defaulted)`.
Persistent operations detected: AIConversation.findOne, AIConversation.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `let conversation =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `await AIConversation.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `if(!conversation){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `await AIConversation.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `return conversation;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `addMessage` — lines 41–70

Parameters: `sessionId`, `role`, `content`, `user (defaulted)`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 49:** `const conversation =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `await getConversation(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 65:** `await conversation.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 68:** `return conversation;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `export const getConversation = async (`.
- Line 12: `let conversation =`.
- Line 41: `export const addMessage = async (`.
- Line 49: `const conversation =`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

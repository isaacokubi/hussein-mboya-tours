# Source explanation: server/services/mfaService.js

**Source:** [server/services/mfaService.js](../../../server/services/mfaService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `bcrypt` from `bcryptjs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `generateLoginPin` — lines 5–6

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `hashLoginPin` — lines 8–9

Parameters: `pin`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `verifyLoginPin` — lines 11–14

Parameters: `pin`, `hash`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `if (!pin || !hash) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `return bcrypt.compare(String(pin), String(hash));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeMfaPhone` — lines 16–23

Parameters: `phone`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `let value = String(phone || "").trim().replace(/\s+/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (value.startsWith("+254")) value = \`0${value.slice(4)}\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `else if (value.startsWith("254")) value = \`0${value.slice(3)}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `return /^\d{10}$/.test(value) ? value : "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `export const generateLoginPin = () =>`.
- Line 8: `export const hashLoginPin = async (pin) =>`.
- Line 11: `export const verifyLoginPin = async (pin, hash) => {`.
- Line 16: `export const normalizeMfaPhone = (phone) => {`.
- Line 17: `let value = String(phone || "").trim().replace(/\s+/g, "");`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

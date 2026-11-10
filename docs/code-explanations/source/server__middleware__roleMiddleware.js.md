# Source explanation: server/middleware/roleMiddleware.js

**Source:** [server/middleware/roleMiddleware.js](../../../server/middleware/roleMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `requireRoles` from `./authMiddleware.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/middleware/authMiddleware.js](../../../server/middleware/authMiddleware.js)

## Runtime declarations and data flow

### `roleMiddleware` — lines 6–6

Parameters: `...allowedRoles`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `export const roleMiddleware = (...allowedRoles) => requireRoles(...allowedRoles);`.
- Line 8: `export const adminOnly = roleMiddleware("admin", "super_admin");`.
- Line 9: `export const managerOnly = roleMiddleware("manager", "admin", "super_admin");`.
- Line 10: `export const agentOnly = roleMiddleware("agent", "admin", "super_admin");`.
- Line 11: `export const guideOnly = roleMiddleware("guide", "admin", "super_admin");`.
- Line 12: `export const driverOnly = roleMiddleware("driver", "admin", "super_admin");`.
- Line 13: `export const customerOnly = roleMiddleware("customer");`.
- Line 15: `export const authorizeRole = roleMiddleware;`.
- Line 16: `export const authorizeRoles = roleMiddleware;`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

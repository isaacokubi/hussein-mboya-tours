# Source explanation: server/controllers/adminAuthController.js

**Source:** [server/controllers/adminAuthController.js](../../../server/controllers/adminAuthController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `generateToken` from `../utils/generateToken.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/generateToken.js](../../../server/utils/generateToken.js)
- `buildPermissions` from `../utils/buildPermissions.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/buildPermissions.js](../../../server/utils/buildPermissions.js)
- `normalizeRole` from `../utils/roleUtils.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/roleUtils.js](../../../server/utils/roleUtils.js)

## Runtime declarations and data flow

### `effectiveRole` — lines 10–11

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isPlatformOwner` — lines 13–14

Parameters: `user`, `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `adminLogin` — lines 16–92

Parameters: `req`, `res`.
Reads request/component inputs: req.body. Persistent operations detected: User.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 18:** `const email = String(req.body?.email || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 30:** `const platformUser = await runWithTenant(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `User.findOne({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 43:** `let user = platformUser;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `if (!user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `user = await User.findOne({ email })` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 54:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 58:** `const role = effectiveRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `if (!ADMIN_ROLES.has(role)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `return res.status(403).json({ success: false, message: "Administrative access required." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 63:** `const platformOwner = isPlatformOwner(user, role);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const permissions = buildPermissions(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 7: `const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);`.
- Line 8: `const ADMIN_ROLES = new Set(["admin", "super_admin", "superadmin"]);`.
- Line 10: `const effectiveRole = (user) =>`.
- Line 13: `const isPlatformOwner = (user, role) =>`.
- Line 16: `export const adminLogin = async (req, res) => {`.
- Line 18: `const email = String(req.body?.email || "").trim().toLowerCase();`.
- Line 19: `<sensitive declaration redacted>`.
- Line 30: `const platformUser = await runWithTenant(`.
- Line 43: `let user = platformUser;`.
- Line 58: `const role = effectiveRole(user);`.
- Line 63: `const platformOwner = isPlatformOwner(user, role);`.
- Line 64: `const permissions = buildPermissions(user);`.
- Line 65: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

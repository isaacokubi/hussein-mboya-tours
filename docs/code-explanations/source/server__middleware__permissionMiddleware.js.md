# Source explanation: server/middleware/permissionMiddleware.js

**Source:** [server/middleware/permissionMiddleware.js](../../../server/middleware/permissionMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `getUserRole` from `../utils/roleUtils.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/roleUtils.js](../../../server/utils/roleUtils.js)

## Runtime declarations and data flow

### `normalizePermission` — lines 27–27

Parameters: `permission`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isPlatformRole` — lines 31–34

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 32:** `const normalized = String(role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `return normalized === "super_admin" || normalized === "superadmin";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `extractEnabledPermissions` — lines 36–40

Parameters: `items (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `expandPermissionAliases` — lines 42–48

Parameters: `permissions (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 43:** `const expanded = new Set(permissions.map(normalizePermission));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `for (const permission of [...expanded]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 45:** `for (const alias of PERMISSION_ALIASES[permission] || []) expanded.add(normalizePermission(alias));` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 47:** `return [...expanded];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getEffectivePermissions` — lines 50–62

Parameters: `user`.
Persistent operations detected: Role.findById; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 51:** `const roleName = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `if (isPlatformRole(roleName)) return ["*"];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `let permissions = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `if (user?.roleId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `const role = await Role.findById(user.roleId).populate("permissions", "name enabled");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `if (roleName === "admin") permissions.push(...ADMIN_COMPATIBILITY_PERMISSIONS.map(normalizePermission));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `return [...new Set(expandPermissionAliases(permissions))];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `authorize` — lines 64–80

Parameters: `permission`.
Reads request/component inputs: req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 66:** `if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 67:** `const wanted = normalizePermission(permission);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `if (!wanted) return res.status(500).json({ success: false, message: "Authorization configuration error" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `const permissions = await getEffectivePermissions(req.user);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 70:** `const acceptedPermissions = PERMISSION_ALIASES[wanted] || [wanted];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `if (permissions.includes("*") || acceptedPermissions.some((candidate) => permissions.includes(candidate))) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 75:** `return res.status(403).json({ success: false, message: "Access denied. Missing required permission.", required: wanted });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 78:** `return res.status(500).json({ success: false, message: "Permission check failed" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const ADMIN_COMPATIBILITY_PERMISSIONS = [`.
- Line 14: `const PERMISSION_ALIASES = {`.
- Line 27: `const normalizePermission = (permission) => String(permission || "").trim().toLowerCase();`.
- Line 31: `const isPlatformRole = (role) => {`.
- Line 32: `const normalized = String(role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");`.
- Line 36: `const extractEnabledPermissions = (items = []) => items`.
- Line 42: `const expandPermissionAliases = (permissions = []) => {`.
- Line 43: `const expanded = new Set(permissions.map(normalizePermission));`.
- Line 50: `export const getEffectivePermissions = async (user) => {`.
- Line 51: `const roleName = getUserRole(user);`.
- Line 54: `let permissions = [];`.
- Line 56: `const role = await Role.findById(user.roleId).populate("permissions", "name enabled");`.
- Line 64: `export const authorize = (permission) => async (req, res, next) => {`.
- Line 67: `const wanted = normalizePermission(permission);`.
- Line 69: `const permissions = await getEffectivePermissions(req.user);`.
- Line 70: `const acceptedPermissions = PERMISSION_ALIASES[wanted] || [wanted];`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

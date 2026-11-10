# Source explanation: server/services/securityService.js

**Source:** [server/services/securityService.js](../../../server/services/securityService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Permission` from `../models/Permission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Permission.js](../../../server/models/Permission.js)
- `SecurityLog` from `../models/SecurityLog.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SecurityLog.js](../../../server/models/SecurityLog.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `normalizeRoleName` — lines 8–8

Parameters: `value (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getSecurityEvents` — lines 11–13

Parameters: none.
Persistent operations detected: SecurityLog.find; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 12:** `return SecurityLog.find({}).sort({ createdAt: -1 }).limit(100).lean();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getSecurityStatus` — lines 15–56

Parameters: none.
Persistent operations detected: Role.find, User.countDocuments, Permission.countDocuments, SecurityLog.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 16:** `const since = new Date(Date.now() - 24 * 60 * 60 * 1000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const adminRoleIds = await Role.find({ name: { $in: PLATFORM_ADMIN_ROLES } }).distinct("_id");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `const [totalUsers, adminsByRole, adminsByLegacyRole, adminsByRoleId, roleDocs, permissionCount, failedAttempts, criticalEvents] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `User.countDocuments(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 21:** `User.countDocuments({ role: { $in: PLATFORM_ADMIN_ROLES } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 22:** `User.countDocuments({ legacyRole: { $in: PLATFORM_ADMIN_ROLES } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 23:** `adminRoleIds.length ? User.countDocuments({ roleId: { $in: adminRoleIds } }) : Promise.resolve(0),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 24:** `Role.find({}).select("name").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 25:** `Permission.countDocuments({ isActive: { $ne: false } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 26:** `SecurityLog.countDocuments({ status: "failed", createdAt: { $gte: since } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 27:** `SecurityLog.countDocuments({ severity: "critical", createdAt: { $gte: since } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 30:** `const admins = Math.max(adminsByRole, adminsByLegacyRole, adminsByRoleId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const uniqueRoleNames = new Set(roleDocs.map((role) => normalizeRoleName(role.name)).filter(Boolean));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const roles = uniqueRoleNames.size;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const threatLevel = criticalEvents > 0 || failedAttempts > 200 ? "high" : failedAttempts > 50 ? "medium" : "low";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const securityScore = Math.max(0, Math.min(100, 100 - (threatLevel === "high" ? 40 : threatLevel === "medium" ? 20 : 0) - Math.min(20, criticalEvents * 5)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const database = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const authorizationActive = roles > 0 && permissionCount > 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 7: `const PLATFORM_ADMIN_ROLES = ["admin", "administrator", "super_admin", "superadmin"];`.
- Line 8: `const normalizeRoleName = (value = "") => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");`.
- Line 10: `const securityService = {`.
- Line 16: `const since = new Date(Date.now() - 24 * 60 * 60 * 1000);`.
- Line 17: `const adminRoleIds = await Role.find({ name: { $in: PLATFORM_ADMIN_ROLES } }).distinct("_id");`.
- Line 19: `const [totalUsers, adminsByRole, adminsByLegacyRole, adminsByRoleId, roleDocs, permissionCount, failedAttempts, criticalEvents] = await Promise.all([`.
- Line 30: `const admins = Math.max(adminsByRole, adminsByLegacyRole, adminsByRoleId);`.
- Line 31: `const uniqueRoleNames = new Set(roleDocs.map((role) => normalizeRoleName(role.name)).filter(Boolean));`.
- Line 32: `const roles = uniqueRoleNames.size;`.
- Line 33: `const threatLevel = criticalEvents > 0 || failedAttempts > 200 ? "high" : failedAttempts > 50 ? "medium" : "low";`.
- Line 34: `const securityScore = Math.max(0, Math.min(100, 100 - (threatLevel === "high" ? 40 : threatLevel === "medium" ? 20 : 0) - Math.min(20, criticalEvents * 5)));`.
- Line 35: `const database = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";`.
- Line 36: `const authorizationActive = roles > 0 && permissionCount > 0;`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

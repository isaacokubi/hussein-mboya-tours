# Source explanation: server/utils/buildPermissions.js

**Source:** [server/utils/buildPermissions.js](../../../server/utils/buildPermissions.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `normalizeRole` — lines 2–2

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `buildPermissions` — lines 5–22

Parameters: `user`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `if (!user) return [];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `const rolePermissions = Array.isArray(user.role?.permissions) ? user.role.permissions : Array.isArray(user.roleId?.permissions) ? user.roleId.permissions : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const overrides = Array.isArray(user.permissionsOverride) ? user.permissionsOverride : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const effectiveRole = normalizeRole(user.role) || normalizeRole(user.roleId) || normalizeRole(user.legacyRole);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const permissionMap = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const addPermission = (permission) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `if (!permission) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (typeof permission === "string") { permissionMap.set(permission, { name: permission, label: permission, module: null, icon: null, path: null }); return; }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (!permission.name) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (permission.enabled === false) { permissionMap.delete(permission.name); return; }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (["admin", "administrator", "super_admin", "superadmin"].includes(effectiveRole)) ADMIN_BASE_PERMISSIONS.forEach(addPermission);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `return [...permissionMap.values()].sort((a, b) => a.label.localeCompare(b.label));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `addPermission` — lines 11–17

Parameters: `permission`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `if (!permission) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (typeof permission === "string") { permissionMap.set(permission, { name: permission, label: permission, module: null, icon: null, path: null }); return; }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (!permission.name) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (permission.enabled === false) { permissionMap.delete(permission.name); return; }` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 1: `const ADMIN_BASE_PERMISSIONS = ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "settings.ma`.
- Line 2: `const normalizeRole = (value) => { const raw = typeof value === "object" ? value?.name || value?.role : value; return String(raw || "").trim().toLowerCase().replace(/[\s-]+/g, "_")`.
- Line 7: `const rolePermissions = Array.isArray(user.role?.permissions) ? user.role.permissions : Array.isArray(user.roleId?.permissions) ? user.roleId.permissions : [];`.
- Line 8: `const overrides = Array.isArray(user.permissionsOverride) ? user.permissionsOverride : [];`.
- Line 9: `const effectiveRole = normalizeRole(user.role) || normalizeRole(user.roleId) || normalizeRole(user.legacyRole);`.
- Line 10: `const permissionMap = new Map();`.
- Line 11: `const addPermission = (permission) => {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

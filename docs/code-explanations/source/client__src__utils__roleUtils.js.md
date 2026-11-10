# Source explanation: client/src/utils/roleUtils.js

**Source:** [client/src/utils/roleUtils.js](../../../client/src/utils/roleUtils.js)

## Purpose

A client utility/helper used by pages, hooks, or components; inspect its exported functions for exact transformation rules.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `normalizeRole` — lines 11–18

Parameters: `role`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `if (!role) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (typeof role === "object") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `const key = String(role).trim().toLowerCase().replace(/[\s-]+/g, "_");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `return ROLE_ALIASES[key] || ROLE_ALIASES[key.replace(/_/g, "")] || key;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getUserRole` — lines 20–29

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 21:** `return normalizeRole(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isSuperAdmin` — lines 31–31

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isAdmin` — lines 32–32

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isManager` — lines 33–33

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isAgent` — lines 34–34

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isGuide` — lines 35–35

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isDriver` — lines 36–36

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isCustomer` — lines 37–37

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `dashboardPath` — lines 39–50

Parameters: `user`.
8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 40:** `switch (getUserRole(user)) {` — This branch selects behavior by the current value; verify every case and the default path.
- **Line 41:** `case "super_admin": return "/superadmin/dashboard";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `case "admin": return "/admin/dashboard";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `case "tour_manager": return "/tour-manager/dashboard";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `case "agent": return "/agent/dashboard";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `case "tour_guide": return "/guide/dashboard";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `case "driver": return "/driver/dashboard";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `case "customer": return "/dashboard";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 1: `const ROLE_ALIASES = {`.
- Line 11: `export function normalizeRole(role) {`.
- Line 16: `const key = String(role).trim().toLowerCase().replace(/[\s-]+/g, "_");`.
- Line 20: `export function getUserRole(user) {`.
- Line 31: `export function isSuperAdmin(user) { return getUserRole(user) === "super_admin"; }`.
- Line 32: `export function isAdmin(user) { return ["admin", "super_admin"].includes(getUserRole(user)); }`.
- Line 33: `export function isManager(user) { return getUserRole(user) === "tour_manager"; }`.
- Line 34: `export function isAgent(user) { return getUserRole(user) === "agent"; }`.
- Line 35: `export function isGuide(user) { return getUserRole(user) === "tour_guide"; }`.
- Line 36: `export function isDriver(user) { return getUserRole(user) === "driver"; }`.
- Line 37: `export function isCustomer(user) { return getUserRole(user) === "customer"; }`.
- Line 39: `export function dashboardPath(user) {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

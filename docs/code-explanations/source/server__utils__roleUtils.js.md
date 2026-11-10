# Source explanation: server/utils/roleUtils.js

**Source:** [server/utils/roleUtils.js](../../../server/utils/roleUtils.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `normalizeRole` — lines 26–48

Parameters: `role`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 27:** `if (!role) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `if (typeof role === "object") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `const key = String(role)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getUserRole` — lines 50–57

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 51:** `return normalizeRole(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isSuperAdmin` — lines 59–61

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 60:** `return getUserRole(user) === "super_admin";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isAdmin` — lines 63–65

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 64:** `return ["admin", "super_admin"].includes(getUserRole(user));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isManager` — lines 67–69

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 68:** `return ["tour_manager", "admin", "super_admin"].includes(getUserRole(user));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isAgent` — lines 71–73

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 72:** `return ["agent", "admin", "super_admin"].includes(getUserRole(user));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isGuide` — lines 75–77

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 76:** `return ["tour_guide", "admin", "super_admin"].includes(getUserRole(user));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isDriver` — lines 79–81

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 80:** `return ["driver", "admin", "super_admin"].includes(getUserRole(user));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isCustomer` — lines 83–85

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 84:** `return getUserRole(user) === "customer";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isStaff` — lines 87–96

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 88:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 1: `const ROLE_ALIASES = {`.
- Line 26: `export function normalizeRole(role) {`.
- Line 38: `const key = String(role)`.
- Line 50: `export function getUserRole(user) {`.
- Line 59: `export function isSuperAdmin(user) {`.
- Line 63: `export function isAdmin(user) {`.
- Line 67: `export function isManager(user) {`.
- Line 71: `export function isAgent(user) {`.
- Line 75: `export function isGuide(user) {`.
- Line 79: `export function isDriver(user) {`.
- Line 83: `export function isCustomer(user) {`.
- Line 87: `export function isStaff(user) {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

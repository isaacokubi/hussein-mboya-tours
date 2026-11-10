# Source explanation: server/tenancy/context.js

**Source:** [server/tenancy/context.js](../../../server/tenancy/context.js)

## Purpose

A tenant context/query isolation primitive used by request middleware, model plugins and domain services.

## Imports and dependencies

- `AsyncLocalStorage` from `async_hooks`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `isPlatformRole` — lines 5–5

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeTenantId` — lines 7–12

Parameters: `value`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `if (value == null || value === "") return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `if (typeof value === "string") return value;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `if (value?._id) return String(value._id);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `return String(value);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `runWithTenant` — lines 18–34

Parameters: `context`, `callback`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const role = String(context?.role || "").trim().toLowerCase() || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const platformOwner = isPlatformRole(role);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const store = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `if (platformOwner) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `return await callback();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 33:** `return tenantStorage.run(store, async () => await callback());` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `setTenantContext` — lines 36–50

Parameters: `context`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 37:** `const current = tenantStorage.getStore();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const role = String(context?.role || current?.role || "").trim().toLowerCase() || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const platformOwner = isPlatformRole(role);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const store = current || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `if (!current) tenantStorage.enterWith(store);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `getTenantContext` — lines 52–59

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 53:** `return tenantStorage.getStore() || {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `requireTenantId` — lines 61–70

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 62:** `const { tenantId } = getTenantContext();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `if (!tenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `const error = new Error("Tenant context is required");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 69:** `return tenantId;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTenantId` — lines 72–74

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 73:** `return getTenantContext().tenantId || null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isTenantBypassed` — lines 76–78

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 77:** `return getTenantContext().bypass === true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `mergeTenantFilter` — lines 93–106

Parameters: `filter (defaulted)`, `maybeFilter`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 94:** `const context = getTenantContext();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `const effectiveFilter = maybeFilter === undefined ? filter : maybeFilter;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `if (context.bypass === true) return { ...(effectiveFilter || {}) };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 98:** `if (!context.tenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `const error = new Error("Tenant context is required");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 105:** `return { ...(effectiveFilter || {}), tenantId: context.tenantId };` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 3: `const tenantStorage = new AsyncLocalStorage();`.
- Line 4: `const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);`.
- Line 5: `const isPlatformRole = (role) => PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());`.
- Line 7: `const normalizeTenantId = (value) => {`.
- Line 19: `const role = String(context?.role || "").trim().toLowerCase() || null;`.
- Line 20: `const platformOwner = isPlatformRole(role);`.
- Line 21: `const store = {`.
- Line 36: `export function setTenantContext(context) {`.
- Line 37: `const current = tenantStorage.getStore();`.
- Line 38: `const role = String(context?.role || current?.role || "").trim().toLowerCase() || null;`.
- Line 39: `const platformOwner = isPlatformRole(role);`.
- Line 40: `const store = current || {};`.
- Line 52: `export function getTenantContext() {`.
- Line 61: `export function requireTenantId() {`.
- Line 62: `const { tenantId } = getTenantContext();`.
- Line 64: `const error = new Error("Tenant context is required");`.
- Line 72: `export function getTenantId() {`.
- Line 76: `export function isTenantBypassed() {`.
- Line 93: `export function mergeTenantFilter(filter = {}, maybeFilter) {`.
- Line 94: `const context = getTenantContext();`.
- Line 95: `const effectiveFilter = maybeFilter === undefined ? filter : maybeFilter;`.
- Line 99: `const error = new Error("Tenant context is required");`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/services/customerProfileService.js

**Source:** [server/services/customerProfileService.js](../../../server/services/customerProfileService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `splitName` — lines 4–7

Parameters: `name (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 5:** `const parts = String(name).trim().split(/\s+/).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `return { firstName: parts.shift() || "Customer", lastName: parts.join(" ") || "Account" };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ensureCustomerProfile` — lines 9–48

Parameters: `user`, `arg2 (defaulted)`.
Persistent operations detected: Customer.findOne, Customer.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `if (!user || String(user.role || "").trim().toLowerCase() !== "customer") return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `if (!user.tenantId) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (String(tenantId) !== String(user.tenantId)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `const error = new Error("Customer profile tenant mismatch");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 21:** `const existing = await Customer.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `if (existing) return existing;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `const { firstName, lastName } = splitName(user.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 28:** `return await Customer.create({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 41:** `if (error?.code === 11000) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `return Customer.findOne(` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 46:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.

## Module-level declarations

- Line 4: `const splitName = (name = "") => {`.
- Line 5: `const parts = String(name).trim().split(/\s+/).filter(Boolean);`.
- Line 9: `export const ensureCustomerProfile = async (user, { createdBy = null } = {}) => {`.
- Line 13: `const tenantId = requireTenantId();`.
- Line 15: `const error = new Error("Customer profile tenant mismatch");`.
- Line 21: `const existing = await Customer.findOne(`.
- Line 26: `const { firstName, lastName } = splitName(user.name);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

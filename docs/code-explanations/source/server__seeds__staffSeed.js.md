# Source explanation: server/seeds/staffSeed.js

**Source:** [server/seeds/staffSeed.js](../../../server/seeds/staffSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `seedStaff` — lines 19–64

Parameters: none.
Persistent operations detected: Organization.findById, Organization.findOne; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 21:** `const requestedTenantId = String(process.env.TENANT_ID || "").trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 22:** `const requestedTenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 23:** `const requestedTenantName = String(process.env.TENANT_NAME || "").trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 25:** `if (!requestedTenantId && !requestedTenantSlug && !requestedTenantName) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running the staff seed.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 29:** `const mongoUri = String(process.env.MONGODB_URI || "").trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 30:** `if (!mongoUri) throw new Error("MONGODB_URI is missing in server/.env");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `await mongoose.connect(mongoUri);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `let organization;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `if (requestedTenantId) organization = await Organization.findById(requestedTenantId).lean();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `else if (requestedTenantSlug) organization = await Organization.findOne({ slug: requestedTenantSlug }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `else organization = await Organization.findOne({ name: requestedTenantName }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `if (!organization) throw new Error("Tenant organization was not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const staff = await runWithTenant(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `const results = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `for (const member of staffMembers) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 46:** `await Staff.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 11: `const staffMembers = [`.
- Line 19: `const seedStaff = async () => {`.
- Line 21: `const requestedTenantId = String(process.env.TENANT_ID || "").trim();`.
- Line 22: `const requestedTenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();`.
- Line 23: `const requestedTenantName = String(process.env.TENANT_NAME || "").trim();`.
- Line 29: `const mongoUri = String(process.env.MONGODB_URI || "").trim();`.
- Line 33: `let organization;`.
- Line 40: `const staff = await runWithTenant(`.
- Line 43: `const results = [];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

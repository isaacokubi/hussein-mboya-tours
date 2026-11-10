# Source explanation: server/scripts/migrateOrphanStaffToTenant.js

**Source:** [server/scripts/migrateOrphanStaffToTenant.js](../../../server/scripts/migrateOrphanStaffToTenant.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `migrate` — lines 15–69

Parameters: none.
Persistent operations detected: Organization.findById, Organization.findOne, Organization.find; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `if (!tenantId && !tenantSlug && !tenantName) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running this migration.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 20:** `if (!mongoUri) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `throw new Error("MONGODB_URI is not configured. Put it in server/.env or export MONGODB_URI before running the migration.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 24:** `await mongoose.connect(mongoUri);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `let organization;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `if (tenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `organization = await Organization.findById(tenantId).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `organization = await Organization.findOne({ slug: tenantSlug }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `const organizations = await Organization.find({ name: tenantName }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `if (organizations.length > 1) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `throw new Error(\`Multiple tenant organizations found with name "${tenantName}". Use TENANT_ID or TENANT_SLUG instead.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 40:** `if (!organization) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `throw new Error("Tenant organization was not found.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 44:** `const orphanFilter = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const orphanCount = await Staff.collection.countDocuments(orphanFilter);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `if (orphanCount === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 10: `const tenantId = String(process.env.TENANT_ID || "").trim();`.
- Line 11: `const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();`.
- Line 12: `const tenantName = String(process.env.TENANT_NAME || "").trim();`.
- Line 13: `const mongoUri = String(process.env.MONGODB_URI || "").trim();`.
- Line 15: `const migrate = async () => {`.
- Line 26: `let organization;`.
- Line 33: `const organizations = await Organization.find({ name: tenantName }).lean();`.
- Line 44: `const orphanFilter = {`.
- Line 47: `const orphanCount = await Staff.collection.countDocuments(orphanFilter);`.
- Line 60: `const result = await runWithTenant(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

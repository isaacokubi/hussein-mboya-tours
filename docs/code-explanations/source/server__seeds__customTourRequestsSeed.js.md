# Source explanation: server/seeds/customTourRequestsSeed.js

**Source:** [server/seeds/customTourRequestsSeed.js](../../../server/seeds/customTourRequestsSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `CustomTourRequest` from `../models/CustomTourRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CustomTourRequest.js](../../../server/models/CustomTourRequest.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `seed` — lines 19–41

Parameters: none.
Persistent operations detected: Organization.findOne, CustomTourRequest.countDocuments; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 23:** `const organization = await Organization.findOne({ slug: TENANT_SLUG, isDeleted: { $ne: true } }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `if (!organization) throw new Error("Tenant " + TENANT_SLUG + " was not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `await runWithTenant({ tenantId: organization._id, tenant: organization }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `for (const data of requests) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 28:** `await CustomTourRequest.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `const count = await CustomTourRequest.countDocuments({ tenantId: organization._id });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `await mongoose.connection.close().catch(() => {});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 9: `const TENANT_SLUG = "amani-trails-safaris";`.
- Line 11: `const requests = [`.
- Line 19: `const seed = async () => {`.
- Line 23: `const organization = await Organization.findOne({ slug: TENANT_SLUG, isDeleted: { $ne: true } }).lean();`.
- Line 35: `const count = await CustomTourRequest.countDocuments({ tenantId: organization._id });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

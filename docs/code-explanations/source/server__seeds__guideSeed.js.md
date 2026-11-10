# Source explanation: server/seeds/guideSeed.js

**Source:** [server/seeds/guideSeed.js](../../../server/seeds/guideSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Permission` from `../models/Permission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Permission.js](../../../server/models/Permission.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `seedGuides` — lines 21–126

Parameters: none.
Persistent operations detected: Organization.findById, Organization.findOne, Permission.findOne, Permission.create, Role.findOne, Role.create; verify tenant/ownership filters in the exact query. 13 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 14 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 23:** `const tenantId = String(process.env.TENANT_ID || "").trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 24:** `const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 25:** `const tenantName = String(process.env.TENANT_NAME || "").trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 26:** `if (!tenantId && !tenantSlug && !tenantName) throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running the guide seed.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const mongoUri = String(process.env.MONGODB_URI || "").trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 28:** `if (!mongoUri) throw new Error("MONGODB_URI is missing in server/.env");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `await mongoose.connect(mongoUri);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `let organization;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (tenantId) organization = await Organization.findById(tenantId).lean();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `else if (tenantSlug) organization = await Organization.findOne({ slug: tenantSlug }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `else organization = await Organization.findOne({ name: tenantName }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `if (!organization) throw new Error("Tenant organization was not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `await runWithTenant({ tenantId: organization._id, tenant: organization }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `const permissionNames = ["view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const permissionIds = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `for (const name of permissionNames) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 44:** `let permission = await Permission.findOne({ name });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 15: `const guides = [`.
- Line 21: `const seedGuides = async () => {`.
- Line 23: `const tenantId = String(process.env.TENANT_ID || "").trim();`.
- Line 24: `const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();`.
- Line 25: `const tenantName = String(process.env.TENANT_NAME || "").trim();`.
- Line 27: `const mongoUri = String(process.env.MONGODB_URI || "").trim();`.
- Line 32: `let organization;`.
- Line 41: `const permissionNames = ["view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"];`.
- Line 42: `const permissionIds = [];`.
- Line 44: `let permission = await Permission.findOne({ name });`.
- Line 57: `let guideRole = await Role.findOne({ name: "guide" });`.
- Line 77: `<sensitive declaration redacted>`.
- Line 78: `const user = await User.findOneAndUpdate(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

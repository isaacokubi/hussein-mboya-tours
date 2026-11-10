# Source explanation: server/seeds/adminSeed.js

**Source:** [server/seeds/adminSeed.js](../../../server/seeds/adminSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Permission` from `../models/Permission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Permission.js](../../../server/models/Permission.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `createAdmin` — lines 13–63

Parameters: none.
Persistent operations detected: Organization.findById, Organization.findOne, Permission.findOne, Permission.create, Role.findOne, Role.create; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 15:** `const tenantId = String(process.env.TENANT_ID || "").trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 16:** `const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 17:** `if (!tenantId && !tenantSlug) throw new Error("Set TENANT_ID or TENANT_SLUG before running the admin seed.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `const organization = tenantId` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `? await Organization.findById(tenantId).lean()` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `: await Organization.findOne({ slug: tenantSlug }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `if (!organization) throw new Error("Tenant organization was not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `const permissionNames = ["manage_users", "manage_tours", "manage_destinations", "manage_bookings", "manage_payments", "view_reports"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const permissionIds = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `for (const name of permissionNames) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 29:** `let permission = await Permission.findOne({ name });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `if (!permission) permission = await Permission.create({ name, label: name.replace(/_/g, " "), module: name.split(/[._]/)[0], category: "other" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `let adminRole = await Role.findOne({ name: "admin" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `if (!adminRole) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `adminRole = await Role.create({ name: "admin", displayName: "Admin", permissions: permissionIds });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `await adminRole.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 13: `const createAdmin = async () => {`.
- Line 15: `const tenantId = String(process.env.TENANT_ID || "").trim();`.
- Line 16: `const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();`.
- Line 21: `const organization = tenantId`.
- Line 26: `const permissionNames = ["manage_users", "manage_tours", "manage_destinations", "manage_bookings", "manage_payments", "view_reports"];`.
- Line 27: `const permissionIds = [];`.
- Line 29: `let permission = await Permission.findOne({ name });`.
- Line 34: `let adminRole = await Role.findOne({ name: "admin" });`.
- Line 42: `const email = String(process.env.SEED_ADMIN_EMAIL || "admin@husseinmboyatours.com").trim().toLowerCase();`.
- Line 43: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

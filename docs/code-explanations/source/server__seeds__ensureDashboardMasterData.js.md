# Source explanation: server/seeds/ensureDashboardMasterData.js

**Source:** [server/seeds/ensureDashboardMasterData.js](../../../server/seeds/ensureDashboardMasterData.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `Supplier` from `../models/Supplier.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Supplier.js](../../../server/models/Supplier.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `main` — lines 17–56

Parameters: none.
Persistent operations detected: Organization.find, User.find, Supplier.find, Supplier.create; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `if (tenants.length !== 3) throw new Error(\`SAFE STOP: expected exactly 3 tenants, found ${tenants.length}.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const results = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `for (const tenant of tenants) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 26:** `await runWithTenant({ tenantId: tenant._id, role: "manager", bypass: false }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `const users = await User.find({ isDeleted: { $ne: true } }).limit(100).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 31:** `let suppliers = await Supplier.find({ isDeleted: { $ne: true } }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `for (let i = suppliers.length; i < 2; i += 1) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 33:** `const template = supplierTemplates[i % supplierTemplates.length];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const supplier = await Supplier.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 10: `const supplierTemplates = [`.
- Line 21: `const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();`.
- Line 24: `const results = [];`.
- Line 28: `const users = await User.find({ isDeleted: { $ne: true } }).limit(100).lean();`.
- Line 29: `const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;`.
- Line 31: `let suppliers = await Supplier.find({ isDeleted: { $ne: true } }).lean();`.
- Line 33: `const template = supplierTemplates[i % supplierTemplates.length];`.
- Line 34: `const supplier = await Supplier.create({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

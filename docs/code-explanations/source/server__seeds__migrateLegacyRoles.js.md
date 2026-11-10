# Source explanation: server/seeds/migrateLegacyRoles.js

**Source:** [server/seeds/migrateLegacyRoles.js](../../../server/seeds/migrateLegacyRoles.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `normalizeRole` from `../utils/roleUtils.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/roleUtils.js](../../../server/utils/roleUtils.js)

## Runtime declarations and data flow

### `normalizeRoleDocument` — lines 10–11

Parameters: `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tenantKey` — lines 13–13

Parameters: `tenantId`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `migrateRoles` — lines 15–125

Parameters: none.
7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 14 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const roles = await db.collection("roles").find({}).sort({ createdAt: 1, _id: 1 }).toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `const users = await db.collection("users").find({}).project({ _id: 1, tenantId: 1, roleId: 1, role: 1, legacyRole: 1 }).toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `const groups = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `for (const role of roles) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 26:** `const canonical = normalizeRoleDocument(role);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `if (!canonical) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const key = \`${tenantKey(role.tenantId)}:${canonical}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (!groups.has(key)) groups.set(key, []);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const userOps = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const roleOps = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const deleteIds = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const report = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `for (const [key, members] of groups) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 39:** `const canonicalRole = members.find((role) => String(role.name || "").toLowerCase() === role.canonical) || members[0];` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 40:** `const canonicalName = canonicalRole.canonical;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 8: `const APPLY = String(process.env.APPLY_ROLE_NORMALIZATION || "").toLowerCase() === "true";`.
- Line 10: `const normalizeRoleDocument = (role) =>`.
- Line 13: `const tenantKey = (tenantId) => String(tenantId || "platform");`.
- Line 15: `const migrateRoles = async () => {`.
- Line 20: `const db = mongoose.connection.db;`.
- Line 21: `const roles = await db.collection("roles").find({}).sort({ createdAt: 1, _id: 1 }).toArray();`.
- Line 22: `const users = await db.collection("users").find({}).project({ _id: 1, tenantId: 1, roleId: 1, role: 1, legacyRole: 1 }).toArray();`.
- Line 24: `const groups = new Map();`.
- Line 26: `const canonical = normalizeRoleDocument(role);`.
- Line 28: `const key = \`${tenantKey(role.tenantId)}:${canonical}\`;`.
- Line 33: `const userOps = [];`.
- Line 34: `const roleOps = [];`.
- Line 35: `const deleteIds = [];`.
- Line 36: `const report = [];`.
- Line 39: `const canonicalRole = members.find((role) => String(role.name || "").toLowerCase() === role.canonical) || members[0];`.
- Line 40: `const canonicalName = canonicalRole.canonical;`.
- Line 41: `const mergedPermissions = [...new Set(members.flatMap((role) => (role.permissions || []).map((id) => String(id)).filter((id) => mongoose.isValidObjectId(id))))];`.
- Line 42: `const duplicateIds = members.filter((role) => String(role._id) !== String(canonicalRole._id)).map((role) => role._id);`.
- Line 44: `const affectedUsers = users.filter((user) =>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

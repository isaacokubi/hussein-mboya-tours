# Source explanation: server/scripts/createGlobalToursAdmins.js

**Source:** [server/scripts/createGlobalToursAdmins.js](../../../server/scripts/createGlobalToursAdmins.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `createTenantAdmin` — lines 27–46

Parameters: `email`, `password`, `index`.
Persistent operations detected: User.findOne, User.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `const existing = await User.findOne({ email });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `if (existing) throw new Error(\`User already exists: ${email}\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `return User.create({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createPlatformOwner` — lines 48–71

Parameters: none.
Persistent operations detected: User.findOne, User.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 51:** `const existing = await User.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `if (existing) throw new Error(\`Platform owner already exists: ${SUPERADMIN_EMAIL}\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `return User.create({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "platform@globaltours.test";`.
- Line 6: `<sensitive declaration redacted>`.
- Line 7: `const ADMIN_EMAILS = [`.
- Line 11: `<sensitive declaration redacted>`.
- Line 12: `const GLOBAL_TOURS_ID = new mongoose.Types.ObjectId("6a87fe1bc3f48c3dcddf4a23");`.
- Line 22: `const org = await mongoose.connection.db.collection("organizations").findOne({`.
- Line 27: `<sensitive declaration redacted>`.
- Line 30: `const existing = await User.findOne({ email });`.
- Line 48: `const createPlatformOwner = async () => runWithTenant(`.
- Line 51: `const existing = await User.findOne({`.
- Line 73: `const superadmin = await createPlatformOwner();`.
- Line 74: `const admins = [];`.
- Line 79: `const verifyPlatform = await runWithTenant(`.
- Line 89: `const admin = await runWithTenant(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/scripts/createAdmin.js

**Source:** [server/scripts/createAdmin.js](../../../server/scripts/createAdmin.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `../tenancy/bootstrap.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/bootstrap.js](../../../server/tenancy/bootstrap.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `readline` from `node:readline/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `stdin`, `stdout` from `node:process`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `ensureSystemRoles` from `../services/onboardingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/onboardingService.js](../../../server/services/onboardingService.js)
- `env` from `../config/env.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/env.js](../../../server/config/env.js)

## Runtime declarations and data flow

### `ask` — lines 12–15

Parameters: `label`, `fallback (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 13:** `const value = await rl.question(fallback ? \`${label} [${fallback}]: \` : \`${label}: \`);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 14:** `return String(value || fallback).trim();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `askSecret` — lines 16–16

Parameters: `label`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:

## Module-level declarations

- Line 11: `const rl = readline.createInterface({ input, output });`.
- Line 12: `const ask = async (label, fallback = "") => {`.
- Line 13: `const value = await rl.question(fallback ? \`${label} [${fallback}]: \` : \`${label}: \`);`.
- Line 16: `<sensitive declaration redacted>`.
- Line 19: `const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI;`.
- Line 23: `const tenantId = process.env.ADMIN_TENANT_ID || process.argv[2] || await ask("Company/Tenant ID");`.
- Line 24: `const name = process.env.ADMIN_NAME || process.argv[3] || await ask("Admin full name");`.
- Line 25: `const email = String(process.env.ADMIN_EMAIL || process.argv[4] || await ask("Admin email")).trim().toLowerCase();`.
- Line 26: `const phone = String(process.env.ADMIN_PHONE || process.argv[5] || await ask("Admin phone (10 digits)")).trim();`.
- Line 27: `<sensitive declaration redacted>`.
- Line 35: `const organization = await runWithTenant({ bypass: true }, () => Organization.findById(tenantId).lean());`.
- Line 40: `const { admin: role } = await ensureSystemRoles();`.
- Line 41: `const user = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.create({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

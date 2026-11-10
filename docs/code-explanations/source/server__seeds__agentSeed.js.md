# Source explanation: server/seeds/agentSeed.js

**Source:** [server/seeds/agentSeed.js](../../../server/seeds/agentSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `bcrypt` from `bcryptjs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `seedAgents` — lines 20–72

Parameters: none.
Persistent operations detected: Organization.findById, Organization.findOne; verify tenant/ownership filters in the exact query. 9 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 22:** `const tenantId = String(process.env.TENANT_ID || "").trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 23:** `const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 24:** `const tenantName = String(process.env.TENANT_NAME || "").trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 25:** `if (!tenantId && !tenantSlug && !tenantName) throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running the agent seed.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `const mongoUri = String(process.env.MONGODB_URI || "").trim();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 27:** `if (!mongoUri) throw new Error("MONGODB_URI is missing in server/.env");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `await mongoose.connect(mongoUri);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `let organization;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `if (tenantId) organization = await Organization.findById(tenantId).lean();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `else if (tenantSlug) organization = await Organization.findOne({ slug: tenantSlug }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `else organization = await Organization.findOne({ name: tenantName }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `if (!organization) throw new Error("Tenant organization was not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `await runWithTenant({ tenantId: organization._id, tenant: organization }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `for (const data of agents) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 41:** `const user = await User.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `await Agent.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 14: `const agents = [`.
- Line 20: `const seedAgents = async () => {`.
- Line 22: `const tenantId = String(process.env.TENANT_ID || "").trim();`.
- Line 23: `const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();`.
- Line 24: `const tenantName = String(process.env.TENANT_NAME || "").trim();`.
- Line 26: `const mongoUri = String(process.env.MONGODB_URI || "").trim();`.
- Line 31: `let organization;`.
- Line 37: `<sensitive declaration redacted>`.
- Line 41: `const user = await User.findOneAndUpdate(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

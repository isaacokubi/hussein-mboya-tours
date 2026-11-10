# Source explanation: server/scripts/verifyDemoLocalApi.js

**Source:** [server/scripts/verifyDemoLocalApi.js](../../../server/scripts/verifyDemoLocalApi.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `http` from `node:http`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `TEST_LOGIN_EMAILS` from `../seeds/completeTestDemoSeed.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/seeds/completeTestDemoSeed.js](../../../server/seeds/completeTestDemoSeed.js)
- `setStartupPhase` from `../startup/readiness.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/startup/readiness.js](../../../server/startup/readiness.js)

## Runtime declarations and data flow

### `expectedRole` — lines 8–17

Parameters: `email`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `if (email === "superadmin1@husseinmboya.com") return "super_admin";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `const local = email.split("@")[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (local === "admin1") return "admin";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `if (local === "tourmanager1") return "tour_manager";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (local.startsWith("agent")) return "agent";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (local.startsWith("guide")) return "tour_guide";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (local.startsWith("driver")) return "driver";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `return "customer";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tenantSlug` — lines 18–21

Parameters: `email`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `request` — lines 47–55

Parameters: `path`, `arg2 (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

## Module-level declarations

- Line 8: `const expectedRole = (email) => {`.
- Line 10: `const local = email.split("@")[0];`.
- Line 18: `const tenantSlug = (email) => email === "superadmin1@husseinmboya.com" ? null`.
- Line 22: `const target = new URL(process.env.MONGODB_URI || "");`.
- Line 26: `<sensitive declaration redacted>`.
- Line 30: `const app = (await import("../app.js")).default;`.
- Line 31: `const server = http.createServer(app);`.
- Line 32: `<sensitive declaration redacted>`.
- Line 33: `<sensitive declaration redacted>`.
- Line 36: `const tenantRows = await mongoose.connection.db.collection("organizations")`.
- Line 38: `const tenantIdBySlug = new Map(tenantRows.map((tenant) => [tenant.slug, String(tenant._id)]));`.
- Line 46: `const origin = \`http://127.0.0.1:${server.address().port}\`;`.
- Line 47: `<sensitive declaration redacted>`.
- Line 59: `const ip = \`198.51.100.${index + 1}\`;`.
- Line 60: `const wrong = await request("/api/auth/login", {`.
- Line 66: `const response = await request("/api/auth/login", {`.
- Line 70: `const payload = await response.json();`.
- Line 71: `const user = payload.user;`.
- Line 76: `const slug = tenantSlug(email);`.
- Line 82: `<sensitive declaration redacted>`.
- Line 84: `const mePayload = await me.json();`.
- Line 94: `const roleChecks = [`.
- Line 104: `<sensitive declaration redacted>`.
- Line 109: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

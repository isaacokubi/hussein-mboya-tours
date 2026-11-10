# Source explanation: server/tests/demoSeedAuthentication.test.js

**Source:** [server/tests/demoSeedAuthentication.test.js](../../../server/tests/demoSeedAuthentication.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `bcrypt` from `bcryptjs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `getTestPassword`, `TEST_LOGIN_EMAILS` from `../seeds/completeTestDemoSeed.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/seeds/completeTestDemoSeed.js](../../../server/seeds/completeTestDemoSeed.js)

## Runtime declarations and data flow

### `accountRole` — lines 9–19

Parameters: `email`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `if (email === PLATFORM_EMAIL) return "super_admin";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `const local = email.split("@")[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `if (local === "admin1") return "admin";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (local === "tourmanager1") return "tour_manager";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (local.startsWith("agent")) return "agent";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (local.startsWith("guide")) return "tour_guide";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (local.startsWith("driver")) return "driver";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (local.startsWith("customer")) return "customer";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `<sensitive declaration redacted>`.
- Line 8: `const PLATFORM_EMAIL = "superadmin1@husseinmboya.com";`.
- Line 9: `const accountRole = (email) => {`.
- Line 11: `const local = email.split("@")[0];`.
- Line 26: `const tenantAccounts = TEST_LOGIN_EMAILS.filter((email) => email !== PLATFORM_EMAIL && email.endsWith(\`@${tenantDomain}\`));`.
- Line 36: `<sensitive declaration redacted>`.
- Line 37: `<sensitive declaration redacted>`.
- Line 51: `<sensitive declaration redacted>`.
- Line 53: `const account = { email, role: accountRole(email), tenantId: email === PLATFORM_EMAIL ? null : "tenant-id" };`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

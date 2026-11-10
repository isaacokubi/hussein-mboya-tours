# Source explanation: server/scripts/stagingQaStartupSeed.js

**Source:** [server/scripts/stagingQaStartupSeed.js](../../../server/scripts/stagingQaStartupSeed.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `QA_DATABASE_NAME`, `runStagingQaSeedOnce`, `validateStagingQaEnvironment` from `./stagingQaSeedCore.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/scripts/stagingQaSeedCore.js](../../../server/scripts/stagingQaSeedCore.js)

## Runtime declarations and data flow

### `runStagingQaStartupSeed` — lines 14–42

Parameters: `arg1 (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const enabled = environment.STAGING_QA_SEED_ON_STARTUP;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (enabled !== "true") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (enabled && enabled !== "false") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `throw new Error("STAGING_QA_SEED_ON_STARTUP must be exactly true or false.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 24:** `return { enabled: false, seeded: false };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `if (environment.NODE_ENV !== "production" || environment.DEPLOYMENT_ENV !== "staging") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `throw new Error("Startup QA seed is available only on the production-mode staging deployment.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 32:** `if (environment.STAGING_DATABASE_NAME !== QA_DATABASE_NAME) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `throw new Error("Startup QA seed requires STAGING_DATABASE_NAME=global_tours_test.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 37:** `const result = await runOnce({ environment, mongooseClient, models });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `return { enabled: true, ...result };` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 11: `const models = { Organization, User, Customer, Destination, Tour, Booking, Payment };`.
- Line 19: `const enabled = environment.STAGING_QA_SEED_ON_STARTUP;`.
- Line 37: `const result = await runOnce({ environment, mongooseClient, models });`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/seeds/resetTourGuidePassword.js

**Source:** [server/seeds/resetTourGuidePassword.js](../../../server/seeds/resetTourGuidePassword.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `resetTourGuidePassword` — lines 10–90

Parameters: none.
Persistent operations detected: User.findOne, Role.findOne; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `if (!process.env.MONGODB_URI) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `throw new Error("MONGODB_URI is missing.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 16:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `const tourGuide = await User.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `if (!tourGuide) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `throw new Error("Tour Guide not found.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 29:** `const guideRole =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `(await Role.findOne({ name: "guide" })) ||` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `(await Role.findOne({ name: "guide" }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `if (!guideRole) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `throw new Error("Guide role not found.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 78:** `await tourGuide.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 87:** `await mongoose.connection.close().catch(() => {});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 10: `<sensitive declaration redacted>`.
- Line 20: `const tourGuide = await User.findOne({`.
- Line 29: `const guideRole =`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

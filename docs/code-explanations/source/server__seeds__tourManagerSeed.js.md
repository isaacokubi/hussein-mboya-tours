# Source explanation: server/seeds/tourManagerSeed.js

**Source:** [server/seeds/tourManagerSeed.js](../../../server/seeds/tourManagerSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Permission` from `../models/Permission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Permission.js](../../../server/models/Permission.js)
- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `createTourManager` — lines 11–213

Parameters: none.
Persistent operations detected: Permission.findOne, Permission.create, Role.findOne, Role.create, User.findOne, User.create; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `if (!process.env.MONGODB_URI) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `throw new Error("MONGODB_URI is missing in .env");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 17:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `const permissionDefinitions = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const permissionIds = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `for (const data of permissionDefinitions) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 87:** `let permission = await Permission.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 91:** `if (!permission) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `permission = await Permission.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 104:** `await permission.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 118:** `let tourManagerRole = await Role.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 122:** `if (!tourManagerRole) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 123:** `tourManagerRole = await Role.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 145:** `await tourManagerRole.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 156:** `const email = "manager@husseinmboyatours.com";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 158:** `let manager = await User.findOne({ email });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 160:** `if (!manager) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 11: `const createTourManager = async () => {`.
- Line 27: `const permissionDefinitions = [`.
- Line 84: `const permissionIds = [];`.
- Line 87: `let permission = await Permission.findOne({`.
- Line 118: `let tourManagerRole = await Role.findOne({`.
- Line 156: `const email = "manager@husseinmboyatours.com";`.
- Line 158: `let manager = await User.findOne({ email });`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

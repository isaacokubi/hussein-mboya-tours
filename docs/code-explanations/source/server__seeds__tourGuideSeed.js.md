# Source explanation: server/seeds/tourGuideSeed.js

**Source:** [server/seeds/tourGuideSeed.js](../../../server/seeds/tourGuideSeed.js)

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

### `createTourGuide` — lines 11–136

Parameters: none.
Persistent operations detected: Permission.findOne, Permission.create, Role.findOne, Role.create, User.findOne, User.create; verify tenant/ownership filters in the exact query. 9 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `if (!process.env.MONGODB_URI) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `throw new Error("MONGODB_URI is missing in .env");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 17:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `const permissionNames = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const permissionIds = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `for (const name of permissionNames) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 38:** `let permission = await Permission.findOne({ name });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `if (!permission) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `permission = await Permission.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `let guideRole = await Role.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `if (!guideRole) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `guideRole = await Role.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 75:** `await guideRole.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 86:** `const email = "guide@husseinmboyatours.com";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const existingGuide = await User.findOne({ email });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 90:** `if (existingGuide) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 11: `const createTourGuide = async () => {`.
- Line 28: `const permissionNames = [`.
- Line 35: `const permissionIds = [];`.
- Line 38: `let permission = await Permission.findOne({ name });`.
- Line 60: `let guideRole = await Role.findOne({`.
- Line 86: `const email = "guide@husseinmboyatours.com";`.
- Line 88: `const existingGuide = await User.findOne({ email });`.
- Line 96: `const guide = await User.create({`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

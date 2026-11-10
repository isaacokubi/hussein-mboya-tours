# Source explanation: server/middleware/contentManagerMiddleware.js

**Source:** [server/middleware/contentManagerMiddleware.js](../../../server/middleware/contentManagerMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `getUserRole` from `../utils/roleUtils.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/roleUtils.js](../../../server/utils/roleUtils.js)

## Runtime declarations and data flow

### `contentManagerMiddleware` — lines 9–43

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 11:** `if (!req.user?._id) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `return res.status(401).json({ success: false, message: "Authentication required" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 15:** `const user = await User.findById(req.user._id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `if (!user) return res.status(401).json({ success: false, message: "User not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `return res.status(403).json({ success: false, message: "Your account is inactive" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `const role = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const allowed = ["admin", "super_admin", "manager", "tour_manager", "tourmanager"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `if (!allowed.includes(role)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `return res.status(403).json({ success: false, message: "Homepage content management access required", role });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 41:** `return res.status(500).json({ success: false, message: "Server error while authorizing content manager" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 15: `const user = await User.findById(req.user._id)`.
- Line 29: `const role = getUserRole(user);`.
- Line 30: `const allowed = ["admin", "super_admin", "manager", "tour_manager", "tourmanager"];`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/middleware/adminMiddleware.js

**Source:** [server/middleware/adminMiddleware.js](../../../server/middleware/adminMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `getUserRole` from `../utils/roleUtils.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/roleUtils.js](../../../server/utils/roleUtils.js)

## Runtime declarations and data flow

### `adminMiddleware` — lines 5–37

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 7:** `if (!req.user?._id) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `return res.status(401).json({ success: false, message: "Authentication required" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 11:** `const user = await User.findById(req.user._id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 16:** `if (!user) return res.status(401).json({ success: false, message: "User not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return res.status(403).json({ success: false, message: "Your account is inactive" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 25:** `const roleName = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (!["admin", "super_admin"].includes(roleName)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return res.status(403).json({ success: false, message: "Admin access required", role: roleName });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 35:** `return res.status(500).json({ success: false, message: "Server error while authorizing user" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const adminMiddleware = async (req, res, next) => {`.
- Line 11: `const user = await User.findById(req.user._id)`.
- Line 25: `const roleName = getUserRole(user);`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

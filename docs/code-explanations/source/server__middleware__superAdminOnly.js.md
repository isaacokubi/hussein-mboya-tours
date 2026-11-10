# Source explanation: server/middleware/superAdminOnly.js

**Source:** [server/middleware/superAdminOnly.js](../../../server/middleware/superAdminOnly.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `isSuperAdmin` from `../utils/roleUtils.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/roleUtils.js](../../../server/utils/roleUtils.js)

## Runtime declarations and data flow

### `superAdminOnly` — lines 3–9

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 4:** `if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 5:** `if (!isSuperAdmin(req.user)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 6:** `return res.status(403).json({ success: false, message: "Super administrator access required." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 8:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 3: `export const superAdminOnly = (req, res, next) => {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/middleware/customerProfileSync.js

**Source:** [server/middleware/customerProfileSync.js](../../../server/middleware/customerProfileSync.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `ensureCustomerProfile` from `../services/customerProfileService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/customerProfileService.js](../../../server/services/customerProfileService.js)

## Runtime declarations and data flow

### `syncCustomerProfile` — lines 8–17

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 10:** `if (req.user && String(req.user.role || "").trim().toLowerCase() === "customer") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `await ensureCustomerProfile(req.user, { createdBy: req.user._id });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 8: `export const syncCustomerProfile = async (req, res, next) => {`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

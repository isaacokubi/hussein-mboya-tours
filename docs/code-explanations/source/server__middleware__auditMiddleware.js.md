# Source explanation: server/middleware/auditMiddleware.js

**Source:** [server/middleware/auditMiddleware.js](../../../server/middleware/auditMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `createAuditLog` from `../services/auditService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/auditService.js](../../../server/services/auditService.js)

## Runtime declarations and data flow

### `detectResource` — lines 5–47

Parameters: `url`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `const map={` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `for(const key in map){` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 38:** `if(url.includes(key)){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return map[key];` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 45:** `return "System";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `auditMiddleware` — lines 51–146

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 57:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 60:** `if(!req.user)` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 64:** `let action="view";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `if(req.method==="POST")` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `if(req.method==="PUT" || req.method==="PATCH")` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `if(req.method==="DELETE")` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `const status =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `await createAuditLog({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 130:** `catch(error){` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.

## Module-level declarations

- Line 5: `const detectResource=(url)=>{`.
- Line 7: `const map={`.
- Line 51: `export const auditMiddleware=(req,res,next)=>{`.
- Line 64: `let action="view";`.
- Line 79: `const status =`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

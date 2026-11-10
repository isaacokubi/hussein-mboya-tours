# Source explanation: server/controllers/adminAISentimentController.js

**Source:** [server/controllers/adminAISentimentController.js](../../../server/controllers/adminAISentimentController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)

## Runtime declarations and data flow

### `getAISentimentAnalysis` — lines 6–155

Parameters: `req`, `res`, `next`.
Persistent operations detected: Review.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** `const reviews =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `await Review.find(tenantFilter(req))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `let positive = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `let neutral = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `let negative = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const complaints=[];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const rating =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `if(rating >= 4){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `else if(rating === 3){` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `else{` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const recommendations=[];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `if(negative > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 89:** `if(neutral > positive){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 98:** `if(positive > negative){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 108:** `if(!recommendations.length){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 118:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 6: `export const getAISentimentAnalysis = async(`.
- Line 16: `const reviews =`.
- Line 26: `let positive = 0;`.
- Line 27: `let neutral = 0;`.
- Line 28: `let negative = 0;`.
- Line 31: `const complaints=[];`.
- Line 37: `const rating =`.
- Line 76: `const recommendations=[];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

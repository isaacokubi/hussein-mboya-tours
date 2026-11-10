# Source explanation: server/middleware/tourManagerMiddleware.js

**Source:** [server/middleware/tourManagerMiddleware.js](../../../server/middleware/tourManagerMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `roleMiddleware` from `./roleMiddleware.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/middleware/roleMiddleware.js](../../../server/middleware/roleMiddleware.js)

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 12: `const tourManagerOnly = roleMiddleware(`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

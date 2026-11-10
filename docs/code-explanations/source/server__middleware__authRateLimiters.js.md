# Source explanation: server/middleware/authRateLimiters.js

**Source:** [server/middleware/authRateLimiters.js](../../../server/middleware/authRateLimiters.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `rateLimit` from `express-rate-limit`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 3: `const common = {`.
- Line 9: `export const loginRateLimiter = rateLimit({`.
- Line 19: `<sensitive declaration redacted>`.
- Line 31: `export const mfaSendRateLimiter = rateLimit({`.
- Line 41: `export const mfaVerifyRateLimiter = rateLimit({`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

# Source explanation: server/middleware/aiRateLimiter.js

**Source:** [server/middleware/aiRateLimiter.js](../../../server/middleware/aiRateLimiter.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `rateLimit` from `express-rate-limit`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 3: `const windowMs = Math.max(60_000, Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 15 * 60_000));`.
- Line 4: `const max = Math.max(1, Number(process.env.AI_RATE_LIMIT_MAX || 30));`.
- Line 6: `export const aiRateLimiter = rateLimit({`.
- Line 12: `const tenantId = String(req.tenantId || req.user?.tenantId || "public").trim();`.
- Line 13: `const userId = String(req.user?._id || req.ip || "anonymous").trim();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

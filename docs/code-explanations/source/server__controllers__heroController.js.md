# Source explanation: server/controllers/heroController.js

**Source:** [server/controllers/heroController.js](../../../server/controllers/heroController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `HeroSlide` from `../models/HeroSlide.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HeroSlide.js](../../../server/models/HeroSlide.js)

## Runtime declarations and data flow

### `getHeroSlides` — lines 6–14

Parameters: `req`, `res`.
Persistent operations detected: HeroSlide.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 7:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 9:** `const slides = await HeroSlide.find({ ...tenantFilter(req), active: true }).sort({ order: 1, createdAt: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 10:** `return res.status(200).json({ success: true, slides });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 12:** `return res.status(500).json({ success: false, message: publicErrorMessage(error) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `healthCheck` — lines 16–16

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 16:** `async (req, res) => res.json({ success: true, message: "Module operational" })` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 6: `export const getHeroSlides = async (req, res) => {`.
- Line 9: `const slides = await HeroSlide.find({ ...tenantFilter(req), active: true }).sort({ order: 1, createdAt: 1 }).lean();`.
- Line 16: `export const healthCheck = async (req, res) => res.json({ success: true, message: "Module operational" });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

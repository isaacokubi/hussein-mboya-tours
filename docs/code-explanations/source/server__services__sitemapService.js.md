# Source explanation: server/services/sitemapService.js

**Source:** [server/services/sitemapService.js](../../../server/services/sitemapService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `SitemapStream`, `streamToPromise` from `sitemap`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)

## Runtime declarations and data flow

### `generateSitemap` — lines 13–87

Parameters: none.
Persistent operations detected: Tour.find, Destination.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** `const sitemap = new SitemapStream({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const tours = await Tour.find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `for (const tour of tours) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 65:** `const destinations = await Destination.find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `for (const destination of destinations) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 80:** `const xml = await streamToPromise(sitemap);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 82:** `return xml.toString();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 85:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.

## Module-level declarations

- Line 13: `export const generateSitemap = async () => {`.
- Line 16: `const sitemap = new SitemapStream({`.
- Line 50: `const tours = await Tour.find(`.
- Line 65: `const destinations = await Destination.find(`.
- Line 80: `const xml = await streamToPromise(sitemap);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

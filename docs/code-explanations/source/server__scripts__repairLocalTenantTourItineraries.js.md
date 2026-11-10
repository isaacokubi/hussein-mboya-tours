# Source explanation: server/scripts/repairLocalTenantTourItineraries.js

**Source:** [server/scripts/repairLocalTenantTourItineraries.js](../../../server/scripts/repairLocalTenantTourItineraries.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `pathToFileURL` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `buildCatalogueItinerary`, `resolveTourDurationDays` from `./repairHusseindbTenantCatalogues.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/scripts/repairHusseindbTenantCatalogues.js](../../../server/scripts/repairHusseindbTenantCatalogues.js)

## Runtime declarations and data flow

### `assertSafeLocalTourRepairTarget` — lines 8–25

Parameters: `rawUri`, `env (defaulted)`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `if (env.CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR !== "YES") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `throw new Error("Set CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR=YES to confirm a local, non-destructive itinerary repair.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 12:** `if (!rawUri) throw new Error("MONGODB_URI is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (String(env.NODE_ENV || "").toLowerCase() === "production") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `throw new Error("Refusing local itinerary repair while NODE_ENV=production.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 16:** `const target = new URL(rawUri);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const host = target.hostname.toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const localHosts = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (!localHosts.has(host)) throw new Error("Refusing itinerary repair: MongoDB host must be localhost or loopback.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (!database || database.toLowerCase() === "husseindb" || !/(local|test|testing|demo|dev|disposable|seed|ci)/i.test(database)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `throw new Error("Refusing itinerary repair: use an explicitly named local/test/demo database, never husseindb.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 24:** `return { host, database };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `main` — lines 27–91

Parameters: none.
6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 28:** `const target = assertSafeLocalTourRepairTarget(process.env.MONGODB_URI);` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 29:** `await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, appName: "local-tenant-tour-itinerary-repair" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const organizations = await db.collection("organizations").find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `const missingTenants = LOCAL_TENANT_SLUGS.filter((slug) => !organizations.some((tenant) => tenant.slug === slug));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (missingTenants.length) throw new Error(\`Preflight failed; missing tenant(s): ${missingTenants.join(", ")}. No records were changed.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `const plans = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `for (const tenant of organizations) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 40:** `const scope = { tenantId: tenant._id, isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const tours = await db.collection("tours").find(scope).toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `if (!tours.length) throw new Error(\`Preflight failed; no active catalogue tours found for ${tenant.slug}. No records were changed.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `const destinationIds = [...new Set(tours.map((tour) => tour.destination).filter(Boolean).map(String))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const destinations = await db.collection("destinations").find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `const destinationById = new Map(destinations.map((destination) => [String(destination._id), destination]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `for (const tour of tours) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 51:** `const destination = destinationById.get(String(tour.destination));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `if (!destination) throw new Error(\`Preflight failed; tour ${tour.title || tour._id} has no destination owned by ${tenant.slug}. No records were changed.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `const durationDays = resolveTourDurationDays(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `export const LOCAL_TENANT_SLUGS = ["hussein-mboya", "amani-trails", "demo-safari"];`.
- Line 8: `export function assertSafeLocalTourRepairTarget(rawUri, env = process.env) {`.
- Line 16: `const target = new URL(rawUri);`.
- Line 17: `const host = target.hostname.toLowerCase();`.
- Line 18: `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");`.
- Line 19: `const localHosts = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);`.
- Line 28: `const target = assertSafeLocalTourRepairTarget(process.env.MONGODB_URI);`.
- Line 30: `const db = mongoose.connection.db;`.
- Line 31: `const organizations = await db.collection("organizations").find(`.
- Line 35: `const missingTenants = LOCAL_TENANT_SLUGS.filter((slug) => !organizations.some((tenant) => tenant.slug === slug));`.
- Line 38: `const plans = [];`.
- Line 40: `const scope = { tenantId: tenant._id, isDeleted: { $ne: true } };`.
- Line 41: `const tours = await db.collection("tours").find(scope).toArray();`.
- Line 43: `const destinationIds = [...new Set(tours.map((tour) => tour.destination).filter(Boolean).map(String))];`.
- Line 44: `const destinations = await db.collection("destinations").find({`.
- Line 49: `const destinationById = new Map(destinations.map((destination) => [String(destination._id), destination]));`.
- Line 51: `const destination = destinationById.get(String(tour.destination));`.
- Line 53: `const durationDays = resolveTourDurationDays(tour);`.
- Line 69: `const summary = LOCAL_TENANT_SLUGS.map((slug) => {`.
- Line 70: `const items = plans.filter((plan) => plan.tenant.slug === slug);`.
- Line 75: `const writes = plans.map(({ tenant, tour, itinerary }) => ({`.
- Line 83: `const verification = [];`.
- Line 85: `const rows = await db.collection("tours").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray();`.
- Line 86: `const invalid = rows.filter((tour) => !Array.isArray(tour.itinerary) || tour.itinerary.length !== resolveTourDurationDays(tour) || tour.itinerary.some((day, index) => Number(day.da`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

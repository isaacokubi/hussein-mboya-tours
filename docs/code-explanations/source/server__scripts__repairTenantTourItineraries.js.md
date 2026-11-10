# Source explanation: server/scripts/repairTenantTourItineraries.js

**Source:** [server/scripts/repairTenantTourItineraries.js](../../../server/scripts/repairTenantTourItineraries.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `pathToFileURL` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `getTourDurationOverride` — lines 14–16

Parameters: `tour`, `tenantSlug`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 15:** `return TOUR_DURATION_OVERRIDES.get(\`${tenantSlug}:${String(tour.title || "").trim()}\`);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getEffectiveTourDuration` — lines 18–25

Parameters: `tour`, `tenantSlug`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const override = getTourDurationOverride(tour, tenantSlug);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (override) return override.days;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const parsed = Number.parseInt(String(tour.duration || "").match(/\d+/)?.[0], 10);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const days = Number(tour.durationDays ?? tour.durationDetails?.days ?? parsed ?? 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (!Number.isInteger(days) || days < 1 || days > 365) throw new Error(\`Invalid duration for tour ${tour.title || tour._id}: ${days}\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `return days;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assertItineraryRepairTarget` — lines 27–41

Parameters: `rawUri`, `env (defaulted)`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 28:** `if (env.CONFIRM_TENANT_ITINERARY_REPAIR !== "YES") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `throw new Error("Set CONFIRM_TENANT_ITINERARY_REPAIR=YES to confirm the targeted itinerary repair.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 31:** `if (!rawUri) throw new Error("MONGODB_URI is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `const target = new URL(rawUri);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `throw new Error(\`Refusing to write outside ${EXPECTED_DATABASE} on the approved Atlas cluster.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 37:** `if (String(env.NODE_ENV || "").toLowerCase() === "production") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `throw new Error("Run the repair in an explicitly controlled maintenance session, not with NODE_ENV=production.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 40:** `return { host: target.hostname.toLowerCase(), database };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `cleanList` — lines 43–43

Parameters: `values`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `buildCorrectedItinerary` — lines 45–88

Parameters: `tour`, `destination`, `tenantId`, `tenantSlug`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 46:** `const days = getEffectiveTourDuration(tour, tenantSlug);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const destinationName = String(destination.name || tour.location || "the destination").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const destinationDescription = String(destination.description || tour.description || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const activities = cleanList(destination.activities);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const highlights = cleanList(tour.highlights);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const baseActivities = [...new Set([...highlights, ...activities])];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const safeActivities = baseActivities.length ? baseActivities : [\`Guided experience in ${destinationName}\`];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `return Array.from({ length: days }, (_, index) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 54:** `const day = index + 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const isArrival = day === 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const isDeparture = day === days;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `const title = days === 1` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const dayActivities = days === 1` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `const description = days === 1` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `main` — lines 90–162

Parameters: none.
6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 92:** `await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, appName: "tenant-tour-itinerary-repair" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 93:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const tenants = await db.collection("organizations").find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 98:** `if (tenants.length !== EXPECTED_TENANTS.length) throw new Error("Expected all three known tenants. No records were changed.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 100:** `const plans = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 101:** `for (const tenant of tenants) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 102:** `const [tours, destinations] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 103:** `db.collection("tours").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 104:** `db.collection("destinations").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray()` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 106:** `if (!tours.length || !destinations.length) throw new Error(\`Missing tours or destinations for ${tenant.slug}. No records were changed.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 107:** `const destinationById = new Map(destinations.map((item) => [String(item._id), item]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `const entries = tours.map((tour) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `const destination = destinationById.get(String(tour.destination));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `if (!destination) throw new Error(\`Tour ${tour.title || tour._id} in ${tenant.slug} references a missing or cross-tenant destination. No records were changed.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 111:** `return { tour, destination, itinerary: buildCorrectedItinerary(tour, destination, tenant._id, tenant.slug) };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 116:** `const summary = plans.map(({ tenant, tours }) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 123:** `if (process.env.APPLY_TENANT_ITINERARY_REPAIR !== "YES") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 5: `export const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";`.
- Line 6: `export const EXPECTED_DATABASE = "husseindb";`.
- Line 7: `export const EXPECTED_TENANTS = ["hussein-mboya", "amani-trails", "demo-safari"];`.
- Line 10: `export const TOUR_DURATION_OVERRIDES = new Map([`.
- Line 14: `export function getTourDurationOverride(tour, tenantSlug) {`.
- Line 18: `export function getEffectiveTourDuration(tour, tenantSlug) {`.
- Line 19: `const override = getTourDurationOverride(tour, tenantSlug);`.
- Line 21: `const parsed = Number.parseInt(String(tour.duration || "").match(/\d+/)?.[0], 10);`.
- Line 22: `const days = Number(tour.durationDays ?? tour.durationDetails?.days ?? parsed ?? 1);`.
- Line 27: `export function assertItineraryRepairTarget(rawUri, env = process.env) {`.
- Line 32: `const target = new URL(rawUri);`.
- Line 33: `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");`.
- Line 43: `const cleanList = (values) => (Array.isArray(values) ? values : []).map((value) => String(value || "").trim()).filter(Boolean);`.
- Line 45: `export function buildCorrectedItinerary(tour, destination, tenantId, tenantSlug) {`.
- Line 46: `const days = getEffectiveTourDuration(tour, tenantSlug);`.
- Line 47: `const destinationName = String(destination.name || tour.location || "the destination").trim();`.
- Line 48: `const destinationDescription = String(destination.description || tour.description || "").trim();`.
- Line 49: `const activities = cleanList(destination.activities);`.
- Line 50: `const highlights = cleanList(tour.highlights);`.
- Line 51: `const baseActivities = [...new Set([...highlights, ...activities])];`.
- Line 52: `const safeActivities = baseActivities.length ? baseActivities : [\`Guided experience in ${destinationName}\`];`.
- Line 54: `const day = index + 1;`.
- Line 55: `const isArrival = day === 1;`.
- Line 56: `const isDeparture = day === days;`.
- Line 57: `const title = days === 1`.
- Line 64: `const dayActivities = days === 1`.
- Line 71: `const description = days === 1`.
- Line 93: `const db = mongoose.connection.db;`.
- Line 94: `const tenants = await db.collection("organizations").find(`.
- Line 100: `const plans = [];`.
- Line 102: `const [tours, destinations] = await Promise.all([`.
- Line 107: `const destinationById = new Map(destinations.map((item) => [String(item._id), item]));`.
- Line 108: `const entries = tours.map((tour) => {`.
- Line 109: `const destination = destinationById.get(String(tour.destination));`.
- Line 116: `const summary = plans.map(({ tenant, tours }) => ({`.
- Line 128: `let updated = 0;`.
- Line 131: `const durationOverride = getTourDurationOverride(tour, tenant.slug);`.
- Line 132: `const set = { itinerary };`.
- Line 137: `const start = tour.startDate || tour.date;`.
- Line 139: `const endDate = new Date(start);`.
- Line 144: `const result = await db.collection("tours").updateOne(`.
- Line 152: `const verification = [];`.
- Line 154: `const tours = await db.collection("tours").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray();`.
- Line 155: `const destinations = await db.collection("destinations").find({ tenantId: tenant._id, isDeleted: { $ne: true } }).toArray();`.
- Line 156: `const destinationIds = new Set(destinations.map((item) => String(item._id)));`.
- Line 157: `const invalid = tours.filter((tour) => !destinationIds.has(String(tour.destination)) || !Array.isArray(tour.itinerary) || tour.itinerary.length !== getEffectiveTourDuration(tour, t`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

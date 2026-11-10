# Source explanation: server/scripts/repairHusseindbTenantCatalogues.js

**Source:** [server/scripts/repairHusseindbTenantCatalogues.js](../../../server/scripts/repairHusseindbTenantCatalogues.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `pathToFileURL` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `slugify` — lines 86–89

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 87:** `return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isSyntheticSeedRecord` — lines 91–95

Parameters: `record`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 92:** `return /^\s*TEST\b/i.test(String(record?.title || record?.name || ""))` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assertSafeTarget` — lines 97–111

Parameters: `rawUri`, `env (defaulted)`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 98:** `if (env.CONFIRM_HUSSEINDB_CATALOGUE_REPAIR !== "YES") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `throw new Error("Set CONFIRM_HUSSEINDB_CATALOGUE_REPAIR=YES to confirm this targeted production catalogue repair.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 101:** `if (!rawUri) throw new Error("MONGODB_URI is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 102:** `const target = new URL(rawUri);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `throw new Error(\`Refusing to write outside ${EXPECTED_DATABASE} on the approved Atlas cluster.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 107:** `if (String(env.NODE_ENV || "").toLowerCase() === "production") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 108:** `throw new Error("Run the reviewed repair manually in an explicitly controlled maintenance session, not with NODE_ENV=production.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 110:** `return { host: target.hostname.toLowerCase(), database };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `stableRecords` — lines 113–118

Parameters: `records`, `label`, `tenantSlug`, `minCount (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 114:** `const sorted = [...records].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 116:** `if (sorted.length < minCount) throw new Error(\`Expected at least ${minCount} ${label} for ${tenantSlug}; found ${sorted.length}. No records were changed.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 117:** `return sorted;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `resolveTourDurationDays` — lines 120–129

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 121:** `const candidates = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `return candidates.find((days) => days > 1) || candidates[0] || 3;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `buildCatalogueItinerary` — lines 131–174

Parameters: `{tenantSlug, tourTitle, destinationName, destinationDescription, activities, durationDays}`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 132:** `const days = Math.max(1, Math.min(365, Math.floor(Number(durationDays) || 3)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 133:** `const cleanTitle = String(tourTitle || "Kenya journey").replace(/^\s*TEST\s+/i, "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 134:** `const destination = String(destinationName || "the destination").replace(/^\s*TEST\s+/i, "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 135:** `const activityList = activities.filter((value) => typeof value === "string" && value.trim());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 136:** `const brand = tenantSlug === "amani-trails" ? "Amani Trails" : tenantSlug === "demo-safari" ? "Demo Safari" : "Hussein Mboya Tours";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 137:** `if (days === 1) return [{` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 145:** `return Array.from({ length: days }, (_, index) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 146:** `const first = index === 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 147:** `const last = index === days - 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 148:** `const dayActivities = first` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 153:** `const title = first` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 160:** `const description = first` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 165:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `buildRepairPlan` — lines 176–195

Parameters: `tenantSpec`, `tenant`, `destinations`, `tours`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 177:** `const sortedDestinations = stableRecords(destinations, "destinations", tenantSpec.slug, 12);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 178:** `if (sortedDestinations.length !== 12) throw new Error(\`Expected exactly 12 seeded destinations for ${tenantSpec.slug}; found ${sortedDestinations.length}. No records were changed.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 179:** `const sortedTours = stableRecords(tours, "tours", tenantSpec.slug, 8);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 180:** `if (sortedTours.length > tenantSpec.tours.length) throw new Error(\`Found more tour records than the approved catalogue can map for ${tenantSpec.slug}; no records were changed.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 181:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `main` — lines 197–326

Parameters: none.
6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 14 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 199:** `await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, appName: "husseindb-tenant-catalogue-repair" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 200:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 201:** `const orgs = await db.collection("organizations").find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 205:** `if (orgs.length !== TENANTS.length) throw new Error("Expected all three known tenants. No records were changed.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 207:** `const plans = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 208:** `for (const spec of TENANTS) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 209:** `const org = orgs.find((item) => item.slug === spec.slug);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 210:** `const scope = { tenantId: org._id };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 211:** `const [destinations, tours] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 212:** `db.collection("destinations").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 213:** `db.collection("tours").find({ ...scope, isDeleted: { $ne: true } }).toArray()` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 218:** `const slugOwners = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 219:** `for (const plan of plans) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 220:** `for (const [index, item] of plan.destinations.entries()) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 221:** `const slug = \`${plan.spec.slug}-${slugify(item.spec[0])}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 222:** `if (slugOwners.has(slug)) throw new Error(\`Destination slug collision: ${slug}. No records were changed.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 225:** `for (const item of plan.tours) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 226:** `const slug = \`${plan.spec.slug}-${slugify(item.title)}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 5: `export const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";`.
- Line 6: `export const EXPECTED_DATABASE = "husseindb";`.
- Line 8: `export const TENANTS = [`.
- Line 86: `export function slugify(value) {`.
- Line 91: `export function isSyntheticSeedRecord(record) {`.
- Line 97: `export function assertSafeTarget(rawUri, env = process.env) {`.
- Line 102: `const target = new URL(rawUri);`.
- Line 103: `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");`.
- Line 113: `function stableRecords(records, label, tenantSlug, minCount = 8) {`.
- Line 114: `const sorted = [...records].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)`.
- Line 120: `export function resolveTourDurationDays(tour) {`.
- Line 121: `const candidates = [`.
- Line 131: `export function buildCatalogueItinerary({ tenantSlug, tourTitle, destinationName, destinationDescription, activities = [], durationDays = 3 }) {`.
- Line 132: `const days = Math.max(1, Math.min(365, Math.floor(Number(durationDays) || 3)));`.
- Line 133: `const cleanTitle = String(tourTitle || "Kenya journey").replace(/^\s*TEST\s+/i, "").trim();`.
- Line 134: `const destination = String(destinationName || "the destination").replace(/^\s*TEST\s+/i, "").trim();`.
- Line 135: `const activityList = activities.filter((value) => typeof value === "string" && value.trim());`.
- Line 136: `const brand = tenantSlug === "amani-trails" ? "Amani Trails" : tenantSlug === "demo-safari" ? "Demo Safari" : "Hussein Mboya Tours";`.
- Line 146: `const first = index === 0;`.
- Line 147: `const last = index === days - 1;`.
- Line 148: `const dayActivities = first`.
- Line 153: `const title = first`.
- Line 160: `const description = first`.
- Line 176: `export function buildRepairPlan(tenantSpec, tenant, destinations, tours) {`.
- Line 177: `const sortedDestinations = stableRecords(destinations, "destinations", tenantSpec.slug, 12);`.
- Line 179: `const sortedTours = stableRecords(tours, "tours", tenantSpec.slug, 8);`.
- Line 200: `const db = mongoose.connection.db;`.
- Line 201: `const orgs = await db.collection("organizations").find(`.
- Line 207: `const plans = [];`.
- Line 209: `const org = orgs.find((item) => item.slug === spec.slug);`.
- Line 210: `const scope = { tenantId: org._id };`.
- Line 211: `const [destinations, tours] = await Promise.all([`.
- Line 218: `const slugOwners = new Map();`.
- Line 221: `const slug = \`${plan.spec.slug}-${slugify(item.spec[0])}\`;`.
- Line 226: `const slug = \`${plan.spec.slug}-${slugify(item.title)}\`;`.
- Line 232: `const summary = plans.map((plan) => ({`.
- Line 253: `const scope = { tenantId: plan.tenant._id };`.
- Line 255: `const [name, description, activities] = item.spec;`.
- Line 256: `const slug = \`${plan.spec.slug}-${slugify(name)}\`;`.
- Line 272: `const destination = plan.destinations[item.destinationIndex];`.
- Line 273: `const destinationName = destination.spec[0];`.
- Line 307: `const verification = [];`.
- Line 309: `const scope = { tenantId: plan.tenant._id };`.
- Line 310: `const [destinations, tours] = await Promise.all([`.
- Line 314: `const expectedNames = new Set(plan.destinations.map(({ spec }) => spec[0]));`.
- Line 315: `const expectedTitles = new Set(plan.tours.map(({ title }) => title));`.
- Line 316: `const ownedDestinationIds = new Set(destinations.map((item) => String(item._id)));`.
- Line 317: `const invalidTours = tours.filter((tour) => !ownedDestinationIds.has(String(tour.destination)));`.
- Line 318: `const missingNames = [...expectedNames].filter((name) => !destinations.some((item) => item.name === name));`.
- Line 319: `const missingTitles = [...expectedTitles].filter((title) => !tours.some((item) => item.title === title));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

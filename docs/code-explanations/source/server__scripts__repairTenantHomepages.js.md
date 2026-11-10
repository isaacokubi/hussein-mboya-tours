# Source explanation: server/scripts/repairTenantHomepages.js

**Source:** [server/scripts/repairTenantHomepages.js](../../../server/scripts/repairTenantHomepages.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `slugify` — lines 58–63

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `cleanName` — lines 64–64

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isSynthetic` — lines 65–67

Parameters: `record`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `assertSafeTarget` — lines 69–86

Parameters: none.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 70:** `if (process.env.CONFIRM_TENANT_HOMEPAGE_REPAIR !== "YES") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `throw new Error("Set CONFIRM_TENANT_HOMEPAGE_REPAIR=YES to confirm the two-tenant public homepage repair.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 73:** `if (process.env.ALLOW_ATLAS_DEMO_SEED !== "YES") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `throw new Error("Set ALLOW_ATLAS_DEMO_SEED=YES to explicitly allow this demo Atlas repair.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 76:** `const rawUri = String(process.env.MONGODB_URI || "");` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 77:** `if (!rawUri) throw new Error("MONGODB_URI is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `const target = new URL(rawUri);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `throw new Error(\`Refusing to write outside ${EXPECTED_DATABASE} on the approved demo Atlas cluster.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 83:** `if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `throw new Error("Refusing to run this demo-content repair with NODE_ENV=production.");` — Stops the current operation with an error; callers or Express error handling determine the response.

### `tourTitle` — lines 88–94

Parameters: `tour`, `destination`, `tenantName`, `index`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 89:** `const existing = String(tour.title || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const match = existing.match(/^\s*TEST\s+(.+?)\s+-\s+.+$/i);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `if (match?.[1]) return cleanName(match[1]);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `if (!/^\s*TEST\b/i.test(existing) && !/^test-/i.test(String(tour.slug || ""))) return existing;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `return \`${destination || "Kenya"} Safari Experience ${String(index + 1).padStart(2, "0")}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `main` — lines 96–422

Parameters: none.
21 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 62 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 98:** `await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 99:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `const tenants = await db.collection("organizations")` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 101:** `.find({ slug: { $in: TARGET_TENANTS.map((tenant) => tenant.slug) } }, { projection: { _id: 1, slug: 1, settings: 1 } })` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 103:** `if (tenants.length !== TARGET_TENANTS.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `throw new Error("Expected Amani Trails and Demo Safari tenant records. No repair was started.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 107:** `const plans = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `for (const spec of TARGET_TENANTS) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 109:** `const tenant = tenants.find((row) => row.slug === spec.slug);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 110:** `const scope = { tenantId: tenant._id };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 111:** `const [destinations, tours, packages, categories, slides, galleries] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 112:** `db.collection("destinations").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 113:** `db.collection("tours").find({ ...scope, isDeleted: { $ne: true } }).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 114:** `db.collection("tourpackages").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 115:** `db.collection("tourcategories").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 116:** `db.collection("heroslides").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 117:** `db.collection("galleries").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 121:** `const destinationRepairs = destinations` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `destinationForTourTitle` — lines 256–273

Parameters: `title`.
24 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 257:** `const normalized = String(title || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 258:** `let expected;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 259:** `if (/maasai\s+mara/.test(normalized)) expected = "Maasai Mara";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 260:** `else if (/amboseli/.test(normalized)) expected = "Amboseli";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 261:** `else if (/tsavo\s+east/.test(normalized)) expected = "Tsavo East";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 262:** `else if (/tsavo\s+west/.test(normalized)) expected = "Tsavo West";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 263:** `else if (/nakuru/.test(normalized)) expected = "Lake Nakuru";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 264:** `else if (/naivasha/.test(normalized)) expected = "Lake Naivasha";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 265:** `else if (/samburu/.test(normalized)) expected = "Samburu";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 266:** `else if (/mount\s+kenya/.test(normalized)) expected = "Mount Kenya";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 267:** `else if (/watamu/.test(normalized)) expected = "Watamu";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 268:** `else if (/lamu/.test(normalized)) expected = "Lamu";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 269:** `else if (/nairobi/.test(normalized)) expected = "Nairobi National Park";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 270:** `else if (/diani|coast|beach/.test(normalized)) expected = "Diani";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 271:** `else return null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 272:** `return canonicalDestinations.find((entry) => entry.name.toLowerCase() === expected.toLowerCase()) || null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";`.
- Line 5: `const EXPECTED_DATABASE = "husseindb";`.
- Line 6: `const TARGET_TENANTS = [`.
- Line 29: `const DESTINATION_NAMES = new Set([`.
- Line 34: `const DESTINATION_IMAGE_PATHS = {`.
- Line 48: `const TOUR_IMAGE_PATHS = [`.
- Line 55: `const HERO_IMAGE_PATHS = ["/hero1.jpeg", "/hero2.jpeg", "/hero4.jpeg"];`.
- Line 56: `const GALLERY_IMAGE_PATHS = ["/gallery/mara.jpg", "/gallery/amboseli.jpg", "/gallery/diani.jpg", "/gallery/beach.jpg", "/gallery/safari.jpg", "/gallery/culture.jpg"];`.
- Line 58: `const slugify = (value) => String(value || "")`.
- Line 64: `const cleanName = (value) => String(value || "").replace(/^\s*TEST\s+/i, "").trim();`.
- Line 65: `const isSynthetic = (record) => /^\s*TEST\b/i.test(String(record?.title || record?.name || ""))`.
- Line 69: `function assertSafeTarget() {`.
- Line 76: `const rawUri = String(process.env.MONGODB_URI || "");`.
- Line 78: `const target = new URL(rawUri);`.
- Line 79: `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");`.
- Line 88: `function tourTitle(tour, destination, tenantName, index) {`.
- Line 89: `const existing = String(tour.title || "");`.
- Line 90: `const match = existing.match(/^\s*TEST\s+(.+?)\s+-\s+.+$/i);`.
- Line 99: `const db = mongoose.connection.db;`.
- Line 100: `const tenants = await db.collection("organizations")`.
- Line 107: `const plans = [];`.
- Line 109: `const tenant = tenants.find((row) => row.slug === spec.slug);`.
- Line 110: `const scope = { tenantId: tenant._id };`.
- Line 111: `const [destinations, tours, packages, categories, slides, galleries] = await Promise.all([`.
- Line 121: `const destinationRepairs = destinations`.
- Line 124: `const name = cleanName(row.name);`.
- Line 128: `const destinationById = new Map(destinations.map((row) => [String(row._id), row]));`.
- Line 129: `const tourRepairs = tours`.
- Line 132: `const destination = destinationById.get(String(row.destination));`.
- Line 133: `const destinationName = cleanName(destination?.name) || String(row.location || "Kenya");`.
- Line 141: `const packageRepairs = packages`.
- Line 144: `const destination = cleanName(row.destination);`.
- Line 145: `const title = spec.packageTitles[index % spec.packageTitles.length];`.
- Line 148: `const categoryRepairs = categories.filter((row) => isSynthetic(row) || /^test-/i.test(String(row.slug || "")));`.
- Line 149: `const slideRepairs = slides.filter((row) => isSynthetic(row) || /^\s*TEST\b/i.test(String(row.title || "")));`.
- Line 150: `const galleryRepairs = galleries.filter((row) => isSynthetic(row) || /^\s*TEST\b/i.test(String(row.title || "")));`.
- Line 162: `const collision = destinations.find((row) => String(row._id) !== String(item.row._id) && row.slug === item.slug);`.
- Line 165: `const allTours = await db.collection("tours").find({}, { projection: { _id: 1, slug: 1 } }).toArray();`.
- Line 167: `const collision = allTours.find((row) => String(row._id) !== String(item.row._id) && row.slug === item.slug);`.
- Line 170: `const allPackages = await db.collection("tourpackages").find({}, { projection: { _id: 1, slug: 1 } }).toArray();`.
- Line 172: `const collision = allPackages.find((row) => String(row._id) !== String(item.row._id) && row.slug === item.slug);`.
- Line 178: `const report = [];`.
- Line 180: `const { spec, tenant, scope } = plan;`.
- Line 197: `const cleanTitle = item.title.replace(/\s+/g, " ").trim();`.
- Line 224: `const canonicalDestinations = plan.destinationRepairs.map(({ row, name }) => ({`.
- Line 228: `const destinationDescriptions = {`.
- Line 243: `const description = destinationDescriptions[entry.name];`.
- Line 256: `const destinationForTourTitle = (title) => {`.
- Line 257: `const normalized = String(title || "").toLowerCase();`.
- Line 258: `let expected;`.
- Line 274: `const allTenantTours = await db.collection("tours").find({ ...scope, isDeleted: { $ne: true } }).toArray();`.
- Line 276: `const destinationEntry = destinationForTourTitle(tour.title);`.
- Line 278: `const destinationName = destinationEntry.name;`.
- Line 279: `const descriptions = {`.
- Line 305: `const toursWithoutMappedDestination = allTenantTours.filter((tour) => !destinationForTourTitle(tour.title));`.
- Line 307: `const imageIndex = (index + allTenantTours.length) % TOUR_IMAGE_PATHS.length;`.
- Line 314: `const syntheticAdminUsers = await db.collection("users").find({`.
- Line 320: `const cleanAdminName = spec.slug === "demo-safari" ? "Demo Safari Administrator" : "Amani Trails Administrator";`.
- Line 353: `const slideUpdate = {`.
- Line 372: `const allTenantPackages = await db.collection("tourpackages").find(scope).toArray();`.
- Line 381: `const galleryUpdate = {`.
- Line 397: `const [publishedDestinations, featuredTours, publishedPackages, activeSlides] = await Promise.all([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

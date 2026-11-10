# Source explanation: server/scripts/repairGlobalToursMedia.js

**Source:** [server/scripts/repairGlobalToursMedia.js](../../../server/scripts/repairGlobalToursMedia.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `slugify` — lines 66–66

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `hasUsableImage` — lines 67–70

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 68:** `const url = typeof value === "string" ? value.trim() : "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `return /^https?:\/\//i.test(url) && !/image-placeholder|placeholder/i.test(url);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `repair` — lines 72–200

Parameters: none.
Persistent operations detected: Destination.find, Destination.deleteOne, Tour.find, Destination.findById; verify tenant/ownership filters in the exact query. 17 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 15 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 73:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 76:** `await runWithTenant({ role: "super_admin", bypass: true }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 77:** `const destinations = await Destination.find({ name: { $in: DESTINATIONS }, isDeleted: false }).sort({ createdAt: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `const destinationByName = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `for (const destination of destinations) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 81:** `const existing = destinationByName.get(destination.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `if (!existing) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `const image = IMAGE_POOL[DESTINATIONS.indexOf(destination.name) % IMAGE_POOL.length];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `await destination.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 92:** `await Destination.deleteOne({ _id: destination._id });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 96:** `const syntheticDestinations = await Destination.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 102:** `if (syntheticDestinations.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 103:** `await Destination.deleteMany({ _id: { $in: syntheticDestinations.map((destination) => destination._id) } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 106:** `let fixed = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `let removedDuplicates = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `const tourTitles = Object.keys(TOUR_DESTINATIONS);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `for (const [title, destinationName] of Object.entries(TOUR_DESTINATIONS)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 12: `const IMAGE_POOL = [`.
- Line 35: `const DESTINATIONS = [`.
- Line 43: `const TOUR_DESTINATIONS = {`.
- Line 66: `const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");`.
- Line 67: `const hasUsableImage = (value) => {`.
- Line 68: `const url = typeof value === "string" ? value.trim() : "";`.
- Line 77: `const destinations = await Destination.find({ name: { $in: DESTINATIONS }, isDeleted: false }).sort({ createdAt: 1 });`.
- Line 78: `const destinationByName = new Map();`.
- Line 81: `const existing = destinationByName.get(destination.name);`.
- Line 84: `const image = IMAGE_POOL[DESTINATIONS.indexOf(destination.name) % IMAGE_POOL.length];`.
- Line 96: `const syntheticDestinations = await Destination.find({`.
- Line 106: `let fixed = 0;`.
- Line 107: `let removedDuplicates = 0;`.
- Line 108: `const tourTitles = Object.keys(TOUR_DESTINATIONS);`.
- Line 111: `const destination = destinationByName.get(destinationName);`.
- Line 114: `const matches = await Tour.find({ title, isDeleted: false }).sort({ createdAt: 1 });`.
- Line 117: `const canonical = matches.find((tour) => String(tour.destination || "") === String(destination._id)) || matches[0];`.
- Line 118: `const index = tourTitles.indexOf(title);`.
- Line 119: `const image = IMAGE_POOL[index % IMAGE_POOL.length];`.
- Line 120: `const galleryImage = IMAGE_POOL[(index + 1) % IMAGE_POOL.length];`.
- Line 137: `const duplicateIds = matches.filter((tour) => String(tour._id) !== String(canonical._id)).map((tour) => tour._id);`.
- Line 144: `const syntheticTours = await Tour.find({`.
- Line 155: `const allTours = await Tour.find({ isDeleted: false }).sort({ createdAt: 1 });`.
- Line 157: `const destination = tour.destination ? await Destination.findById(tour.destination) : null;`.
- Line 158: `const featuredUrl = tour.featuredImage?.url;`.
- Line 159: `const galleryUrl = tour.gallery?.find((item) => hasUsableImage(item?.url))?.url;`.
- Line 163: `const index = Math.abs(String(tour._id).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % IMAGE_POOL.length;`.
- Line 164: `const primary = hasUsableImage(featuredUrl) ? featuredUrl : IMAGE_POOL[index];`.
- Line 165: `const secondary = hasUsableImage(galleryUrl) && galleryUrl !== primary ? galleryUrl : IMAGE_POOL[(index + 1) % IMAGE_POOL.length];`.
- Line 183: `const legacyTours = await Tour.find({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

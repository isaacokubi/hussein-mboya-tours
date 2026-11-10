# Source explanation: server/seeds/globalToursTestSeed.js

**Source:** [server/seeds/globalToursTestSeed.js](../../../server/seeds/globalToursTestSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `slugifyTitle` — lines 51–51

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `seed` — lines 53–148

Parameters: none.
6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 54:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 57:** `await runWithTenant({ role: "super_admin", bypass: true }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 58:** `const destinationSlugs = destinationData.map(([, slug]) => slug);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const tourSlugs = tourData.map(([title]) => slugifyTitle(title));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `await Tour.deleteMany({ slug: { $in: tourSlugs } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 63:** `await Destination.deleteMany({ slug: { $in: destinationSlugs } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 65:** `const destinations = await Destination.insertMany(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `const byName = new Map(destinations.map((destination) => [destination.name, destination]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const start = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const tours = tourData.map(([title, destinationName, category, days, price], index) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const destination = byName.get(destinationName);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `const date = new Date(start);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `const image = IMAGE_POOL[(index + 2) % IMAGE_POOL.length];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 98:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 145:** `await Tour.insertMany(tours, { ordered: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 11: `const IMAGE_POOL = [`.
- Line 20: `const destinationData = [`.
- Line 28: `const tourData = [`.
- Line 51: `const slugifyTitle = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");`.
- Line 53: `const seed = async () => {`.
- Line 58: `const destinationSlugs = destinationData.map(([, slug]) => slug);`.
- Line 59: `const tourSlugs = tourData.map(([title]) => slugifyTitle(title));`.
- Line 65: `const destinations = await Destination.insertMany(`.
- Line 89: `const byName = new Map(destinations.map((destination) => [destination.name, destination]));`.
- Line 90: `const start = new Date();`.
- Line 93: `const tours = tourData.map(([title, destinationName, category, days, price], index) => {`.
- Line 94: `const destination = byName.get(destinationName);`.
- Line 95: `const date = new Date(start);`.
- Line 97: `const image = IMAGE_POOL[(index + 2) % IMAGE_POOL.length];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

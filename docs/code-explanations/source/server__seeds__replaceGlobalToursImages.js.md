# Source explanation: server/seeds/replaceGlobalToursImages.js

**Source:** [server/seeds/replaceGlobalToursImages.js](../../../server/seeds/replaceGlobalToursImages.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Gallery` from `../models/Gallery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Gallery.js](../../../server/models/Gallery.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `image` — lines 10–11

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `run` — lines 84–153

Parameters: none.
Persistent operations detected: Destination.updateOne, Tour.updateMany; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 85:** `if (!process.env.MONGODB_URI) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `throw new Error("MONGODB_URI is missing in .env");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 89:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 91:** `await runWithTenant({ role: "super_admin", bypass: true }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 92:** `let destinationsUpdated = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `let toursUpdated = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `for (const [slug, [featuredImage, secondImage]] of Object.entries(destinationMedia)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 96:** `const result = await Destination.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 114:** `for (const [title, [featuredImage, secondImage]] of Object.entries(tourMedia)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 115:** `const result = await Tour.updateMany(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 136:** `await Gallery.deleteMany({ title: /^Gallery Test/i });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 138:** `await Gallery.deleteMany({ title: { $in: gallery.map(([title]) => title) } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 139:** `await Gallery.insertMany(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 10: `const image = (id) =>`.
- Line 14: `const IMAGES = {`.
- Line 37: `const destinationMedia = {`.
- Line 46: `const tourMedia = {`.
- Line 69: `const gallery = [`.
- Line 84: `const run = async () => {`.
- Line 92: `let destinationsUpdated = 0;`.
- Line 93: `let toursUpdated = 0;`.
- Line 96: `const result = await Destination.updateOne(`.
- Line 115: `const result = await Tour.updateMany(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

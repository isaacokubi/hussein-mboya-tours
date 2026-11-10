# Source explanation: server/seeds/repairGlobalTourMedia.js

**Source:** [server/seeds/repairGlobalTourMedia.js](../../../server/seeds/repairGlobalTourMedia.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `repair` — lines 49–133

Parameters: none.
Persistent operations detected: Destination.find, Destination.updateOne, Tour.find, Tour.updateOne; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 50:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** `await runWithTenant({ role: "super_admin", bypass: true }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 54:** `const destinations = await Destination.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `const destinationUpdates = await Promise.all(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `Destination.updateOne(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 80:** `const tours = await Tour.find({ title: { $in: tourTitles } })` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 84:** `const imageByTitle = new Map(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const tourUpdates = await Promise.all(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 96:** `const media = imageByTitle.get(tour.title);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `if (!media) return { matchedCount: 0 };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `return Tour.updateOne(` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 118:** `const destinationMatched = destinationUpdates.reduce(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `const tourMatched = tourUpdates.reduce(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 9: `const IMAGE_POOL = [`.
- Line 18: `const destinationSlugs = [`.
- Line 26: `const tourTitles = [`.
- Line 49: `const repair = async () => {`.
- Line 54: `const destinations = await Destination.find({`.
- Line 60: `const destinationUpdates = await Promise.all(`.
- Line 80: `const tours = await Tour.find({ title: { $in: tourTitles } })`.
- Line 84: `const imageByTitle = new Map(`.
- Line 94: `const tourUpdates = await Promise.all(`.
- Line 96: `const media = imageByTitle.get(tour.title);`.
- Line 118: `const destinationMatched = destinationUpdates.reduce(`.
- Line 122: `const tourMatched = tourUpdates.reduce(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

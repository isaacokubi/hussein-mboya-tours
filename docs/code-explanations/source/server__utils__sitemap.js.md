# Source explanation: server/utils/sitemap.js

**Source:** [server/utils/sitemap.js](../../../server/utils/sitemap.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `SitemapStream`, `streamToPromise` from `sitemap`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)

## Runtime declarations and data flow

### `generateSitemap` — lines 15–133

Parameters: none.
Persistent operations detected: Tour.find, Destination.find; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 17:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `const hostname =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const sitemap = new SitemapStream({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `const tours = await Tour.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 75:** `for (const tour of tours) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 90:** `const destinations = await Destination.find();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 92:** `for (const destination of destinations) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 103:** `const xml = await streamToPromise(sitemap);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 105:** `const outputDir = path.join(process.cwd(), "public");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `if (!fs.existsSync(outputDir)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 120:** `await mongoose.connection.close();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 129:** `await mongoose.connection.close().catch(() => {});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 15: `const generateSitemap = async () => {`.
- Line 21: `const hostname =`.
- Line 25: `const sitemap = new SitemapStream({`.
- Line 71: `const tours = await Tour.find({`.
- Line 90: `const destinations = await Destination.find();`.
- Line 103: `const xml = await streamToPromise(sitemap);`.
- Line 105: `const outputDir = path.join(process.cwd(), "public");`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

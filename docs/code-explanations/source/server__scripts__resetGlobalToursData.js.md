# Source explanation: server/scripts/resetGlobalToursData.js

**Source:** [server/scripts/resetGlobalToursData.js](../../../server/scripts/resetGlobalToursData.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `execFile` from `node:child_process`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `promisify` from `node:util`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `Permission` from `../models/Permission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Permission.js](../../../server/models/Permission.js)

## Runtime declarations and data flow

### `seedCleanAccessData` — lines 46–117

Parameters: none.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 47:** `const permissionDocs = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `for (const [name, description] of permissions) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 50:** `const permission = await Permission.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 67:** `const adminPermissionIds = permissionDocs` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `const roleDocs = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `for (const role of roles) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 88:** `await roleDocs.admin.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 90:** `const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@globaltours.co.ke").toLowerCase();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 91:** Sensitive-configuration/data operation; inspect source without copying secret values. — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 93:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 94:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 99:** `await User.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `resetDatabase` — lines 119–171

Parameters: none.
Persistent operations detected: Destination.countDocuments, Tour.countDocuments; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=false, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 120:** `if (process.env.CONFIRM_RESET !== RESET_CONFIRMATION) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 121:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 126:** `if (!process.env.MONGODB_URI) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 127:** `throw new Error("MONGODB_URI is missing.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 130:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 132:** `const beforeDestinations = await Destination.countDocuments().catch(() => 0);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 133:** `const beforeTours = await Tour.countDocuments().catch(() => 0);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 135:** `const collections = await mongoose.connection.db.listCollections().toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 136:** `let dropped = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 138:** `for (const collection of collections) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 139:** `if (KEEP_COLLECTIONS.has(collection.name)) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 140:** `await mongoose.connection.db.dropCollection(collection.name);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 148:** `await mongoose.connection.close();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 151:** `await execFileAsync(process.execPath, ["seeds/globalToursTestSeed.js"], {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 157:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 158:** `await seedCleanAccessData();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 160:** `const destinationCount = await Destination.countDocuments();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 161:** `const tourCount = await Tour.countDocuments();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 14: `const execFileAsync = promisify(execFile);`.
- Line 15: `const KEEP_COLLECTIONS = new Set(["destinations", "tours"]);`.
- Line 16: `const RESET_CONFIRMATION = "YES";`.
- Line 18: `const roles = [`.
- Line 28: `const permissions = [`.
- Line 47: `const permissionDocs = [];`.
- Line 50: `const permission = await Permission.findOneAndUpdate(`.
- Line 67: `const adminPermissionIds = permissionDocs`.
- Line 78: `const roleDocs = {};`.
- Line 90: `const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@globaltours.co.ke").toLowerCase();`.
- Line 91: `<sensitive declaration redacted>`.
- Line 132: `const beforeDestinations = await Destination.countDocuments().catch(() => 0);`.
- Line 133: `const beforeTours = await Tour.countDocuments().catch(() => 0);`.
- Line 135: `const collections = await mongoose.connection.db.listCollections().toArray();`.
- Line 136: `let dropped = 0;`.
- Line 160: `const destinationCount = await Destination.countDocuments();`.
- Line 161: `const tourCount = await Tour.countDocuments();`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

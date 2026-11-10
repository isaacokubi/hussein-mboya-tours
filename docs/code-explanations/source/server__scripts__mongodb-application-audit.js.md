# Source explanation: server/scripts/mongodb-application-audit.js

**Source:** [server/scripts/mongodb-application-audit.js](../../../server/scripts/mongodb-application-audit.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `AccommodationInventory` from `../models/AccommodationInventory.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccommodationInventory.js](../../../server/models/AccommodationInventory.js)
- `TravelServiceRequest` from `../models/TravelServiceRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TravelServiceRequest.js](../../../server/models/TravelServiceRequest.js)
- `WebsiteIntegrationEvent` from `../models/WebsiteIntegrationEvent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebsiteIntegrationEvent.js](../../../server/models/WebsiteIntegrationEvent.js)
- `PaymentGatewayConfig` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)
- `HospitalityRatePlan` from `../models/HospitalityRatePlan.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRatePlan.js](../../../server/models/HospitalityRatePlan.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)

## Runtime declarations and data flow

### `fail` — lines 73–76

Parameters: `message`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `pass` — lines 78–80

Parameters: `message`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tenantLabel` — lines 82–84

Parameters: `tenant`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 83:** `return tenant.name || tenant.slug || String(tenant._id);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `main` — lines 86–430

Parameters: none.
Persistent operations detected: Organization.find; verify tenant/ownership filters in the exact query. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 36 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 87:** `await mongoose.connect(uri);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `const physicalCollections = await db` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 101:** `const physicalNames = new Set(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 116:** `const organizationCollection = Organization.collection.name;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `if (!physicalNames.has(organizationCollection)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 134:** `const tenants = await Organization.find({})` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 143:** `if (!tenants.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 151:** `const activeTenants = tenants.filter((tenant) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 152:** `if (tenant.isActive === false) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 154:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 160:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 163:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 168:** `if (tenants.length && activeTenants.length === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 176:** `for (const item of requiredModels) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 177:** `const modelName = item.model.modelName;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 178:** `const collectionName = item.model.collection.name;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 184:** `if (!physicalNames.has(collectionName)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 14: `const uri = process.env.MONGODB_URI;`.
- Line 20: `const requiredModels = [`.
- Line 71: `const failures = [];`.
- Line 73: `function fail(message) {`.
- Line 78: `function pass(message) {`.
- Line 82: `function tenantLabel(tenant) {`.
- Line 89: `const db = mongoose.connection.db;`.
- Line 97: `const physicalCollections = await db`.
- Line 101: `const physicalNames = new Set(`.
- Line 116: `const organizationCollection = Organization.collection.name;`.
- Line 134: `const tenants = await Organization.find({})`.
- Line 151: `const activeTenants = tenants.filter((tenant) => {`.
- Line 177: `const modelName = item.model.modelName;`.
- Line 178: `const collectionName = item.model.collection.name;`.
- Line 200: `const collectionName = item.model.collection.name;`.
- Line 206: `const count = await item.model.collection.countDocuments({});`.
- Line 237: `const collectionName = item.model.collection.name;`.
- Line 243: `const count = await item.model.collection.countDocuments({`.
- Line 269: `const knownTenantIds = new Set(`.
- Line 274: `const collectionName = item.model.collection.name;`.
- Line 280: `const tenantIds = await item.model.collection.distinct("tenantId", {`.
- Line 287: `const orphanTenantIds = tenantIds`.
- Line 315: `const id = String(tenant._id);`.
- Line 317: `let populatedCollections = 0;`.
- Line 320: `const collectionName = item.model.collection.name;`.
- Line 326: `const count = await item.model.collection.countDocuments({`.
- Line 356: `const ownerCount = await db.collection("users").countDocuments({`.
- Line 385: `const legacyNames = [`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

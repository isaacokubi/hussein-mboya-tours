# Source explanation: server/seeds/dashboardOperationalSeed.js

**Source:** [server/seeds/dashboardOperationalSeed.js](../../../server/seeds/dashboardOperationalSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `crypto` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `CorporateAccount` from `../models/CorporateAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CorporateAccount.js](../../../server/models/CorporateAccount.js)
- `AccommodationInventory` from `../models/AccommodationInventory.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccommodationInventory.js](../../../server/models/AccommodationInventory.js)
- `TravelServiceRequest` from `../models/TravelServiceRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TravelServiceRequest.js](../../../server/models/TravelServiceRequest.js)
- `PrivacyRequest` from `../models/PrivacyRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PrivacyRequest.js](../../../server/models/PrivacyRequest.js)
- `ComplianceRecord` from `../models/ComplianceRecord.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ComplianceRecord.js](../../../server/models/ComplianceRecord.js)
- `WebsiteIntegrationKey` from `../models/WebsiteIntegrationKey.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebsiteIntegrationKey.js](../../../server/models/WebsiteIntegrationKey.js)
- `WebsiteIntegrationEvent` from `../models/WebsiteIntegrationEvent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebsiteIntegrationEvent.js](../../../server/models/WebsiteIntegrationEvent.js)
- `PaymentGatewayConfig` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `daysFromNow` — lines 20–20

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `hash` — lines 21–21

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `seedTenant` — lines 23–231

Parameters: `tenant`, `tenantIndex`.
Persistent operations detected: User.find, Customer.find, Booking.find, Booking.updateOne, AccommodationInventory.updateOne, ComplianceRecord.updateOne, WebsiteIntegrationEvent.create, PaymentGatewayConfig.updateOne, CorporateAccount.countDocuments, AccommodationInventory.countDocuments, TravelServiceRequest.countDocuments, ComplianceRecord.countDocuments, PrivacyRequest.countDocuments, WebsiteIntegrationEvent.countDocuments, PaymentGatewayConfig.countDocuments; verify tenant/ownership filters in the exact query. 18 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 15 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `return runWithTenant({ tenantId: tenant._id, role: "manager", bypass: false }, async () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 25:** `const [users, customers, bookings] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `User.find({ isDeleted: { $ne: true } }).limit(100).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 27:** `Customer.find({ isDeleted: { $ne: true } }).limit(30).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 28:** `Booking.find({ isDeleted: { $ne: true } }).sort({ travelDate: 1 }).limit(30),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 30:** `const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 31:** `const customer = customers[tenantIndex % Math.max(customers.length, 1)] || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const corporateDefinitions = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const corporates = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `for (let i = 0; i < corporateDefinitions.length; i += 1) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 39:** `const d = corporateDefinitions[i];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const account = await CorporateAccount.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 63:** `for (let i = 0; i < bookings.length; i += 1) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 64:** `if (i % 5 === 0 && corporates.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `await Booking.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `const accommodationRows = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `for (const [propertyName, location, roomType, totalRooms, availableRooms, nightlyRate] of accommodationRows) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 78:** `await AccommodationInventory.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `main` — lines 233–244

Parameters: none.
Persistent operations detected: Organization.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 234:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 235:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 236:** `const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 237:** `if (tenants.length !== 3) throw new Error(\`SAFE STOP: expected exactly 3 tenants, found ${tenants.length}.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 239:** `const results = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 240:** `for (let i = 0; i < tenants.length; i += 1) results.push(await seedTenant(tenants[i], i));` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.

## Module-level declarations

- Line 20: `const daysFromNow = (n) => new Date(Date.now() + n * 86400000);`.
- Line 21: `const hash = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");`.
- Line 25: `const [users, customers, bookings] = await Promise.all([`.
- Line 30: `const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;`.
- Line 31: `const customer = customers[tenantIndex % Math.max(customers.length, 1)] || null;`.
- Line 33: `const corporateDefinitions = [`.
- Line 37: `const corporates = [];`.
- Line 39: `const d = corporateDefinitions[i];`.
- Line 40: `const account = await CorporateAccount.findOneAndUpdate(`.
- Line 72: `const accommodationRows = [`.
- Line 85: `const requestTypes = ["airport_transfer", "accommodation", "rooming_list", "travel_document", "manifest", "incident"];`.
- Line 86: `const requestStatuses = ["open", "in_progress", "awaiting_customer", "resolved", "in_progress", "open"];`.
- Line 88: `const booking = bookings[i % Math.max(bookings.length, 1)];`.
- Line 115: `const complianceTypes = [`.
- Line 126: `const [type, status, referenceNumber] = complianceTypes[i];`.
- Line 147: `const privacyTypes = ["access", "correction", "portability"];`.
- Line 148: `const privacyStatuses = ["received", "in_progress", "completed"];`.
- Line 150: `const requestCustomer = customers[i % Math.max(customers.length, 1)] || null;`.
- Line 151: `const requestName = requestCustomer ? \`${requestCustomer.firstName || ""} ${requestCustomer.lastName || ""}\`.trim() : \`Demo Requester ${i + 1}\`;`.
- Line 152: `const requestEmail = requestCustomer?.email || \`privacy${tenantIndex + 1}${i + 1}@demo.co.ke\`;`.
- Line 153: `const requestPhone = requestCustomer?.phone || "0712000000";`.
- Line 176: `const rawKey = \`gt_demo_${tenantIndex + 1}_website_${hash(\`${tenant._id}:website\`).slice(0, 20)}\`;`.
- Line 177: `const publicKey = \`gt_pub_${hash(\`${tenant._id}:public\`).slice(0, 28)}\`;`.
- Line 178: `const integrationKey = await WebsiteIntegrationKey.findOneAndUpdate(`.
- Line 197: `const booking = bookings[i % Math.max(bookings.length, 1)];`.
- Line 236: `const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();`.
- Line 239: `const results = [];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

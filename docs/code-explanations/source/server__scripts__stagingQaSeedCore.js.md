# Source explanation: server/scripts/stagingQaSeedCore.js

**Source:** [server/scripts/stagingQaSeedCore.js](../../../server/scripts/stagingQaSeedCore.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `validateStagingQaEnvironment` — lines 12–33

Parameters: `environment`.
Error control: try=true, catch=false, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `if (environment.NODE_ENV !== "production") throw new Error("NODE_ENV must be production.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (environment.DEPLOYMENT_ENV !== "staging") throw new Error("DEPLOYMENT_ENV must be staging.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (environment.STAGING_DATABASE_NAME !== QA_DATABASE_NAME) throw new Error("STAGING_DATABASE_NAME must be global_tours_test.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (typeof environment.MONGODB_URI !== "string" || !environment.MONGODB_URI) throw new Error("MONGODB_URI is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `let dbName;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `let host;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 20:** `const parsed = new URL(environment.MONGODB_URI);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) throw new Error();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `throw new Error("MONGODB_URI must identify a staging MongoDB database.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 27:** `if (dbName === "husseindb") throw new Error("husseindb is explicitly forbidden.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `if (dbName !== QA_DATABASE_NAME) throw new Error("MONGODB_URI must target global_tours_test.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `if (["hussein-mboya-tours.onrender.com", "www.hussein-mboya-tours.onrender.com"].includes(host)) throw new Error("Production hostnames are forbidden.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const deploymentHost = String(environment.RENDER_EXTERNAL_HOSTNAME || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `if (["hussein-mboya-tours.onrender.com", "www.hussein-mboya-tours.onrender.com"].includes(deploymentHost)) throw new Error("Production hostnames are forbidden.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `return { dbName };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ensure` — lines 35–42

Parameters: `Model`, `filter`, `values`.
Persistent operations detected: Model.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 36:** `let record = await Model.findOne(filter);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 37:** `const created = !record;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `if (!record) record = new Model({ ...filter, ...values });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `else Object.assign(record, values);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `await record.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `return { record, created };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assertMarkerTenant` — lines 44–48

Parameters: `Model`, `filter`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 45:** `if (!Model.collection?.findOne) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `const existing = await Model.collection.findOne(filter);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 47:** `if (existing && String(existing.tenantId) !== QA_TENANT_ID) throw new Error("A deterministic QA marker is already attached to another tenant.");` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `seedStagingQaData` — lines 50–86

Parameters: `arg1 (defaulted)`.
Persistent operations detected: User.findOne; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 52:** `if (dbName !== QA_DATABASE_NAME || dbName === "husseindb") throw new Error("Connected database must be global_tours_test.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `const { Organization, User, Customer, Destination, Tour, Booking } = models;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `if (![Organization, User, Customer, Destination, Tour, Booking].every(Boolean)) throw new Error("QA seed models are unavailable.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `const tenant = await Organization.collection.findOne({ _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: QA_TENANT_SLUG });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `if (!tenant || String(tenant._id) !== QA_TENANT_ID || tenant.slug !== QA_TENANT_SLUG) throw new Error("Expected staging tenant was not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `const tenantId = new mongoose.Types.ObjectId(QA_TENANT_ID);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `await assertMarkerTenant(Customer, { email: QA_EMAIL });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 59:** `await assertMarkerTenant(Destination, { slug: "qa-staging-maasai-mara-destination" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `await assertMarkerTenant(Tour, { slug: QA_TOUR_SLUG });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `await assertMarkerTenant(Booking, { bookingNumber: QA_BOOKING_NUMBER });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `const context = { tenantId, tenant, role: "admin", bypass: false };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const admin = await tenantRunner(context, () => User.findOne({ email: "staging-tenant-admin@example.com", tenantId }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `if (!admin || String(admin.tenantId) !== QA_TENANT_ID) throw new Error("Existing staging tenant admin was not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `const results = await tenantRunner(context, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 67:** `const customer = await ensure(Customer, { tenantId, email: QA_EMAIL }, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 70:** `const destination = await ensure(Destination, { tenantId, slug: "qa-staging-maasai-mara-destination" }, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 73:** `const start = new Date(Date.now() + 30 * 86400000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `const tour = await ensure(Tour, { tenantId, slug: QA_TOUR_SLUG }, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `verifyStagingQaData` — lines 88–115

Parameters: `arg1 (defaulted)`.
Persistent operations detected: User.findOne, Customer.findOne, Tour.findOne, Booking.findOne, Payment.countDocuments; verify tenant/ownership filters in the exact query. 10 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 90:** `if (dbName !== QA_DATABASE_NAME || dbName === "husseindb") throw new Error("Connected database must be global_tours_test.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 91:** `const { Organization, User, Customer, Tour, Booking, Payment } = models;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const tenant = await Organization.collection.findOne({ _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: QA_TENANT_SLUG });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 93:** `if (!tenant || String(tenant._id) !== QA_TENANT_ID) throw new Error("Staging tenant verification failed.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 94:** `const tenantId = new mongoose.Types.ObjectId(QA_TENANT_ID);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `await assertMarkerTenant(Customer, { email: QA_EMAIL });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 96:** `await assertMarkerTenant(Tour, { slug: QA_TOUR_SLUG });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 97:** `await assertMarkerTenant(Booking, { bookingNumber: QA_BOOKING_NUMBER });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 98:** `return tenantRunner({ tenantId, tenant, role: "admin", bypass: false }, async () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 99:** `const admin = await User.findOne({ email: "staging-tenant-admin@example.com", tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 100:** `const customer = await Customer.findOne({ tenantId, email: QA_EMAIL });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 101:** `const tour = await Tour.findOne({ tenantId, slug: QA_TOUR_SLUG });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 102:** `const booking = await Booking.findOne({ tenantId, bookingNumber: QA_BOOKING_NUMBER });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 103:** `if (!admin || !customer || !tour || !booking) throw new Error("One or more staging QA records are missing or attached to another tenant.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `if (String(customer.tenantId) !== QA_TENANT_ID || String(tour.tenantId) !== QA_TENANT_ID || String(booking.tenantId) !== QA_TENANT_ID) throw new Error("A QA record has an unexpected tenant.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `if (String(booking.customer) !== String(customer._id) || String(booking.tour) !== String(tour._id)) throw new Error("Staging QA booking references do not match.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 106:** `if (booking.paymentStatus !== "pending" || booking.status !== "pending" || Number(booking.amountPaid) !== 0) throw new Error("Staging QA booking is not unpaid and pending.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 107:** `if (Payment) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `runStagingQaSeedOnce` — lines 118–153

Parameters: `arg1 (defaulted)`.
5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 126:** `const databaseName = mongooseClient.connection?.db?.databaseName;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 127:** `if (databaseName !== QA_DATABASE_NAME || databaseName === "husseindb") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 128:** `throw new Error("Connected database must be global_tours_test.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 130:** `const markers = mongooseClient.connection.db.collection("staging_qa_seed_markers");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 131:** `const existing = await markers.findOne({ _id: QA_SEED_MARKER_ID });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 132:** `if (existing && (String(existing.tenantId) !== QA_TENANT_ID || existing.databaseName !== QA_DATABASE_NAME)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 133:** `throw new Error("Staging QA completion marker has an unexpected target.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 135:** `if (existing?.completedAt) return { seeded: false, alreadyComplete: true };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 137:** `await seed({ environment, dbName: databaseName, models });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 138:** `await verify({ environment, dbName: databaseName, models });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 139:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 140:** `await markers.insertOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 148:** `if (error?.code !== 11000) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 149:** `const concurrentMarker = await markers.findOne({ _id: QA_SEED_MARKER_ID, tenantId: QA_TENANT_ID });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 150:** `if (!concurrentMarker?.completedAt) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 152:** `return { seeded: true, alreadyComplete: false };` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `export const QA_TENANT_ID = "6ab82dce30c1fd52b9dc3e80";`.
- Line 5: `export const QA_TENANT_SLUG = "staging-demo-tours";`.
- Line 6: `export const QA_DATABASE_NAME = "global_tours_test";`.
- Line 7: `export const QA_EMAIL = "qa-staging-customer@example.com";`.
- Line 8: `export const QA_TOUR_SLUG = "qa-staging-maasai-mara";`.
- Line 9: `export const QA_BOOKING_NUMBER = "QA-STAGING-BOOKING-001";`.
- Line 10: `export const QA_SEED_MARKER_ID = "staging-qa-fixture-v1";`.
- Line 12: `export function validateStagingQaEnvironment(environment) {`.
- Line 17: `let dbName;`.
- Line 18: `let host;`.
- Line 20: `const parsed = new URL(environment.MONGODB_URI);`.
- Line 30: `const deploymentHost = String(environment.RENDER_EXTERNAL_HOSTNAME || "").trim().toLowerCase();`.
- Line 35: `const ensure = async (Model, filter, values) => {`.
- Line 36: `let record = await Model.findOne(filter);`.
- Line 37: `const created = !record;`.
- Line 46: `const existing = await Model.collection.findOne(filter);`.
- Line 53: `const { Organization, User, Customer, Destination, Tour, Booking } = models;`.
- Line 55: `const tenant = await Organization.collection.findOne({ _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: QA_TENANT_SLUG });`.
- Line 57: `const tenantId = new mongoose.Types.ObjectId(QA_TENANT_ID);`.
- Line 62: `const context = { tenantId, tenant, role: "admin", bypass: false };`.
- Line 63: `const admin = await tenantRunner(context, () => User.findOne({ email: "staging-tenant-admin@example.com", tenantId }));`.
- Line 66: `const results = await tenantRunner(context, async () => {`.
- Line 67: `const customer = await ensure(Customer, { tenantId, email: QA_EMAIL }, {`.
- Line 70: `const destination = await ensure(Destination, { tenantId, slug: "qa-staging-maasai-mara-destination" }, {`.
- Line 73: `const start = new Date(Date.now() + 30 * 86400000);`.
- Line 74: `const tour = await ensure(Tour, { tenantId, slug: QA_TOUR_SLUG }, {`.
- Line 77: `const booking = await ensure(Booking, { tenantId, bookingNumber: QA_BOOKING_NUMBER }, {`.
- Line 91: `const { Organization, User, Customer, Tour, Booking, Payment } = models;`.
- Line 92: `const tenant = await Organization.collection.findOne({ _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: QA_TENANT_SLUG });`.
- Line 94: `const tenantId = new mongoose.Types.ObjectId(QA_TENANT_ID);`.
- Line 99: `const admin = await User.findOne({ email: "staging-tenant-admin@example.com", tenantId });`.
- Line 100: `const customer = await Customer.findOne({ tenantId, email: QA_EMAIL });`.
- Line 101: `const tour = await Tour.findOne({ tenantId, slug: QA_TOUR_SLUG });`.
- Line 102: `const booking = await Booking.findOne({ tenantId, bookingNumber: QA_BOOKING_NUMBER });`.
- Line 108: `const successful = Payment.collection?.countDocuments`.
- Line 126: `const databaseName = mongooseClient.connection?.db?.databaseName;`.
- Line 130: `const markers = mongooseClient.connection.db.collection("staging_qa_seed_markers");`.
- Line 131: `const existing = await markers.findOne({ _id: QA_SEED_MARKER_ID });`.
- Line 149: `const concurrentMarker = await markers.findOne({ _id: QA_SEED_MARKER_ID, tenantId: QA_TENANT_ID });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

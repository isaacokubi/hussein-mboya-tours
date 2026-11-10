# Source explanation: server/tests/stagingQaSeed.test.js

**Source:** [server/tests/stagingQaSeed.test.js](../../../server/tests/stagingQaSeed.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `QA_TENANT_ID`, `QA_DATABASE_NAME`, `QA_SEED_MARKER_ID`, `runStagingQaSeedOnce`, `seedStagingQaData`, `validateStagingQaEnvironment`, `verifyStagingQaData` from `../scripts/stagingQaSeedCore.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/scripts/stagingQaSeedCore.js](../../../server/scripts/stagingQaSeedCore.js)
- `runStagingQaStartupSeed` from `../scripts/stagingQaStartupSeed.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/scripts/stagingQaStartupSeed.js](../../../server/scripts/stagingQaStartupSeed.js)
- `createStagingQaSeedHandler` from `../routes/internal/stagingSuperAdminBootstrapRoutes.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/routes/internal/stagingSuperAdminBootstrapRoutes.js](../../../server/routes/internal/stagingSuperAdminBootstrapRoutes.js)

## Runtime declarations and data flow

### `environment` — lines 8–8

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `same` — lines 10–10

Parameters: `left`, `right`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `fixture` — lines 12–31

Parameters: none.
Persistent operations detected: Model.countDocuments; verify tenant/ownership filters in the exact query. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `const data = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const makeModel = (name) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const records = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `Model.findOne = async (filter) => records.find((item) => Object.entries(filter).every(([key, value]) => same(item[key], value))) || null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 20:** `Model.collection = { findOne: async (filter) => records.find((item) => Object.entries(filter).every(([key, value]) => same(item[key], value))) || null, countDocuments: async (filter) => Model.countDocuments(filter) };` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 21:** `return Model;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 23:** `const Organization = { collection: { findOne: async (filter) => same(filter._id, tenant._id) && filter.slug === tenant.slug ? tenant : null } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const User = makeModel("User"); User.findOne = async ({ email, tenantId }) => email === "staging-tenant-admin@example.com" && same(tenantId, QA_TENANT_ID) ? { tenantId } : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const Customer = makeModel("Customer"); const Destination = makeModel("Destination"); const Tour = makeModel("Tour"); const Booking = makeModel("Booking"); const Payment = makeModel("Payment");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `let paymentOperations = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const models = { Organization, User, Customer, Destination, Tour, Booking, Payment };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const tenantRunner = async (_context, callback) => callback();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `return { data, models, tenantRunner, get paymentOperations() { return paymentOperations; } };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `makeModel` — lines 14–22

Parameters: `name`.
Persistent operations detected: Model.countDocuments; verify tenant/ownership filters in the exact query. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `const records = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `Model.findOne = async (filter) => records.find((item) => Object.entries(filter).every(([key, value]) => same(item[key], value))) || null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 20:** `Model.collection = { findOne: async (filter) => records.find((item) => Object.entries(filter).every(([key, value]) => same(item[key], value))) || null, countDocuments: async (filter) => Model.countDocuments(filter) };` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 21:** `return Model;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Model` — lines 17–17

Parameters: `fields`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `tenantRunner` — lines 29–29

Parameters: `_context`, `callback`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `paymentOperations` — lines 30–30

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `invoke` — lines 101–106

Parameters: `headerToken`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 102:** `const result = { status: 200, body: null };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `const res = { status(code) { result.status = code; return this; }, sendStatus(code) { result.status = code; return this; }, json(body) { result.body = body; return this; } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 105:** `return result;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `status` — lines 103–103

Parameters: `code`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `sendStatus` — lines 103–103

Parameters: `code`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `json` — lines 103–103

Parameters: `body`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `runOnce` — lines 115–115

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `runOnce` — lines 131–136

Parameters: `{models, environment}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 135:** `return { seeded: true, alreadyComplete: false };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `collection` — lines 190–190

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const environment = () => ({ NODE_ENV: "production", DEPLOYMENT_ENV: "staging", STAGING_DATABASE_NAME: QA_DATABASE_NAME, MONGODB_URI: "mongodb://staging-db.invalid:27017/global_tou`.
- Line 9: `const tenant = { _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: "staging-demo-tours" };`.
- Line 10: `const same = (left, right) => String(left) === String(right);`.
- Line 12: `function fixture() {`.
- Line 13: `const data = new Map();`.
- Line 14: `const makeModel = (name) => {`.
- Line 15: `const records = [];`.
- Line 17: `function Model(fields) { Object.assign(this, fields); this._id = new mongoose.Types.ObjectId(); this.save = async () => { if (!records.includes(this)) records.push(this); return th`.
- Line 23: `const Organization = { collection: { findOne: async (filter) => same(filter._id, tenant._id) && filter.slug === tenant.slug ? tenant : null } };`.
- Line 24: `const User = makeModel("User"); User.findOne = async ({ email, tenantId }) => email === "staging-tenant-admin@example.com" && same(tenantId, QA_TENANT_ID) ? { tenantId } : null;`.
- Line 25: `const Customer = makeModel("Customer"); const Destination = makeModel("Destination"); const Tour = makeModel("Tour"); const Booking = makeModel("Booking"); const Payment = makeMode`.
- Line 26: `let paymentOperations = 0;`.
- Line 28: `const models = { Organization, User, Customer, Destination, Tour, Booking, Payment };`.
- Line 29: `const tenantRunner = async (_context, callback) => callback();`.
- Line 34: `const invalid = [`.
- Line 49: `const { models, tenantRunner } = fixture();`.
- Line 55: `const { data, models, tenantRunner } = fixture();`.
- Line 61: `const fixtureData = fixture();`.
- Line 62: `const { data, models, tenantRunner } = fixtureData;`.
- Line 63: `const args = { environment: environment(), dbName: QA_DATABASE_NAME, models, tenantRunner };`.
- Line 64: `const first = await seedStagingQaData(args);`.
- Line 65: `const second = await seedStagingQaData(args);`.
- Line 72: `const [customer] = data.get("Customer"); const [tour] = data.get("Tour"); const [booking] = data.get("Booking");`.
- Line 85: `const { models, tenantRunner } = fixture();`.
- Line 86: `const args = { environment: environment(), dbName: QA_DATABASE_NAME, models, tenantRunner };`.
- Line 94: `<sensitive declaration redacted>`.
- Line 95: `let calls = 0;`.
- Line 96: `const handler = createStagingQaSeedHandler({`.
- Line 101: `<sensitive declaration redacted>`.
- Line 102: `const result = { status: 200, body: null };`.
- Line 103: `const res = { status(code) { result.status = code; return this; }, sendStatus(code) { result.status = code; return this; }, json(body) { result.body = body; return this; } };`.
- Line 114: `let calls = 0;`.
- Line 115: `const runOnce = async () => { calls += 1; };`.
- Line 117: `const result = await runStagingQaStartupSeed({ environment: { ...environment(), STAGING_QA_SEED_ON_STARTUP: flag }, runOnce });`.
- Line 130: `let calls = 0;`.
- Line 131: `const runOnce = async ({ models, environment: actual }) => {`.
- Line 137: `const valid = { ...environment(), STAGING_QA_SEED_ON_STARTUP: "true" };`.
- Line 138: `const result = await runStagingQaStartupSeed({ environment: valid, runOnce });`.
- Line 151: `const markers = new Map();`.
- Line 152: `const mongooseClient = { connection: { db: {`.
- Line 159: `let seeds = 0; let verifications = 0;`.
- Line 160: `const args = {`.
- Line 174: `const markers = new Map();`.
- Line 175: `const mongooseClient = { connection: { db: {`.
- Line 190: `const mongooseClient = { connection: { db: { databaseName: "husseindb", collection() { throw new Error("must not read marker"); } } } };`.
- Line 195: `const mongooseClient = { connection: { db: {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

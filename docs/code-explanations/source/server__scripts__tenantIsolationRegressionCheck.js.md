# Source explanation: server/scripts/tenantIsolationRegressionCheck.js

**Source:** [server/scripts/tenantIsolationRegressionCheck.js](../../../server/scripts/tenantIsolationRegressionCheck.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `AccommodationInventory` from `../models/AccommodationInventory.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccommodationInventory.js](../../../server/models/AccommodationInventory.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getDisposableIntegrationMongoUri` from `../tests/integrationMongoUri.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tests/integrationMongoUri.js](../../../server/tests/integrationMongoUri.js)

## Runtime declarations and data flow

### `fixture` — lines 20–20

Parameters: `name`, `slug`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `pass` — lines 21–21

Parameters: `name`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `fail` — lines 22–22

Parameters: `name`, `error`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `expect` — lines 23–23

Parameters: `name`, `fn`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

## Module-level declarations

- Line 9: `const integrationUri = getDisposableIntegrationMongoUri();`.
- Line 12: `const { default: env } = await import("../config/env.js");`.
- Line 15: `const suffix = \`${Date.now()}-${Math.random().toString(36).slice(2, 8)}\`;`.
- Line 16: `const createdTenantIds = [];`.
- Line 17: `const createdDestinationIds = [];`.
- Line 18: `const createdAccommodationIds = [];`.
- Line 19: `const results = [];`.
- Line 20: `const fixture = (name, slug) => ({ name, slug, country: "Kenya", description: \`Tenant isolation regression fixture for ${name}.\` });`.
- Line 21: `const pass = (name) => results.push({ name, ok: true });`.
- Line 22: `const fail = (name, error) => results.push({ name, ok: false, error: error?.message || String(error) });`.
- Line 23: `const expect = async (name, fn) => { try { await fn(); pass(name); } catch (error) { fail(name, error); } };`.
- Line 26: `const tenantA = await runWithTenant({ bypass: true }, () => Organization.create({ name: \`Isolation A ${suffix}\`, slug: \`isolation-a-${suffix}\`, country: "Kenya", status: "activ`.
- Line 27: `const tenantB = await runWithTenant({ bypass: true }, () => Organization.create({ name: \`Isolation B ${suffix}\`, slug: \`isolation-b-${suffix}\`, country: "Kenya", status: "activ`.
- Line 29: `let destinationA;`.
- Line 30: `let destinationB;`.
- Line 34: `const inventory = await runWithTenant({ tenantId: tenantA._id }, () => AccommodationInventory.create({`.
- Line 46: `const inventory = await runWithTenant({ tenantId: tenantB._id }, () => AccommodationInventory.findById(createdAccommodationIds[0]).lean());`.
- Line 50: `const result = await runWithTenant({ tenantId: tenantB._id }, () => AccommodationInventory.updateOne(`.
- Line 69: `const rows = await runWithTenant({ tenantId: tenantA._id }, () => Destination.aggregate([`.
- Line 105: `const failed = results.filter((result) => !result.ok);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

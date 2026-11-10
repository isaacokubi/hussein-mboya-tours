# Source explanation: server/tests/repairHusseindbTenantCatalogues.test.js

**Source:** [server/tests/repairHusseindbTenantCatalogues.test.js](../../../server/tests/repairHusseindbTenantCatalogues.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `TENANTS`, `assertSafeTarget`, `buildRepairPlan`, `buildCatalogueItinerary`, `resolveTourDurationDays`, `isSyntheticSeedRecord`, `slugify` from `../scripts/repairHusseindbTenantCatalogues.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/scripts/repairHusseindbTenantCatalogues.js](../../../server/scripts/repairHusseindbTenantCatalogues.js)

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 13: `<sensitive declaration redacted>`.
- Line 14: `const confirm = { CONFIRM_HUSSEINDB_CATALOGUE_REPAIR: "YES", NODE_ENV: "maintenance" };`.
- Line 28: `const destinationSets = TENANTS.map((tenant) => new Set(tenant.destinations.map(([name]) => name)));`.
- Line 29: `const tourSets = TENANTS.map((tenant) => new Set(tenant.tours));`.
- Line 45: `const tenantSpec = TENANTS[0];`.
- Line 46: `const tenant = { _id: "tenant-1", slug: tenantSpec.slug };`.
- Line 47: `const destinations = Array.from({ length: 12 }, (_, i) => ({`.
- Line 50: `const tours = Array.from({ length: 8 }, (_, i) => ({`.
- Line 53: `const plan = buildRepairPlan(tenantSpec, tenant, destinations, tours);`.
- Line 60: `const mixedContentPlan = buildRepairPlan(tenantSpec, tenant, destinations, tours.map((row, i) => i === 0 ? { ...row, title: "Real client safari", slug: "real-client-safari", descri`.
- Line 69: `const threeDay = buildCatalogueItinerary({`.
- Line 85: `const oneDay = buildCatalogueItinerary({`.
- Line 98: `const tenantSpec = TENANTS.find((tenant) => tenant.slug === "demo-safari");`.
- Line 99: `const tenant = { _id: "demo-tenant", slug: tenantSpec.slug };`.
- Line 100: `const destinations = Array.from({ length: 12 }, (_, i) => ({ _id: \`destination-${i}\`, createdAt: new Date(i) }));`.
- Line 101: `const tours = Array.from({ length: 8 }, (_, i) => ({ _id: \`tour-${i}\`, createdAt: new Date(i) }));`.
- Line 102: `const plan = buildRepairPlan(tenantSpec, tenant, destinations, tours);`.
- Line 103: `const thomson = plan.tours.find((item) => item.title === "Thomson Falls Highland Day Trip");`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

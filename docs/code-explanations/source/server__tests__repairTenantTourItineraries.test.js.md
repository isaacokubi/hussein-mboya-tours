# Source explanation: server/tests/repairTenantTourItineraries.test.js

**Source:** [server/tests/repairTenantTourItineraries.test.js](../../../server/tests/repairTenantTourItineraries.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assertItineraryRepairTarget`, `buildCorrectedItinerary`, `EXPECTED_TENANTS`, `getEffectiveTourDuration`, `getTourDurationOverride` from `../scripts/repairTenantTourItineraries.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/scripts/repairTenantTourItineraries.js](../../../server/scripts/repairTenantTourItineraries.js)

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 5: `<sensitive declaration redacted>`.
- Line 6: `const confirm = { CONFIRM_TENANT_ITINERARY_REPAIR: "YES", NODE_ENV: "maintenance" };`.
- Line 16: `const tour = { _id: "tour-1", title: "Mara Big Five Expedition", durationDays: 3, highlights: ["Game drives", "Big-five viewing"] };`.
- Line 17: `const destination = { name: "Maasai Mara Conservancy", description: "Open savannah and seasonal migration.", activities: ["Guided game drives", "Wildlife photography"] };`.
- Line 18: `const itinerary = buildCorrectedItinerary(tour, destination, "tenant-1");`.
- Line 27: `const destination = { name: "Thomson Falls Highlands", description: "Waterfall and highland viewpoints.", activities: ["Waterfall visit", "Highland walks", "Photography"] };`.
- Line 28: `const dayTrip = { title: "Thomson Falls Highland Day Trip", durationDays: 3, durationDetails: { days: 3, nights: 2 }, duration: "3" };`.
- Line 33: `const itinerary = buildCorrectedItinerary(dayTrip, destination, "demo-tenant", "demo-safari");`.
- Line 43: `const destination = { name: "Diani Coral Shores", description: "Beach escape", activities: ["Beach activities"] };`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.

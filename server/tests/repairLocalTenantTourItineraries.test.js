/**
 * Purpose: repair Local Tenant Tour Itineraries.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../scripts/repairLocalTenantTourItineraries.js so this module can use its exported dependencies.
import { assertSafeLocalTourRepairTarget, LOCAL_TENANT_SLUGS } from "../scripts/repairLocalTenantTourItineraries.js";

// Declare localUri for use by the surrounding module or function.
const localUri = "mongodb://127.0.0.1:27017/hussein_mboya_local";
// Declare confirm for use by the surrounding module or function.
const confirm = { CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR: "YES", NODE_ENV: "development" };

// Perform the side effect or state update expressed on the following line.
test("local itinerary repair accepts only explicitly confirmed loopback test databases", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(assertSafeLocalTourRepairTarget(localUri, confirm), {
    host: "127.0.0.1",
    database: "hussein_mboya_local",
  });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertSafeLocalTourRepairTarget(localUri, {}), /CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertSafeLocalTourRepairTarget("mongodb+srv://example.mongodb.net/hussein_mboya_local", confirm), /host must be localhost or loopback/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertSafeLocalTourRepairTarget("mongodb://127.0.0.1:27017/husseindb", confirm), /never husseindb/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertSafeLocalTourRepairTarget(localUri, { ...confirm, NODE_ENV: "production" }), /NODE_ENV=production/);
});

// Perform the side effect or state update expressed on the following line.
test("local itinerary repair scopes itself to all three configured tenants", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(LOCAL_TENANT_SLUGS, ["hussein-mboya", "amani-trails", "demo-safari"]);
});

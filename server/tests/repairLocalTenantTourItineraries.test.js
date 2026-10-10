import test from "node:test";
import assert from "node:assert/strict";
import { assertSafeLocalTourRepairTarget, LOCAL_TENANT_SLUGS } from "../scripts/repairLocalTenantTourItineraries.js";

const localUri = "mongodb://127.0.0.1:27017/hussein_mboya_local";
const confirm = { CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR: "YES", NODE_ENV: "development" };

test("local itinerary repair accepts only explicitly confirmed loopback test databases", () => {
  assert.deepEqual(assertSafeLocalTourRepairTarget(localUri, confirm), {
    host: "127.0.0.1",
    database: "hussein_mboya_local",
  });
  assert.throws(() => assertSafeLocalTourRepairTarget(localUri, {}), /CONFIRM_LOCAL_TOUR_ITINERARY_REPAIR/);
  assert.throws(() => assertSafeLocalTourRepairTarget("mongodb+srv://example.mongodb.net/hussein_mboya_local", confirm), /host must be localhost or loopback/);
  assert.throws(() => assertSafeLocalTourRepairTarget("mongodb://127.0.0.1:27017/husseindb", confirm), /never husseindb/);
  assert.throws(() => assertSafeLocalTourRepairTarget(localUri, { ...confirm, NODE_ENV: "production" }), /NODE_ENV=production/);
});

test("local itinerary repair scopes itself to all three configured tenants", () => {
  assert.deepEqual(LOCAL_TENANT_SLUGS, ["hussein-mboya", "amani-trails", "demo-safari"]);
});

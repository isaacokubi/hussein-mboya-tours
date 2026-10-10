import test from "node:test";
import assert from "node:assert/strict";
import {
  TENANTS,
  assertSafeTarget,
  buildRepairPlan,
  isSyntheticSeedRecord,
  slugify
} from "../scripts/repairHusseindbTenantCatalogues.js";

const approvedUri = "mongodb+srv://repair-user:unused-password@cluster0.cdtxzts.mongodb.net/husseindb?retryWrites=true&w=majority";
const confirm = { CONFIRM_HUSSEINDB_CATALOGUE_REPAIR: "YES", NODE_ENV: "maintenance" };

test("only the explicitly confirmed husseindb Atlas target is accepted", () => {
  assert.deepEqual(assertSafeTarget(approvedUri, confirm), {
    host: "cluster0.cdtxzts.mongodb.net",
    database: "husseindb"
  });
  assert.throws(() => assertSafeTarget(approvedUri, {}), /CONFIRM_HUSSEINDB_CATALOGUE_REPAIR/);
  assert.throws(() => assertSafeTarget(approvedUri.replace("/husseindb?", "/global_tours_test?"), confirm), /Refusing to write outside husseindb/);
  assert.throws(() => assertSafeTarget(approvedUri.replace("cluster0.cdtxzts.mongodb.net", "other.mongodb.net"), confirm), /Refusing to write outside husseindb/);
});

test("catalogues are unique per tenant and have twelve destinations and tours", () => {
  assert.equal(TENANTS.length, 3);
  const destinationSets = TENANTS.map((tenant) => new Set(tenant.destinations.map(([name]) => name)));
  const tourSets = TENANTS.map((tenant) => new Set(tenant.tours));
  for (const tenant of TENANTS) {
    assert.equal(tenant.destinations.length, 12);
    assert.equal(new Set(tenant.destinations.map(([name]) => name)).size, 12);
    assert.equal(tenant.tours.length, 12);
    assert.equal(new Set(tenant.tours).size, 12);
  }
  for (let i = 0; i < TENANTS.length; i++) {
    for (let j = i + 1; j < TENANTS.length; j++) {
      assert.equal([...destinationSets[i]].some((name) => destinationSets[j].has(name)), false);
      assert.equal([...tourSets[i]].some((name) => tourSets[j].has(name)), false);
    }
  }
});

test("repair plan remaps disposable tenant catalogue records and preserves record IDs", () => {
  const tenantSpec = TENANTS[0];
  const tenant = { _id: "tenant-1", slug: tenantSpec.slug };
  const destinations = Array.from({ length: 12 }, (_, i) => ({
    _id: `destination-${i}`, name: `Old destination ${i}`, slug: `old-hussein-${i}`, createdAt: new Date(i)
  }));
  const tours = Array.from({ length: 8 }, (_, i) => ({
    _id: `tour-${i}`, title: `Old tour ${i}`, slug: `old-hussein-tour-${i}`, description: "Old sample", createdAt: new Date(i)
  }));
  const plan = buildRepairPlan(tenantSpec, tenant, destinations, tours);
  assert.equal(plan.destinations.length, 12);
  assert.equal(plan.tours.length, 8);
  assert.equal(plan.destinations[0].row._id, "destination-0");
  assert.equal(plan.tours[0].row._id, "tour-0");
  assert.equal(plan.tours[0].price, tenantSpec.priceBase);
  assert.throws(() => buildRepairPlan(tenantSpec, tenant, destinations.slice(1), tours), /Expected at least 12 destinations/);
  const mixedContentPlan = buildRepairPlan(tenantSpec, tenant, destinations, tours.map((row, i) => i === 0 ? { ...row, title: "Real client safari", slug: "real-client-safari", description: "A real client itinerary" } : row));
  assert.equal(mixedContentPlan.tours[0].row.title, "Real client safari");
});

test("Thomson Falls is seeded as a one-day trip while the other mapped tours remain three days", () => {
  const tenantSpec = TENANTS.find((tenant) => tenant.slug === "demo-safari");
  const tenant = { _id: "demo-tenant", slug: tenantSpec.slug };
  const destinations = Array.from({ length: 12 }, (_, i) => ({ _id: `destination-${i}`, createdAt: new Date(i) }));
  const tours = Array.from({ length: 8 }, (_, i) => ({ _id: `tour-${i}`, createdAt: new Date(i) }));
  const plan = buildRepairPlan(tenantSpec, tenant, destinations, tours);
  const thomson = plan.tours.find((item) => item.title === "Thomson Falls Highland Day Trip");
  assert.equal(thomson.durationDays, 1);
  assert.equal(plan.tours.filter((item) => item.title !== "Thomson Falls Highland Day Trip").every((item) => item.durationDays === 3), true);
});

test("slug generation is stable and safe", () => {
  assert.equal(slugify("Mombasa Heritage Quarter"), "mombasa-heritage-quarter");
  assert.equal(isSyntheticSeedRecord({ title: "TEST sample" }), true);
  assert.equal(isSyntheticSeedRecord({ slug: "test-tenant-sample" }), true);
  assert.equal(isSyntheticSeedRecord({ title: "Customer's Private Safari" }), false);
});

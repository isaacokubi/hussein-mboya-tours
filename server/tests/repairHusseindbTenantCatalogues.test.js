/**
 * Purpose: repair Husseindb Tenant Catalogues.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../scripts/repairHusseindbTenantCatalogues.js so this module can use its exported dependencies.
import {
  TENANTS,
  assertSafeTarget,
  buildRepairPlan,
  buildCatalogueItinerary,
  resolveTourDurationDays,
  isSyntheticSeedRecord,
  slugify
} from "../scripts/repairHusseindbTenantCatalogues.js";

// Declare approvedUri for use by the surrounding module or function.
const approvedUri = "mongodb+srv://repair-user:unused-password@cluster0.cdtxzts.mongodb.net/husseindb?retryWrites=true&w=majority";
// Declare confirm for use by the surrounding module or function.
const confirm = { CONFIRM_HUSSEINDB_CATALOGUE_REPAIR: "YES", NODE_ENV: "maintenance" };

// Perform the side effect or state update expressed on the following line.
test("only the explicitly confirmed husseindb Atlas target is accepted", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(assertSafeTarget(approvedUri, confirm), {
    host: "cluster0.cdtxzts.mongodb.net",
    database: "husseindb"
  });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertSafeTarget(approvedUri, {}), /CONFIRM_HUSSEINDB_CATALOGUE_REPAIR/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertSafeTarget(approvedUri.replace("/husseindb?", "/global_tours_test?"), confirm), /Refusing to write outside husseindb/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertSafeTarget(approvedUri.replace("cluster0.cdtxzts.mongodb.net", "other.mongodb.net"), confirm), /Refusing to write outside husseindb/);
});

// Perform the side effect or state update expressed on the following line.
test("catalogues are unique per tenant and have twelve destinations and tours", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(TENANTS.length, 3);
  // Declare destinationSets for use by the surrounding module or function.
  const destinationSets = TENANTS.map((tenant) => new Set(tenant.destinations.map(([name]) => name)));
  // Declare tourSets for use by the surrounding module or function.
  const tourSets = TENANTS.map((tenant) => new Set(tenant.tours));
  // Repeat the enclosed work for each required iteration.
  for (const tenant of TENANTS) {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenant.destinations.length, 12);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(new Set(tenant.destinations.map(([name]) => name)).size, 12);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenant.tours.length, 12);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(new Set(tenant.tours).size, 12);
  }
  // Repeat the enclosed work for each required iteration.
  for (let i = 0; i < TENANTS.length; i++) {
    // Repeat the enclosed work for each required iteration.
    for (let j = i + 1; j < TENANTS.length; j++) {
      // Perform the side effect or state update expressed on the following line.
      assert.equal([...destinationSets[i]].some((name) => destinationSets[j].has(name)), false);
      // Perform the side effect or state update expressed on the following line.
      assert.equal([...tourSets[i]].some((name) => tourSets[j].has(name)), false);
    }
  }
});

// Perform the side effect or state update expressed on the following line.
test("repair plan remaps disposable tenant catalogue records and preserves record IDs", () => {
  // Declare tenantSpec for use by the surrounding module or function.
  const tenantSpec = TENANTS[0];
  // Declare tenant for use by the surrounding module or function.
  const tenant = { _id: "tenant-1", slug: tenantSpec.slug };
  // Declare destinations for use by the surrounding module or function.
  const destinations = Array.from({ length: 12 }, (_, i) => ({
    _id: `destination-${i}`, name: `Old destination ${i}`, slug: `old-hussein-${i}`, createdAt: new Date(i)
  }));
  // Declare tours for use by the surrounding module or function.
  const tours = Array.from({ length: 8 }, (_, i) => ({
    _id: `tour-${i}`, title: `Old tour ${i}`, slug: `old-hussein-tour-${i}`, description: "Old sample", createdAt: new Date(i)
  }));
  // Declare plan for use by the surrounding module or function.
  const plan = buildRepairPlan(tenantSpec, tenant, destinations, tours);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(plan.destinations.length, 12);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(plan.tours.length, 8);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(plan.destinations[0].row._id, "destination-0");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(plan.tours[0].row._id, "tour-0");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(plan.tours[0].price, tenantSpec.priceBase);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => buildRepairPlan(tenantSpec, tenant, destinations.slice(1), tours), /Expected at least 12 destinations/);
  // Declare mixedContentPlan for use by the surrounding module or function.
  const mixedContentPlan = buildRepairPlan(tenantSpec, tenant, destinations, tours.map((row, i) => i === 0 ? { ...row, title: "Real client safari", slug: "real-client-safari", description: "A real client itinerary" } : row));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(mixedContentPlan.tours[0].row.title, "Real client safari");
});

// Perform the side effect or state update expressed on the following line.
test("catalogue itineraries are tenant-aware, detailed, and match tour duration", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(resolveTourDurationDays({ duration: "3", durationDays: 1, durationDetails: { days: 1 } }), 3);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(resolveTourDurationDays({ duration: "1", durationDays: 1, durationDetails: { days: 1 } }), 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(resolveTourDurationDays({ duration: "12 days", durationDays: 1, durationDetails: { days: 1 } }), 12);

  // Declare threeDay for use by the surrounding module or function.
  const threeDay = buildCatalogueItinerary({
    tenantSlug: "amani-trails",
    tourTitle: "Mara Great Migration Signature",
    destinationName: "Mara River Migration Camp",
    destinationDescription: "Seasonal migration country and guided camp experiences.",
    activities: ["Migration viewing", "River game drives", "Campfire evenings"],
    durationDays: 3,
  });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(threeDay.length, 3);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(threeDay.map((day) => day.day), [1, 2, 3]);
  // Perform the side effect or state update expressed on the following line.
  assert.match(threeDay[0].title, /Arrival/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(threeDay[1].description, /Seasonal migration country/);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(threeDay.every((day) => day.title && day.description && day.activities.length));
  // Perform the side effect or state update expressed on the following line.
  assert.match(threeDay[0].description, /Amani Trails/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(threeDay[2].accommodation, "");

  // Declare oneDay for use by the surrounding module or function.
  const oneDay = buildCatalogueItinerary({
    tenantSlug: "demo-safari",
    tourTitle: "Mombasa City Discovery",
    destinationName: "Mombasa Heritage Quarter",
    durationDays: 1,
  });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(oneDay.length, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.match(oneDay[0].title, /Mombasa Heritage Quarter/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(buildCatalogueItinerary({ tenantSlug: "hussein-mboya", tourTitle: "Short trip", destinationName: "Nairobi", durationDays: 0 }).length, 3);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(buildCatalogueItinerary({ tenantSlug: "hussein-mboya", tourTitle: "Long trip", destinationName: "Kenya", durationDays: 15 }).length, 15);
});

// Perform the side effect or state update expressed on the following line.
test("Thomson Falls is seeded as a one-day trip while the other mapped tours remain three days", () => {
  // Declare tenantSpec for use by the surrounding module or function.
  const tenantSpec = TENANTS.find((tenant) => tenant.slug === "demo-safari");
  // Declare tenant for use by the surrounding module or function.
  const tenant = { _id: "demo-tenant", slug: tenantSpec.slug };
  // Declare destinations for use by the surrounding module or function.
  const destinations = Array.from({ length: 12 }, (_, i) => ({ _id: `destination-${i}`, createdAt: new Date(i) }));
  // Declare tours for use by the surrounding module or function.
  const tours = Array.from({ length: 8 }, (_, i) => ({ _id: `tour-${i}`, createdAt: new Date(i) }));
  // Declare plan for use by the surrounding module or function.
  const plan = buildRepairPlan(tenantSpec, tenant, destinations, tours);
  // Declare thomson for use by the surrounding module or function.
  const thomson = plan.tours.find((item) => item.title === "Thomson Falls Highland Day Trip");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(thomson.durationDays, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(plan.tours.filter((item) => item.title !== "Thomson Falls Highland Day Trip").every((item) => item.durationDays === 3), true);
});

// Perform the side effect or state update expressed on the following line.
test("slug generation is stable and safe", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(slugify("Mombasa Heritage Quarter"), "mombasa-heritage-quarter");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isSyntheticSeedRecord({ title: "TEST sample" }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isSyntheticSeedRecord({ slug: "test-tenant-sample" }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isSyntheticSeedRecord({ title: "Customer's Private Safari" }), false);
});

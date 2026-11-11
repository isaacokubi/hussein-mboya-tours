/**
 * Purpose: tenant Isolation Regression Check operational script. Main declarations: fixture, pass, fail, expect.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/AccommodationInventory.js so this module can use its exported dependencies.
import AccommodationInventory from "../models/AccommodationInventory.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../tests/integrationMongoUri.js so this module can use its exported dependencies.
import { getDisposableIntegrationMongoUri } from "../tests/integrationMongoUri.js";

// Perform the side effect or state update expressed on the following line.
await import("../tenancy/bootstrap.js");
// Declare integrationUri for use by the surrounding module or function.
const integrationUri = getDisposableIntegrationMongoUri();
// Check the condition (!integrationUri) and run the matching branch.
if (!integrationUri) throw new Error("Set LIFECYCLE_TEST_MONGODB_URI to an authorized test database before running the live tenant regression check.");
// Perform the side effect or state update expressed on the following line.
process.env.MONGODB_URI = integrationUri;
// Declare { default: env } for use by the surrounding module or function.
const { default: env } = await import("../config/env.js");
// Perform the side effect or state update expressed on the following line.
await mongoose.connect(env.MONGODB_URI);

// Declare suffix for use by the surrounding module or function.
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
// Declare createdTenantIds for use by the surrounding module or function.
const createdTenantIds = [];
// Declare createdDestinationIds for use by the surrounding module or function.
const createdDestinationIds = [];
// Declare createdAccommodationIds for use by the surrounding module or function.
const createdAccommodationIds = [];
// Declare results for use by the surrounding module or function.
const results = [];
// Declare fixture for use by the surrounding module or function.
const fixture = (name, slug) => ({ name, slug, country: "Kenya", description: `Tenant isolation regression fixture for ${name}.` });
// Declare pass for use by the surrounding module or function.
const pass = (name) => results.push({ name, ok: true });
// Declare fail for use by the surrounding module or function.
const fail = (name, error) => results.push({ name, ok: false, error: error?.message || String(error) });
// Declare expect for use by the surrounding module or function.
const expect = async (name, fn) => { try { await fn(); pass(name); } catch (error) { fail(name, error); } };

// Run this operation with a dedicated error-handling path for failures.
try {
  // Declare tenantA for use by the surrounding module or function.
  const tenantA = await runWithTenant({ bypass: true }, () => Organization.create({ name: `Isolation A ${suffix}`, slug: `isolation-a-${suffix}`, country: "Kenya", status: "active" }));
  // Declare tenantB for use by the surrounding module or function.
  const tenantB = await runWithTenant({ bypass: true }, () => Organization.create({ name: `Isolation B ${suffix}`, slug: `isolation-b-${suffix}`, country: "Kenya", status: "active" }));
  // Perform the side effect or state update expressed on the following line.
  createdTenantIds.push(tenantA._id, tenantB._id);
  // Declare destinationA for use by the surrounding module or function.
  let destinationA;
  // Declare destinationB for use by the surrounding module or function.
  let destinationB;

  // Perform the side effect or state update expressed on the following line.
  await expect("Tenant A create", async () => { destinationA = await runWithTenant({ tenantId: tenantA._id }, () => Destination.create(fixture(`Isolation Destination A ${suffix}`, `isolation-destination-a-${suffix}`))); createdDestinationIds.push(destinationA._id); });
  // Perform the side effect or state update expressed on the following line.
  await expect("Tenant-scoped accommodation inventory create", async () => {
    // Declare inventory for use by the surrounding module or function.
    const inventory = await runWithTenant({ tenantId: tenantA._id }, () => AccommodationInventory.create({
      propertyName: `Isolation Hotel ${suffix}`,
      roomType: "Standard",
      totalRooms: 10,
      availableRooms: 10,
      nightlyRate: 1000,
      currency: "KES",
    }));
    // Perform the side effect or state update expressed on the following line.
    createdAccommodationIds.push(inventory._id);
    // Check the condition (String(inventory.tenantId) !== String(tenantA._id)) and run the matching branch.
    if (String(inventory.tenantId) !== String(tenantA._id)) throw new Error("Accommodation inventory was not assigned to Tenant A.");
  });
  // Perform the side effect or state update expressed on the following line.
  await expect("Cross-tenant accommodation read blocked", async () => {
    // Declare inventory for use by the surrounding module or function.
    const inventory = await runWithTenant({ tenantId: tenantB._id }, () => AccommodationInventory.findById(createdAccommodationIds[0]).lean());
    // Check the condition (inventory) and run the matching branch.
    if (inventory) throw new Error("Tenant B read Tenant A accommodation inventory.");
  });
  // Perform the side effect or state update expressed on the following line.
  await expect("Cross-tenant accommodation update blocked", async () => {
    // Declare result for use by the surrounding module or function.
    const result = await runWithTenant({ tenantId: tenantB._id }, () => AccommodationInventory.updateOne(
      { _id: createdAccommodationIds[0] },
      { $set: { nightlyRate: 1 } },
    ));
    // Check the condition (result.matchedCount !== 0) and run the matching branch.
    if (result.matchedCount !== 0) throw new Error("Tenant B updated Tenant A accommodation inventory.");
  });

  // Perform the side effect or state update expressed on the following line.
  await expect("Tenant B create", async () => { destinationB = await runWithTenant({ tenantId: tenantB._id }, () => Destination.create(fixture(`Isolation Destination B ${suffix}`, `isolation-destination-b-${suffix}`))); createdDestinationIds.push(destinationB._id); });
  // Perform the side effect or state update expressed on the following line.
  await expect("Missing tenant context fails closed", async () => {
    // Run this operation with a dedicated error-handling path for failures.
    try { await Destination.findOne({ _id: destinationA._id }); } catch (error) { if (/Tenant context is required/i.test(error.message)) return; throw error; }
    // Stop the current operation by raising a new Error instance.
    throw new Error("Tenant-scoped query unexpectedly succeeded without tenant context.");
  });
  // Perform the side effect or state update expressed on the following line.
  await expect("Cross-tenant read blocked", async () => { const found = await runWithTenant({ tenantId: tenantA._id }, () => Destination.findById(destinationB._id).lean()); if (found) throw new Error("Tenant A read Tenant B data."); });
  // Perform the side effect or state update expressed on the following line.
  await expect("Cross-tenant update blocked", async () => { const result = await runWithTenant({ tenantId: tenantA._id }, () => Destination.updateOne({ _id: destinationB._id }, { $set: { name: `ATTACK ${suffix}` } })); if (result.matchedCount !== 0) throw new Error("Tenant A updated Tenant B data."); });
  // Perform the side effect or state update expressed on the following line.
  await expect("Cross-tenant delete blocked", async () => { const result = await runWithTenant({ tenantId: tenantA._id }, () => Destination.deleteOne({ _id: destinationB._id })); if (result.deletedCount !== 0) throw new Error("Tenant A deleted Tenant B data."); });
  // Perform the side effect or state update expressed on the following line.
  await expect("Tenant-scoped insertMany", async () => { const docs = await runWithTenant({ tenantId: tenantA._id }, () => Destination.insertMany([fixture(`Isolation Bulk 1 ${suffix}`, `isolation-bulk-1-${suffix}`), fixture(`Isolation Bulk 2 ${suffix}`, `isolation-bulk-2-${suffix}`)])); createdDestinationIds.push(...docs.map((doc) => doc._id)); if (docs.some((doc) => String(doc.tenantId) !== String(tenantA._id))) throw new Error("insertMany assigned the wrong tenant."); });
  // Perform the side effect or state update expressed on the following line.
  await expect("Tenant-scoped bulkWrite", async () => { const result = await runWithTenant({ tenantId: tenantA._id }, () => Destination.bulkWrite([{ updateOne: { filter: { _id: destinationA._id }, update: { $set: { shortDescription: "tenant-isolation-regression" } } } }])); if (result.matchedCount !== 1) throw new Error("bulkWrite did not target the tenant-owned record."); });
  // Perform the side effect or state update expressed on the following line.
  await expect("Cross-tenant aggregation lookup blocked", async () => { const rows = await runWithTenant({ tenantId: tenantA._id }, () => Destination.aggregate([{ $match: { _id: destinationA._id } }, { $lookup: { from: "destinations", pipeline: [{ $match: { country: "Kenya" } }], as: "allKenyaDestinations" } }])); const joinedIds = (rows[0]?.allKenyaDestinations || []).map((row) => String(row._id)); if (joinedIds.includes(String(destinationB._id))) throw new Error("Aggregation lookup returned Tenant B data."); if (!joinedIds.includes(String(destinationA._id))) throw new Error("Aggregation lookup lost Tenant A data."); });
  // Perform the side effect or state update expressed on the following line.
  await expect("Nested facet lookup remains tenant-scoped", async () => {
    // Declare rows for use by the surrounding module or function.
    const rows = await runWithTenant({ tenantId: tenantA._id }, () => Destination.aggregate([
      { $match: { _id: destinationA._id } },
      { $facet: { related: [{ $lookup: { from: Destination.collection.name, pipeline: [{ $match: { _id: destinationB._id } }], as: "otherTenant" } }] } },
    ]));
    // Check the condition (rows[0]?.related?.[0]?.otherTenant?.length) and run the matching branch.
    if (rows[0]?.related?.[0]?.otherTenant?.length) throw new Error("Nested facet lookup returned Tenant B data.");
  });
  // Perform the side effect or state update expressed on the following line.
  await expect("Aggregation update cannot remove tenantId with string unset", async () => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await runWithTenant({ tenantId: tenantA._id }, () => Destination.updateOne({ _id: destinationA._id }, [{ $unset: "tenantId" }]));
    } catch (error) {
      // Check the condition (/Cross-tenant tenantId removal rejected/.test(error.message)) and run the matching branch.
      if (/Cross-tenant tenantId removal rejected/.test(error.message)) return;
      // Stop the current operation by raising the value of error.
      throw error;
    }
    // Stop the current operation by raising a new Error instance.
    throw new Error("Tenant-scoped update pipeline removed tenantId.");
  });
  // Perform the side effect or state update expressed on the following line.
  await expect("Aggregation update cannot replace the tenant-scoped document root", async () => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await runWithTenant({ tenantId: tenantA._id }, () => Destination.updateOne({ _id: destinationA._id }, [{ $replaceWith: { $literal: { name: "replaced" } } }]));
    } catch (error) {
      // Check the condition (/cannot replace or project the document root/.test(error.message)) and run the matching branch.
      if (/cannot replace or project the document root/.test(error.message)) return;
      // Stop the current operation by raising the value of error.
      throw error;
    }
    // Stop the current operation by raising a new Error instance.
    throw new Error("Tenant-scoped update pipeline replaced the document root.");
  });
  // Perform the side effect or state update expressed on the following line.
  await expect("estimatedDocumentCount fails closed", async () => { try { await runWithTenant({ tenantId: tenantA._id }, () => Destination.estimatedDocumentCount()); } catch (error) { if (/not tenant-safe|Tenant context|blocked for tenant-scoped models/i.test(error.message)) return; throw error; } throw new Error("estimatedDocumentCount unexpectedly succeeded in tenant context."); });
  // Perform the side effect or state update expressed on the following line.
  await expect("Tenant data survives cross-tenant attacks", async () => { const own = await runWithTenant({ tenantId: tenantA._id }, () => Destination.findById(destinationA._id).lean()); const other = await runWithTenant({ tenantId: tenantB._id }, () => Destination.findById(destinationA._id).lean()); if (!own) throw new Error("Tenant A lost its own record."); if (other) throw new Error("Tenant B can read Tenant A data."); });
} finally {
  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ bypass: true }, async () => { if (createdDestinationIds.length) await Destination.deleteMany({ _id: { $in: createdDestinationIds } });
    // Check the condition (createdAccommodationIds.length) and run the matching branch.
    if (createdAccommodationIds.length) await AccommodationInventory.deleteMany({ _id: { $in: createdAccommodationIds } }); if (createdTenantIds.length) await Organization.deleteMany({ _id: { $in: createdTenantIds } }); });
  // Perform the side effect or state update expressed on the following line.
  await mongoose.disconnect();
}

// Perform the side effect or state update expressed on the following line.
console.log("\n============================================================");
// Perform the side effect or state update expressed on the following line.
console.log("TENANT ISOLATION REGRESSION CHECK");
// Perform the side effect or state update expressed on the following line.
console.log("============================================================");
// Repeat the enclosed work for each required iteration.
for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.error ? ` — ${result.error}` : ""}`);
// Declare failed for use by the surrounding module or function.
const failed = results.filter((result) => !result.ok);
// Perform the side effect or state update expressed on the following line.
console.log("\nPassed:", results.length - failed.length);
// Perform the side effect or state update expressed on the following line.
console.log("Failed:", failed.length);
// Perform the side effect or state update expressed on the following line.
console.log("Total :", results.length);
// Check the condition (failed.length) and run the matching branch.
if (failed.length) process.exit(1);
// Perform the side effect or state update expressed on the following line.
console.log("RESULT: TENANT ISOLATION REGRESSION PASSED");

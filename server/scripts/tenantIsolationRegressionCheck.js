import mongoose from "mongoose";
import env from "../config/env.js";
import { runWithTenant } from "../tenancy/context.js";

await import("../tenancy/bootstrap.js");
const { default: Organization } = await import("../models/Organization.js");
const { default: Destination } = await import("../models/Destination.js");

await mongoose.connect(env.MONGODB_URI);

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createdTenantIds = [];
const createdDestinationIds = [];
const results = [];
const fixture = (name, slug) => ({ name, slug, country: "Kenya", description: `Tenant isolation regression fixture for ${name}.` });

const pass = (name) => results.push({ name, ok: true });
const fail = (name, error) => results.push({ name, ok: false, error: error?.message || String(error) });
const expect = async (name, fn) => {
  try { await fn(); pass(name); } catch (error) { fail(name, error); }
};

try {
  const tenantA = await runWithTenant({ bypass: true }, () => Organization.create({ name: `Isolation A ${suffix}`, slug: `isolation-a-${suffix}`, status: "active" }));
  const tenantB = await runWithTenant({ bypass: true }, () => Organization.create({ name: `Isolation B ${suffix}`, slug: `isolation-b-${suffix}`, status: "active" }));
  createdTenantIds.push(tenantA._id, tenantB._id);

  let destinationA;
  let destinationB;

  await expect("Tenant A create", async () => {
    destinationA = await runWithTenant({ tenantId: tenantA._id }, () => Destination.create(fixture(`Isolation Destination A ${suffix}`, `isolation-destination-a-${suffix}`)));
    createdDestinationIds.push(destinationA._id);
  });

  await expect("Tenant B create", async () => {
    destinationB = await runWithTenant({ tenantId: tenantB._id }, () => Destination.create(fixture(`Isolation Destination B ${suffix}`, `isolation-destination-b-${suffix}`)));
    createdDestinationIds.push(destinationB._id);
  });

  await expect("Missing tenant context fails closed", async () => {
    try { await Destination.findOne({ _id: destinationA._id }); }
    catch (error) {
      if (/Tenant context is required/i.test(error.message)) return;
      throw error;
    }
    throw new Error("Tenant-scoped query unexpectedly succeeded without tenant context.");
  });

  await expect("Cross-tenant read blocked", async () => {
    const found = await runWithTenant({ tenantId: tenantA._id }, () => Destination.findById(destinationB._id).lean());
    if (found) throw new Error("Tenant A read Tenant B data.");
  });

  await expect("Cross-tenant update blocked", async () => {
    const result = await runWithTenant({ tenantId: tenantA._id }, () => Destination.updateOne({ _id: destinationB._id }, { $set: { name: `ATTACK ${suffix}` } }));
    if (result.matchedCount !== 0) throw new Error("Tenant A updated Tenant B data.");
  });

  await expect("Cross-tenant delete blocked", async () => {
    const result = await runWithTenant({ tenantId: tenantA._id }, () => Destination.deleteOne({ _id: destinationB._id }));
    if (result.deletedCount !== 0) throw new Error("Tenant A deleted Tenant B data.");
  });

  await expect("Tenant-scoped insertMany", async () => {
    const docs = await runWithTenant({ tenantId: tenantA._id }, () => Destination.insertMany([
      fixture(`Isolation Bulk 1 ${suffix}`, `isolation-bulk-1-${suffix}`),
      fixture(`Isolation Bulk 2 ${suffix}`, `isolation-bulk-2-${suffix}`),
    ]));
    createdDestinationIds.push(...docs.map((doc) => doc._id));
    if (docs.some((doc) => String(doc.tenantId) !== String(tenantA._id))) throw new Error("insertMany assigned the wrong tenant.");
  });

  await expect("Tenant-scoped bulkWrite", async () => {
    const result = await runWithTenant({ tenantId: tenantA._id }, () => Destination.bulkWrite([
      { updateOne: { filter: { _id: destinationA._id }, update: { $set: { shortDescription: "tenant-isolation-regression" } } } },
    ]));
    if (result.matchedCount !== 1) throw new Error("bulkWrite did not target the tenant-owned record.");
  });

  await expect("Cross-tenant aggregation lookup blocked", async () => {
    const rows = await runWithTenant({ tenantId: tenantA._id }, () => Destination.aggregate([
      { $match: { _id: destinationA._id } },
      { $lookup: { from: "destinations", pipeline: [{ $match: { country: "Kenya" } }], as: "allKenyaDestinations" } },
    ]));
    const joinedIds = (rows[0]?.allKenyaDestinations || []).map((row) => String(row._id));
    if (joinedIds.includes(String(destinationB._id))) throw new Error("Aggregation lookup returned Tenant B data.");
    if (!joinedIds.includes(String(destinationA._id))) throw new Error("Aggregation lookup lost Tenant A data.");
  });

  await expect("estimatedDocumentCount fails closed", async () => {
    try { await runWithTenant({ tenantId: tenantA._id }, () => Destination.estimatedDocumentCount()); }
    catch (error) {
      if (/not tenant-safe|Tenant context/i.test(error.message)) return;
      throw error;
    }
    throw new Error("estimatedDocumentCount unexpectedly succeeded in tenant context.");
  });

  await expect("Tenant data survives cross-tenant attacks", async () => {
    const own = await runWithTenant({ tenantId: tenantA._id }, () => Destination.findById(destinationA._id).lean());
    const other = await runWithTenant({ tenantId: tenantB._id }, () => Destination.findById(destinationA._id).lean());
    if (!own) throw new Error("Tenant A lost its own record.");
    if (other) throw new Error("Tenant B can read Tenant A data.");
  });
} finally {
  await runWithTenant({ bypass: true }, async () => {
    if (createdDestinationIds.length) await Destination.deleteMany({ _id: { $in: createdDestinationIds } });
    if (createdTenantIds.length) await Organization.deleteMany({ _id: { $in: createdTenantIds } });
  });
  await mongoose.disconnect();
}

console.log("\n============================================================");
console.log("TENANT ISOLATION REGRESSION CHECK");
console.log("============================================================");
for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.error ? ` — ${result.error}` : ""}`);
const failed = results.filter((result) => !result.ok);
console.log("\nPassed:", results.length - failed.length);
console.log("Failed:", failed.length);
console.log("Total :", results.length);
if (failed.length) process.exit(1);
console.log("RESULT: TENANT ISOLATION REGRESSION PASSED");

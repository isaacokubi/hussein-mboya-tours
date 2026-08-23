import mongoose from "mongoose";
import env from "../config/env.js";
import { runWithTenant } from "../tenancy/context.js";

const { default: Organization } = await import("../models/Organization.js");

await mongoose.connect(env.MONGODB_URI);

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const ids = [];
const results = [];
const pass = (name) => results.push({ name, ok: true });
const fail = (name, error) => results.push({ name, ok: false, error: error?.message || String(error) });

const expect = async (name, fn) => {
  try {
    await fn();
    pass(name);
  } catch (error) {
    fail(name, error);
  }
};

try {
  const organizationA = await runWithTenant({ bypass: true, role: "super_admin" }, () =>
    Organization.create({
      name: `Global Isolation A ${suffix}`,
      slug: `global-isolation-a-${suffix}`,
      domain: `global-a-${suffix}.test`,
      status: "active",
    })
  );
  const organizationB = await runWithTenant({ bypass: true, role: "super_admin" }, () =>
    Organization.create({
      name: `Global Isolation B ${suffix}`,
      slug: `global-isolation-b-${suffix}`,
      domain: `global-b-${suffix}.test`,
      status: "active",
    })
  );
  ids.push(organizationA._id, organizationB._id);

  await expect("Global organization A is readable from tenant A context", async () => {
    const found = await runWithTenant({ tenantId: organizationA._id, role: "admin" }, () =>
      Organization.findById(organizationB._id).lean()
    );
    if (!found) throw new Error("Global Organization data was incorrectly tenant-filtered.");
  });

  await expect("Global organization uniqueness remains platform-wide", async () => {
    try {
      await runWithTenant({ bypass: true, role: "super_admin" }, () =>
        Organization.create({
          name: `Duplicate Global ${suffix}`,
          slug: `global-isolation-a-${suffix}`,
          domain: `other-${suffix}.test`,
          status: "active",
        })
      );
    } catch (error) {
      if (error?.code === 11000) return;
      throw error;
    }
    throw new Error("Duplicate global organization slug was accepted.");
  });

  await expect("No obsolete tenant-partitioned global indexes", async () => {
    for (const collectionName of ["organizations", "permissions", "currencies"]) {
      const indexes = await mongoose.connection.db.collection(collectionName).listIndexes().toArray();
      const bad = indexes.filter((index) =>
        index.name?.startsWith("tenantId_") || Object.keys(index.key || {}).includes("tenantId")
      );
      if (bad.length) {
        throw new Error(`${collectionName} contains tenant-partitioned indexes: ${bad.map((index) => index.name).join(", ")}`);
      }
    }
  });
} finally {
  await runWithTenant({ bypass: true, role: "super_admin" }, async () => {
    if (ids.length) await Organization.deleteMany({ _id: { $in: ids } });
  });
  await mongoose.disconnect();
}

console.log("\nGlobal Tenant Isolation Results");
console.log("================================");

for (const result of results) {
  if (result.ok) console.log("PASS:", result.name);
  else console.log("FAIL:", result.name, "-", result.error);
}

const failed = results.filter((result) => !result.ok);
if (failed.length) process.exitCode = 1;
else console.log("\nAll global tenant-boundary checks passed.");

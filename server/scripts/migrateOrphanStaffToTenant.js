import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";
import Staff from "../models/Staff.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const tenantId = String(process.env.TENANT_ID || "").trim();
const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();

const migrate = async () => {
  if (!tenantId && !tenantSlug) {
    throw new Error("Set TENANT_ID or TENANT_SLUG before running this migration.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const organization = tenantId
    ? await Organization.findById(tenantId).lean()
    : await Organization.findOne({ slug: tenantSlug }).lean();

  if (!organization) {
    throw new Error("Tenant organization was not found.");
  }

  const orphanFilter = {
    $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
  };
  const orphanCount = await Staff.collection.countDocuments(orphanFilter);

  if (orphanCount === 0) {
    console.log(`No orphan staff records found for tenant ${organization.name}.`);
    return;
  }

  if (String(process.env.CONFIRM_ORPHAN_STAFF_MIGRATION).toLowerCase() !== "true") {
    console.log(`Found ${orphanCount} orphan staff record(s).`);
    console.log("No records were changed. Set CONFIRM_ORPHAN_STAFF_MIGRATION=true to assign them to the selected tenant.");
    return;
  }

  const result = await runWithTenant(
    { tenantId: organization._id, tenant: organization },
    () =>
      Staff.collection.updateMany(orphanFilter, {
        $set: { tenantId: organization._id },
      }),
  );

  console.log(`Assigned ${result.modifiedCount} orphan staff record(s) to ${organization.name}.`);
};

migrate()
  .catch((error) => {
    console.error("Orphan staff migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });

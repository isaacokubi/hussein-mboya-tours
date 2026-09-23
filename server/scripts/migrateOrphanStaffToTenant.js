import * as firestore from "../config/firestore.js";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";
import Staff from "../models/Staff.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config({ path: "./server/.env" });
dotenv.config();

const tenantId = String(process.env.TENANT_ID || "").trim();
const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();
const tenantName = String(process.env.TENANT_NAME || "").trim();
const firebaseProjectId = String(process.env.FIREBASE_PROJECT_ID || "").trim();

const migrate = async () => {
  if (!tenantId && !tenantSlug && !tenantName) {
    throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running this migration.");
  }
  if (!firebaseProjectId) {
    throw new Error("FIREBASE_PROJECT_ID is not configured. Put it in server/.env or export it before running the migration.");
  }

  await firestore.connectFirestore();

  let organization;
  if (tenantId) {
    organization = await Organization.findById(tenantId).lean();
  } else if (tenantSlug) {
    organization = await Organization.findOne({ slug: tenantSlug }).lean();
  } else {
    const organizations = await Organization.find({ name: tenantName }).lean();
    if (organizations.length > 1) {
      throw new Error(`Multiple tenant organizations found with name "${tenantName}". Use TENANT_ID or TENANT_SLUG instead.`);
    }
    organization = organizations[0];
  }

  if (!organization) throw new Error("Tenant organization was not found.");

  const orphanFilter = { $or: [{ tenantId: { $exists: false } }, { tenantId: null }] };
  const orphanCount = await Staff.countDocuments(orphanFilter);

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
    () => Staff.updateMany(orphanFilter, { $set: { tenantId: organization._id } }),
  );

  console.log(`Assigned ${result.modifiedCount} orphan staff record(s) to ${organization.name}.`);
};

migrate()
  .catch((error) => {
    console.error("Orphan staff migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await firestore.connection.close().catch(() => {});
  });

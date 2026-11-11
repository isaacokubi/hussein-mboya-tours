/**
 * Purpose: migrate Orphan Staff To Tenant operational script. Main declarations: migrate.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config({ path: "./server/.env" });
// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare tenantId for use by the surrounding module or function.
const tenantId = String(process.env.TENANT_ID || "").trim();
// Declare tenantSlug for use by the surrounding module or function.
const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();
// Declare tenantName for use by the surrounding module or function.
const tenantName = String(process.env.TENANT_NAME || "").trim();
// Declare mongoUri for use by the surrounding module or function.
const mongoUri = String(process.env.MONGODB_URI || "").trim();

// Declare migrate for use by the surrounding module or function.
const migrate = async () => {
  // Check the condition (!tenantId && !tenantSlug && !tenantName) and run the matching branch.
  if (!tenantId && !tenantSlug && !tenantName) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running this migration.");
  }

  // Check the condition (!mongoUri) and run the matching branch.
  if (!mongoUri) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("MONGODB_URI is not configured. Put it in server/.env or export MONGODB_URI before running the migration.");
  }

  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(mongoUri);

  // Declare organization for use by the surrounding module or function.
  let organization;

  // Check the condition (tenantId) and run the matching branch.
  if (tenantId) {
    // Perform the side effect or state update expressed on the following line.
    organization = await Organization.findById(tenantId).lean();
  } else if (tenantSlug) {
    // Perform the side effect or state update expressed on the following line.
    organization = await Organization.findOne({ slug: tenantSlug }).lean();
  } else {
    // Declare organizations for use by the surrounding module or function.
    const organizations = await Organization.find({ name: tenantName }).lean();
    // Check the condition (organizations.length > 1) and run the matching branch.
    if (organizations.length > 1) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(`Multiple tenant organizations found with name "${tenantName}". Use TENANT_ID or TENANT_SLUG instead.`);
    }
    // Perform the side effect or state update expressed on the following line.
    organization = organizations[0];
  }

  // Check the condition (!organization) and run the matching branch.
  if (!organization) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Tenant organization was not found.");
  }

  // Declare orphanFilter for use by the surrounding module or function.
  const orphanFilter = {
    $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
  };
  // Declare orphanCount for use by the surrounding module or function.
  const orphanCount = await Staff.collection.countDocuments(orphanFilter);

  // Check the condition (orphanCount === 0) and run the matching branch.
  if (orphanCount === 0) {
    // Perform the side effect or state update expressed on the following line.
    console.log(`No orphan staff records found for tenant ${organization.name}.`);
    // Return the result to the caller.
    return;
  }

  // Check the condition (String(process.env.CONFIRM_ORPHAN_STAFF_MIGRATION).toLowerCase() !== ") and run the matching branch.
  if (String(process.env.CONFIRM_ORPHAN_STAFF_MIGRATION).toLowerCase() !== "true") {
    // Perform the side effect or state update expressed on the following line.
    console.log(`Found ${orphanCount} orphan staff record(s).`);
    // Perform the side effect or state update expressed on the following line.
    console.log("No records were changed. Set CONFIRM_ORPHAN_STAFF_MIGRATION=true to assign them to the selected tenant.");
    // Return the result to the caller.
    return;
  }

  // Declare result for use by the surrounding module or function.
  const result = await runWithTenant(
    { tenantId: organization._id, tenant: organization },
    () =>
      Staff.collection.updateMany(orphanFilter, {
        $set: { tenantId: organization._id },
      }),
  );

  // Perform the side effect or state update expressed on the following line.
  console.log(`Assigned ${result.modifiedCount} orphan staff record(s) to ${organization.name}.`);
};

// Perform the side effect or state update expressed on the following line.
migrate()
  .catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("Orphan staff migration failed:", error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  })
  .finally(async () => {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  });

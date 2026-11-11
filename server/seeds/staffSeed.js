/**
 * Purpose: staff Seed database seed module. Main declarations: seedStaff.
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

// Declare staffMembers for use by the surrounding module or function.
const staffMembers = [
  { name: "System Admin", email: "hussein.mboya@coherenttours.com", phone: "+254733439362", position: "tour_manager", role: "manager", status: "active", availability: "available", employeeNumber: "EMP001" },
  { name: "Isaac Ogubi", email: "isaac.ogubi@coherenttours.com", phone: "+254700000001", position: "guide", role: "guide", status: "active", availability: "available", employeeNumber: "EMP002" },
  { name: "Amina Ali", email: "amina.ali@coherenttours.com", phone: "+254700000002", position: "support", role: "support", status: "active", availability: "available", employeeNumber: "EMP003" },
  { name: "Daniel Kiptoo", email: "daniel.kiptoo@coherenttours.com", phone: "+254700000003", position: "admin", role: "admin", status: "active", availability: "available", employeeNumber: "EMP004" },
  { name: "Joseph Kamau", email: "joseph.kamau@coherenttours.com", phone: "+254700000004", position: "driver", role: "driver", status: "active", availability: "available", employeeNumber: "EMP005" },
];

// Declare seedStaff for use by the surrounding module or function.
const seedStaff = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare requestedTenantId for use by the surrounding module or function.
    const requestedTenantId = String(process.env.TENANT_ID || "").trim();
    // Declare requestedTenantSlug for use by the surrounding module or function.
    const requestedTenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();
    // Declare requestedTenantName for use by the surrounding module or function.
    const requestedTenantName = String(process.env.TENANT_NAME || "").trim();

    // Check the condition (!requestedTenantId && !requestedTenantSlug && !requestedTenantName) and run the matching branch.
    if (!requestedTenantId && !requestedTenantSlug && !requestedTenantName) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running the staff seed.");
    }

    // Declare mongoUri for use by the surrounding module or function.
    const mongoUri = String(process.env.MONGODB_URI || "").trim();
    // Check the condition (!mongoUri) and run the matching branch.
    if (!mongoUri) throw new Error("MONGODB_URI is missing in server/.env");
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(mongoUri);

    // Declare organization for use by the surrounding module or function.
    let organization;
    // Check the condition (requestedTenantId) and run the matching branch.
    if (requestedTenantId) organization = await Organization.findById(requestedTenantId).lean();
    else if (requestedTenantSlug) organization = await Organization.findOne({ slug: requestedTenantSlug }).lean();
    else organization = await Organization.findOne({ name: requestedTenantName }).lean();

    // Check the condition (!organization) and run the matching branch.
    if (!organization) throw new Error("Tenant organization was not found.");

    // Declare staff for use by the surrounding module or function.
    const staff = await runWithTenant(
      { tenantId: organization._id, tenant: organization },
      async () => {
        // Declare results for use by the surrounding module or function.
        const results = [];
        // Repeat the enclosed work for each required iteration.
        for (const member of staffMembers) {
          // Perform the side effect or state update expressed on the following line.
          results.push(
            await Staff.findOneAndUpdate(
              { email: member.email },
              { $set: { ...member, tenantId: organization._id } },
              { upsert: true, new: true, setDefaultsOnInsert: true },
            ).lean(),
          );
        }
        // Return the value of results to the caller.
        return results;
      },
    );

    // Perform the side effect or state update expressed on the following line.
    console.log(`${staff.length} staff records synced for ${organization.name}`);
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Staff seed failed:", error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  }
};

// Perform the side effect or state update expressed on the following line.
seedStaff();

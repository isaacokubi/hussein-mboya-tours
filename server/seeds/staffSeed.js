import mongoose from "mongoose";
import dotenv from "dotenv";

import Organization from "../models/Organization.js";
import Staff from "../models/Staff.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config({ path: "./server/.env" });
dotenv.config();

const staffMembers = [
  { name: "System Admin", email: "hussein.mboya@coherenttours.com", phone: "+254733439362", position: "tour_manager", role: "manager", status: "active", availability: "available", employeeNumber: "EMP001" },
  { name: "Isaac Ogubi", email: "isaac.ogubi@coherenttours.com", phone: "+254700000001", position: "guide", role: "guide", status: "active", availability: "available", employeeNumber: "EMP002" },
  { name: "Amina Ali", email: "amina.ali@coherenttours.com", phone: "+254700000002", position: "support", role: "support", status: "active", availability: "available", employeeNumber: "EMP003" },
  { name: "Daniel Kiptoo", email: "daniel.kiptoo@coherenttours.com", phone: "+254700000003", position: "admin", role: "admin", status: "active", availability: "available", employeeNumber: "EMP004" },
  { name: "Joseph Kamau", email: "joseph.kamau@coherenttours.com", phone: "+254700000004", position: "driver", role: "driver", status: "active", availability: "available", employeeNumber: "EMP005" },
];

const seedStaff = async () => {
  try {
    const requestedTenantId = String(process.env.TENANT_ID || "").trim();
    const requestedTenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();
    const requestedTenantName = String(process.env.TENANT_NAME || "").trim();

    if (!requestedTenantId && !requestedTenantSlug && !requestedTenantName) {
      throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running the staff seed.");
    }

    const mongoUri = String(process.env.MONGODB_URI || "").trim();
    if (!mongoUri) throw new Error("MONGODB_URI is missing in server/.env");
    await mongoose.connect(mongoUri);

    let organization;
    if (requestedTenantId) organization = await Organization.findById(requestedTenantId).lean();
    else if (requestedTenantSlug) organization = await Organization.findOne({ slug: requestedTenantSlug }).lean();
    else organization = await Organization.findOne({ name: requestedTenantName }).lean();

    if (!organization) throw new Error("Tenant organization was not found.");

    const staff = await runWithTenant(
      { tenantId: organization._id, tenant: organization },
      async () => {
        const results = [];
        for (const member of staffMembers) {
          results.push(
            await Staff.findOneAndUpdate(
              { email: member.email },
              { $set: { ...member, tenantId: organization._id } },
              { upsert: true, new: true, setDefaultsOnInsert: true },
            ).lean(),
          );
        }
        return results;
      },
    );

    console.log(`${staff.length} staff records synced for ${organization.name}`);
  } catch (error) {
    console.error("Staff seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
};

seedStaff();

/**
 * Purpose: admin Seed database seed module. Main declarations: createAdmin.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";
// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";

// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/Permission.js so this module can use its exported dependencies.
import Permission from "../models/Permission.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare createAdmin for use by the surrounding module or function.
const createAdmin = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = String(process.env.TENANT_ID || "").trim();
    // Declare tenantSlug for use by the surrounding module or function.
    const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();
    // Check the condition (!tenantId && !tenantSlug) and run the matching branch.
    if (!tenantId && !tenantSlug) throw new Error("Set TENANT_ID or TENANT_SLUG before running the admin seed.");

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(process.env.MONGODB_URI);

    // Declare organization for use by the surrounding module or function.
    const organization = tenantId
      ? await Organization.findById(tenantId).lean()
      : await Organization.findOne({ slug: tenantSlug }).lean();
    // Check the condition (!organization) and run the matching branch.
    if (!organization) throw new Error("Tenant organization was not found.");

    // Declare permissionNames for use by the surrounding module or function.
    const permissionNames = ["manage_users", "manage_tours", "manage_destinations", "manage_bookings", "manage_payments", "view_reports"];
    // Declare permissionIds for use by the surrounding module or function.
    const permissionIds = [];
    // Repeat the enclosed work for each required iteration.
    for (const name of permissionNames) {
      // Declare permission for use by the surrounding module or function.
      let permission = await Permission.findOne({ name });
      // Check the condition (!permission) and run the matching branch.
      if (!permission) permission = await Permission.create({ name, label: name.replace(/_/g, " "), module: name.split(/[._]/)[0], category: "other" });
      // Perform the side effect or state update expressed on the following line.
      permissionIds.push(permission._id);
    }

    // Declare adminRole for use by the surrounding module or function.
    let adminRole = await Role.findOne({ name: "admin" });
    // Check the condition (!adminRole) and run the matching branch.
    if (!adminRole) {
      // Perform the side effect or state update expressed on the following line.
      adminRole = await Role.create({ name: "admin", displayName: "Admin", permissions: permissionIds });
    } else {
      // Perform the side effect or state update expressed on the following line.
      adminRole.permissions = permissionIds;
      // Perform the side effect or state update expressed on the following line.
      await adminRole.save();
    }

    // Declare email for use by the surrounding module or function.
    const email = String(process.env.SEED_ADMIN_EMAIL || "admin@husseinmboyatours.com").trim().toLowerCase();
    // Declare password for use by the surrounding module or function.
    const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString("base64url");

    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ tenantId: organization._id, tenant: organization }, async () => {
      // Perform the side effect or state update expressed on the following line.
      await User.findOneAndUpdate(
        { email },
        {
          $set: { name: "Platform Admin", role: "admin", roleId: adminRole._id, legacyRole: "admin", status: "active", isVerified: true },
          $setOnInsert: { email, password, tenantId: organization._id },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    });

    // Perform the side effect or state update expressed on the following line.
    console.log(`Admin account synced for ${organization.name}`);
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Admin seed failed:", error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  }
};

// Perform the side effect or state update expressed on the following line.
createAdmin();

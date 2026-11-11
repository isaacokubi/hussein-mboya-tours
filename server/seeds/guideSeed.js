/**
 * Purpose: guide Seed database seed module. Main declarations: seedGuides.
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
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config({ path: "./server/.env" });
// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare guides for use by the surrounding module or function.
const guides = [
  { name: "John Safari Guide", email: "john.guide@husseinmboyatours.com", phone: "+254700111222" },
  { name: "Mary Wildlife Expert", email: "mary.guide@husseinmboyatours.com", phone: "+254700333444" },
  { name: "David Mountain Guide", email: "david.guide@husseinmboyatours.com", phone: "+254700555666" },
];

// Declare seedGuides for use by the surrounding module or function.
const seedGuides = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = String(process.env.TENANT_ID || "").trim();
    // Declare tenantSlug for use by the surrounding module or function.
    const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();
    // Declare tenantName for use by the surrounding module or function.
    const tenantName = String(process.env.TENANT_NAME || "").trim();
    // Check the condition (!tenantId && !tenantSlug && !tenantName) and run the matching branch.
    if (!tenantId && !tenantSlug && !tenantName) throw new Error("Set TENANT_ID, TENANT_SLUG, or TENANT_NAME before running the guide seed.");
    // Declare mongoUri for use by the surrounding module or function.
    const mongoUri = String(process.env.MONGODB_URI || "").trim();
    // Check the condition (!mongoUri) and run the matching branch.
    if (!mongoUri) throw new Error("MONGODB_URI is missing in server/.env");

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(mongoUri);

    // Declare organization for use by the surrounding module or function.
    let organization;
    // Check the condition (tenantId) and run the matching branch.
    if (tenantId) organization = await Organization.findById(tenantId).lean();
    else if (tenantSlug) organization = await Organization.findOne({ slug: tenantSlug }).lean();
    else organization = await Organization.findOne({ name: tenantName }).lean();
    // Check the condition (!organization) and run the matching branch.
    if (!organization) throw new Error("Tenant organization was not found.");

    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ tenantId: organization._id, tenant: organization }, async () => {
      // Permission and Role are tenant-scoped models, so they must be queried
      // only after entering the tenant context.
      // Declare permissionNames for use by the surrounding module or function.
      const permissionNames = ["view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"];
      // Declare permissionIds for use by the surrounding module or function.
      const permissionIds = [];
      // Repeat the enclosed work for each required iteration.
      for (const name of permissionNames) {
        // Declare permission for use by the surrounding module or function.
        let permission = await Permission.findOne({ name });
        // Check the condition (!permission) and run the matching branch.
        if (!permission) {
          // Perform the side effect or state update expressed on the following line.
          permission = await Permission.create({
            name,
            label: name.replace(/_/g, " "),
            module: "guide",
            category: "other",
            tenantId: organization._id,
          });
        }
        // Perform the side effect or state update expressed on the following line.
        permissionIds.push(permission._id);
      }

      // Declare guideRole for use by the surrounding module or function.
      let guideRole = await Role.findOne({ name: "guide" });
      // Check the condition (!guideRole) and run the matching branch.
      if (!guideRole) {
        // Perform the side effect or state update expressed on the following line.
        guideRole = await Role.create({
          name: "guide",
          displayName: "Tour Guide",
          description: "Tour guide access",
          permissions: permissionIds,
          isSystem: true,
          status: "active",
          level: 2,
          tenantId: organization._id,
        });
      } else {
        // Perform the side effect or state update expressed on the following line.
        guideRole.permissions = permissionIds;
        // Perform the side effect or state update expressed on the following line.
        guideRole.status = "active";
        // Perform the side effect or state update expressed on the following line.
        guideRole.tenantId = organization._id;
        // Perform the side effect or state update expressed on the following line.
        await guideRole.save();
      }

      // Repeat the enclosed work for each required iteration.
      for (const item of guides) {
        // Declare password for use by the surrounding module or function.
        const password = process.env.SEED_GUIDE_PASSWORD || crypto.randomBytes(18).toString("base64url");
        // Declare user for use by the surrounding module or function.
        const user = await User.findOneAndUpdate(
          { email: item.email },
          {
            $set: {
              name: item.name,
              phone: item.phone,
              role: "tour_guide",
              roleId: guideRole._id,
              legacyRole: "tour_guide",
              status: "active",
              isVerified: true,
            },
            // tenantPlugin automatically adds tenantId to $setOnInsert and
            // enforces the current tenant for both new and existing records.
            $setOnInsert: { email: item.email, password },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        // Perform the side effect or state update expressed on the following line.
        await Staff.findOneAndUpdate(
          { $or: [{ user: user._id }, { email: user.email }] },
          {
            $set: {
              user: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone || "",
              position: "guide",
              role: "guide",
              status: "active",
              isActive: true,
              isDeleted: false,
              availability: "available",
              tenantId: organization._id,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
    });

    // Perform the side effect or state update expressed on the following line.
    console.log(`Guides synced for ${organization.name}`);
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Tour guide seed failed:", error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  }
};

// Perform the side effect or state update expressed on the following line.
seedGuides();

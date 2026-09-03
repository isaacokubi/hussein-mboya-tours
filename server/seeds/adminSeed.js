import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const createAdmin = async () => {
  try {
    const tenantId = String(process.env.TENANT_ID || "").trim();
    const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();
    if (!tenantId && !tenantSlug) throw new Error("Set TENANT_ID or TENANT_SLUG before running the admin seed.");

    await mongoose.connect(process.env.MONGODB_URI);

    const organization = tenantId
      ? await Organization.findById(tenantId).lean()
      : await Organization.findOne({ slug: tenantSlug }).lean();
    if (!organization) throw new Error("Tenant organization was not found.");

    const permissionNames = ["manage_users", "manage_tours", "manage_destinations", "manage_bookings", "manage_payments", "view_reports"];
    const permissionIds = [];
    for (const name of permissionNames) {
      let permission = await Permission.findOne({ name });
      if (!permission) permission = await Permission.create({ name, label: name.replace(/_/g, " "), module: name.split(/[._]/)[0], category: "other" });
      permissionIds.push(permission._id);
    }

    let adminRole = await Role.findOne({ name: "admin" });
    if (!adminRole) {
      adminRole = await Role.create({ name: "admin", displayName: "Admin", permissions: permissionIds });
    } else {
      adminRole.permissions = permissionIds;
      await adminRole.save();
    }

    const email = String(process.env.SEED_ADMIN_EMAIL || "admin@husseinmboyatours.com").trim().toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString("base64url");

    await runWithTenant({ tenantId: organization._id, tenant: organization }, async () => {
      await User.findOneAndUpdate(
        { email },
        {
          $set: { name: "Platform Admin", role: "admin", roleId: adminRole._id, legacyRole: "admin", status: "active", isVerified: true },
          $setOnInsert: { email, password, tenantId: organization._id },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    });

    console.log(`Admin account synced for ${organization.name}`);
  } catch (error) {
    console.error("Admin seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
};

createAdmin();

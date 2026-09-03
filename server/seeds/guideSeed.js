import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import Staff from "../models/Staff.js";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const guides = [
  { name: "John Safari Guide", email: "john.guide@husseinmboyatours.com", phone: "+254700111222" },
  { name: "Mary Wildlife Expert", email: "mary.guide@husseinmboyatours.com", phone: "+254700333444" },
  { name: "David Mountain Guide", email: "david.guide@husseinmboyatours.com", phone: "+254700555666" },
];

const seedGuides = async () => {
  try {
    const tenantId = String(process.env.TENANT_ID || "").trim();
    const tenantSlug = String(process.env.TENANT_SLUG || "").trim().toLowerCase();
    if (!tenantId && !tenantSlug) throw new Error("Set TENANT_ID or TENANT_SLUG before running the guide seed.");
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");

    await mongoose.connect(process.env.MONGODB_URI);

    const organization = tenantId
      ? await Organization.findById(tenantId).lean()
      : await Organization.findOne({ slug: tenantSlug }).lean();
    if (!organization) throw new Error("Tenant organization was not found.");

    const permissionNames = ["view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"];
    const permissionIds = [];
    for (const name of permissionNames) {
      let permission = await Permission.findOne({ name });
      if (!permission) permission = await Permission.create({ name, label: name.replace(/_/g, " "), module: "guide", category: "other" });
      permissionIds.push(permission._id);
    }

    let guideRole = await Role.findOne({ name: "guide" });
    if (!guideRole) guideRole = await Role.create({ name: "guide", displayName: "Tour Guide", description: "Tour guide access", permissions: permissionIds, isSystem: true, status: "active", level: 2 });
    else {
      guideRole.permissions = permissionIds;
      guideRole.status = "active";
      await guideRole.save();
    }

    await runWithTenant({ tenantId: organization._id, tenant: organization }, async () => {
      for (const item of guides) {
        const password = process.env.SEED_GUIDE_PASSWORD || crypto.randomBytes(18).toString("base64url");
        const user = await User.findOneAndUpdate(
          { email: item.email },
          {
            $set: { name: item.name, phone: item.phone, role: "tour_guide", roleId: guideRole._id, legacyRole: "tour_guide", status: "active", isVerified: true },
            $setOnInsert: { email: item.email, password, tenantId: organization._id },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        await Staff.findOneAndUpdate(
          { $or: [{ user: user._id }, { email: user.email }] },
          { $set: { user: user._id, name: user.name, email: user.email, phone: user.phone || "", position: "guide", role: "guide", status: "active", isActive: true, isDeleted: false, availability: "available" }, $setOnInsert: { tenantId: organization._id } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
    });

    console.log(`Guides synced for ${organization.name}`);
  } catch (error) {
    console.error("Tour guide seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
};

seedGuides();

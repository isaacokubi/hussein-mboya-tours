import { backgroundTenantFilter } from "../tenancy/backgroundTenantFilter.js";
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";

const normalize = (value) => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

const aliases = {
  superadmin: ["super_admin", "super_admin"],
  super_admin: ["super_admin", "super_admin"],
  administrator: ["admin", "administrator"],
  admin: ["admin", "administrator"],
  manager: ["manager", "tour_manager", "tourmanager"],
  tour_manager: ["tour_manager", "tourmanager", "manager"],
  tourmanager: ["tour_manager", "tourmanager", "manager"],
  agent: ["agent", "travel_agent"],
  travel_agent: ["travel_agent", "agent"],
  guide: ["guide", "tour_guide", "tourguide"],
  tour_guide: ["tour_guide", "tourguide", "guide"],
  tourguide: ["tour_guide", "tourguide", "guide"],
  driver: ["driver"],
  customer: ["customer"],
};

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGO_URI or MONGODB_URI in server/.env");
  process.exit(1);
}

await mongoose.connect(mongoUri);

let repaired = 0;
let skipped = 0;

try {
  const roles = await Role.find(
backgroundTenantFilter({})
).select("_id name").lean();
  const roleByName = new Map(roles.map((role) => [normalize(role.name), role]));
  const users = await User.find(
backgroundTenantFilter({})
).select("role legacyRole roleId email");

  for (const user of users) {
    const primary = normalize(user.role) || normalize(user.legacyRole) || "customer";
    const candidates = aliases[primary] || [primary, normalize(user.legacyRole)];
    const target = candidates.map(normalize).map((name) => roleByName.get(name)).find(Boolean);

    if (!target) {
      skipped += 1;
      console.log(`Skipped ${user.email || user._id}: no matching Role document`);
      continue;
    }

    const currentRoleId = user.roleId ? String(user.roleId) : "";
    if (currentRoleId !== String(target._id)) {
      user.roleId = target._id;
      user.legacyRole = primary;
      user.role = primary;
      await user.save({ validateBeforeSave: false });
      repaired += 1;
      console.log(`Repaired ${user.email || user._id}: roleId -> ${target.name}`);
    }
  }

  console.log(`Role reference repair complete. Scanned: ${users.length}; repaired: ${repaired}; skipped: ${skipped}.`);
} finally {
  await mongoose.disconnect();
}

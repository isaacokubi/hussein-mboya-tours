import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import env from "../config/env.js";

const mongoUri =
  env.MONGODB_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (!mongoUri) {
  throw new Error("MONGODB_URI/DATABASE_URL is not configured.");
}

await mongoose.connect(mongoUri);

console.log("\n============================================================");
console.log("RBAC USER ROLE NORMALIZATION");
console.log("============================================================\n");

const roles = await Role.find({}).lean();

const roleMap = new Map();

for (const role of roles) {
  const name = String(role.name || "").trim().toLowerCase();

  if (name) {
    roleMap.set(name, role);
  }
}

const aliases = {
  admin: "admin",
  administrator: "admin",

  superadmin: "super_admin",
  super_admin: "super_admin",

  manager: "manager",
  tour_manager: "manager",
  tourmanager: "manager",

  agent: "agent",
  travel_agent: "agent",
  travelagent: "agent",

  guide: "tour_guide",
  tour_guide: "tour_guide",
  tourguide: "tour_guide",

  driver: "driver",

  customer: "customer",
  user: "customer",
};

const users = await User.find({}).select(
  "_id email role roleId legacyRole userRole tenantId"
);

let changed = 0;
let skipped = 0;

for (const user of users) {
  const currentRole =
    user.role?.name ||
    user.role ||
    user.legacyRole ||
    user.userRole ||
    "";

  const normalized = aliases[
    String(currentRole).trim().toLowerCase()
  ];

  if (!normalized) {
    console.log(
      `SKIP: ${user.email} -> unable to determine role`
    );
    skipped++;
    continue;
  }

  const targetRole = roleMap.get(normalized);

  if (!targetRole) {
    console.log(
      `SKIP: ${user.email} -> role '${normalized}' does not exist`
    );
    skipped++;
    continue;
  }

  const updates = {};

  if (String(user.roleId || "") !== String(targetRole._id)) {
    updates.roleId = targetRole._id;
  }

  /*
   * Keep the legacy role field synchronized for backwards compatibility.
   * The canonical DB role is roleId.
   */
  let legacyValue = normalized;

  if (normalized === "tour_guide") {
    legacyValue = "tour_guide";
  }

  if (normalized === "manager") {
    legacyValue = "tour_manager";
  }

  if (normalized === "super_admin") {
    legacyValue = "super_admin";
  }

  if (user.role !== legacyValue) {
    updates.role = legacyValue;
  }

  if (user.legacyRole !== legacyValue) {
    updates.legacyRole = legacyValue;
  }

  if (Object.keys(updates).length === 0) {
    console.log(`OK: ${user.email}`);
    continue;
  }

  await User.updateOne(
    { _id: user._id },
    { $set: updates }
  );

  changed++;

  console.log(
    `FIXED: ${user.email} -> ${normalized} | roleId=${targetRole._id}`
  );
}

console.log("\n============================================================");
console.log("NORMALIZATION SUMMARY");
console.log("============================================================");

console.log("Users:", users.length);
console.log("Changed:", changed);
console.log("Skipped:", skipped);

await mongoose.disconnect();

console.log("\nDone.");

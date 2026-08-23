import "dotenv/config";
import mongoose from "mongoose";

import SystemSetting from "../models/SystemSetting.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error(
    "ERROR: MONGODB_URI, MONGO_URI, or DATABASE_URL is not configured."
  );
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);

  console.log("");
  console.log("============================================================");
  console.log(" SETTINGS / RBAC AUDIT");
  console.log("============================================================");
  console.log("");

  /*
   * SYSTEM SETTINGS
   */

  const settings = await SystemSetting.find({})
    .select("_id key tenantId enabled")
    .lean();

  console.log("SYSTEM SETTINGS");
  console.log("---------------");
  console.log(`Total settings: ${settings.length}`);

  /*
   * ROLES
   */

  const roles = await Role.find({})
    .select("_id name enabled tenantId permissions")
    .lean();

  console.log("");
  console.log("ROLES");
  console.log("-----");
  console.log(`Total roles: ${roles.length}`);

  const roleNames = new Set(
    roles.map((r) =>
      String(r.name || "").trim().toLowerCase()
    )
  );

  for (const required of [
    "super_admin",
    "admin",
    "manager",
    "agent",
    "customer",
  ]) {
    console.log(
      `${required}: ${
        roleNames.has(required) ? "OK" : "MISSING"
      }`
    );
  }

  /*
   * PERMISSIONS
   */

  const permissions = await Permission.find({})
    .select("_id name enabled tenantId")
    .lean();

  console.log("");
  console.log("PERMISSIONS");
  console.log("-----------");
  console.log(`Total permissions: ${permissions.length}`);

  const permissionNames = new Set(
    permissions.map((p) =>
      String(p.name || "").trim().toLowerCase()
    )
  );

  const importantPermissions = [
    "user.manage",
    "roles.manage",
    "analytics.view",
    "system.security",
    "manage_tours",
    "manage_bookings",
    "view_customers",
    "view_reports",
  ];

  for (const permission of importantPermissions) {
    console.log(
      `${permission}: ${
        permissionNames.has(permission.toLowerCase())
          ? "OK"
          : "MISSING"
      }`
    );
  }

  console.log("");
  console.log("AUDIT COMPLETE.");

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});

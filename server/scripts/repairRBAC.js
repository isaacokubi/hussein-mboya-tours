import mongoose from "mongoose";
import dotenv from "dotenv";

import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";

dotenv.config();

const ROLE_DEFINITIONS = {
  super_admin: {
    displayName: "Super Admin",
    description: "Full system administration access",
    level: 200,
    isSystem: true,
    isDefault: false,
  },
  admin: {
    displayName: "Administrator",
    description: "Administrative access",
    level: 100,
    isSystem: true,
    isDefault: false,
  },
  tour_manager: {
    displayName: "Tour Manager",
    description: "Manages tours, bookings and tour operations",
    level: 70,
    isSystem: true,
    isDefault: false,
  },
  agent: {
    displayName: "Travel Agent",
    description: "Travel agent access",
    level: 50,
    isSystem: true,
    isDefault: false,
  },
  tour_guide: {
    displayName: "Tour Guide",
    description: "Tour guide access",
    level: 40,
    isSystem: true,
    isDefault: false,
  },
  driver: {
    displayName: "Driver",
    description: "Driver access",
    level: 30,
    isSystem: true,
    isDefault: false,
  },
  customer: {
    displayName: "Customer",
    description: "Customer access",
    level: 10,
    isSystem: true,
    isDefault: true,
  },
};

const ROLE_ALIASES = {
  superadmin: "super_admin",
  super_admin: "super_admin",
  guide: "tour_guide",
  tourguide: "tour_guide",
};

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from environment.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("\n========================================");
  console.log("      RBAC REPAIR STARTING");
  console.log("========================================\n");

  const roles = await Role.find().lean();

  console.log(`Found ${roles.length} existing role(s).\n`);

  let repaired = 0;
  let created = 0;

  // ------------------------------------------------------------
  // REPAIR EXISTING ROLES
  // ------------------------------------------------------------

  for (const role of roles) {
    const canonicalName =
      ROLE_ALIASES[role.name] || role.name;

    const definition =
      ROLE_DEFINITIONS[canonicalName];

    if (!definition) {
      const fallbackDisplayName =
        role.displayName ||
        String(role.name || "Role")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

      await Role.updateOne(
        { _id: role._id },
        {
          $set: {
            displayName: fallbackDisplayName,
            description: role.description || `${role.name} access`,
            status: role.status || "active",
            level:
              Number.isFinite(Number(role.level)) &&
              Number(role.level) >= 1
                ? Number(role.level)
                : 1,
          },
        }
      );

      console.log(
        `✓ Repaired role: ${role.name} → ${fallbackDisplayName}`
      );

      repaired++;
      continue;
    }

    const update = {
      displayName: definition.displayName,
      description:
        role.description || definition.description,
      status: role.status || "active",
      level:
        Number.isFinite(Number(role.level)) &&
        Number(role.level) >= 1
          ? Number(role.level)
          : definition.level,
      isSystem:
        typeof role.isSystem === "boolean"
          ? role.isSystem
          : definition.isSystem,
      isDefault:
        typeof role.isDefault === "boolean"
          ? role.isDefault
          : definition.isDefault,
    };

    await Role.updateOne(
      { _id: role._id },
      { $set: update }
    );

    console.log(
      `✓ Repaired role: ${role.name} → ${definition.displayName}`
    );

    repaired++;
  }

  // ------------------------------------------------------------
  // CREATE ANY MISSING CANONICAL ROLES
  // ------------------------------------------------------------

  for (const [name, definition] of Object.entries(ROLE_DEFINITIONS)) {
    let role = await Role.findOne({ name });

    // Handle existing legacy aliases
    if (!role) {
      const alias = Object.entries(ROLE_ALIASES)
        .find(([, canonical]) => canonical === name);

      if (alias) {
        role = await Role.findOne({ name: alias[0] });

        if (role) {
          console.log(
            `ℹ Found legacy role "${alias[0]}" for "${name}" — preserving it.`
          );
        }
      }
    }

    if (!role) {
      role = await Role.create({
        name,
        displayName: definition.displayName,
        description: definition.description,
        permissions: [],
        isSystem: definition.isSystem,
        status: "active",
        level: definition.level,
        isDefault: definition.isDefault,
      });

      console.log(
        `+ Created missing canonical role: ${name}`
      );

      created++;
    }
  }

  // ------------------------------------------------------------
  // REPAIR USERS USING LEGACY ROLE NAMES
  // ------------------------------------------------------------

  const legacyUsers = await User.find({
    role: {
      $in: [
        "superadmin",
        "guide",
        "tourguide",
      ],
    },
  });

  for (const user of legacyUsers) {
    const canonicalName =
      ROLE_ALIASES[user.role];

    if (!canonicalName) continue;

    const canonicalRole = await Role.findOne({
      name: canonicalName,
    });

    if (!canonicalRole) continue;

    user.roleId = canonicalRole._id;
    user.role = canonicalName;
    user.legacyRole = canonicalName;

    await user.save();

    console.log(
      `✓ Repaired user role: ${user.email} → ${canonicalName}`
    );
  }

  // ------------------------------------------------------------
  // FINAL VALIDATION
  // ------------------------------------------------------------

  console.log("\n========================================");
  console.log("       FINAL ROLE VALIDATION");
  console.log("========================================\n");

  const finalRoles = await Role.find()
    .select("_id name displayName description level status isSystem isDefault")
    .sort({ level: -1 })
    .lean();

  for (const role of finalRoles) {
    console.log(
      `${role.name.padEnd(15)} | ` +
      `${String(role.displayName).padEnd(20)} | ` +
      `level=${role.level} | ` +
      `status=${role.status}`
    );
  }

  const invalidRoles = finalRoles.filter(
    (role) =>
      !role.displayName ||
      !String(role.displayName).trim()
  );

  console.log("\n========================================");

  if (invalidRoles.length) {
    console.error(
      `❌ ${invalidRoles.length} role(s) still have invalid displayName values.`
    );

    for (const role of invalidRoles) {
      console.error(`   - ${role.name}`);
    }

    process.exitCode = 1;
  } else {
    console.log("✅ ALL ROLES HAVE VALID displayName VALUES");
    console.log(`✅ Repaired: ${repaired}`);
    console.log(`✅ Created: ${created}`);
  }

  console.log("========================================\n");

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("\n❌ RBAC REPAIR FAILED");
  console.error(error);

  await mongoose.disconnect().catch(() => {});

  process.exit(1);
});

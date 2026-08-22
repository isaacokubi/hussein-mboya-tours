import { mergeTenantFilter } from "../tenancy/context.js";
import Role from "../models/Role.js";
import User from "../models/User.js";

const SYSTEM_ROLES = [
  {
    name: "super_admin",
    displayName: "Super Admin",
    description: "Platform-level Super Admin with full platform access.",
    level: 100,
    isDefault: false,
  },
  {
    name: "admin",
    displayName: "Admin",
    description: "Tenant administrator.",
    level: 90,
    isDefault: false,
  },
  {
    name: "manager",
    displayName: "Tour Manager",
    description: "Manages tours and operations.",
    level: 70,
    isDefault: false,
  },
  {
    name: "tour_guide",
    displayName: "Tour Guide",
    description: "Manages assigned tours and guests.",
    level: 50,
    isDefault: false,
  },
  {
    name: "driver",
    displayName: "Driver",
    description: "Manages assigned transport duties.",
    level: 40,
    isDefault: false,
  },
  {
    name: "agent",
    displayName: "Travel Agent",
    description: "Manages agent bookings and customers.",
    level: 40,
    isDefault: false,
  },
  {
    name: "customer",
    displayName: "Customer",
    description: "Default customer account.",
    level: 10,
    isDefault: true,
  },
];

export async function ensureSystemRoles() {
  const roles = {};

  for (const definition of SYSTEM_ROLES) {
    let role = await Role.findOne({
      name: definition.name,
      isSystem: true,
    });

    if (!role) {
      role = await Role.create({
        ...definition,
        permissions: [],
        isSystem: true,
        status: "active",
      });
    } else {
      role.displayName = definition.displayName;
      role.description = definition.description;
      role.level = definition.level;
      role.isDefault = definition.isDefault;
      role.isSystem = true;
      role.status = "active";

      await role.save();
    }

    roles[definition.name] = role;
  }

  return roles;
}

export async function countSuperAdmins() {
  return User.countDocuments({
    $or: [
      { role: "superadmin" },
      { role: "super_admin" },
      { legacyRole: "superadmin" },
      { legacyRole: "super_admin" },
    ],
  });
}

export default {
  ensureSystemRoles,
  countSuperAdmins,
};

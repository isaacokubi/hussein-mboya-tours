import Role from "../models/Role.js";

const roles = [
  { name: "super_admin", displayName: "Super Admin", level: 100, isSystem: true },
  { name: "admin", displayName: "Admin", level: 90, isSystem: true },
  { name: "tour_manager", displayName: "Tour Manager", level: 70, isSystem: true },
  { name: "agent", displayName: "Travel Agent", level: 50, isSystem: true },
  { name: "tour_guide", displayName: "Tour Guide", level: 40, isSystem: true },
  { name: "driver", displayName: "Driver", level: 30, isSystem: true },
  { name: "customer", displayName: "Customer", level: 10, isSystem: true, isDefault: true },
];

const seedRoles = async () => {
  try {
    for (const role of roles) {
      await Role.findOneAndUpdate(
        { name: role.name },
        {
          $set: {
            ...role,
            status: "active",
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log(`✅ ${roles.length} canonical roles seeded successfully`);
  } catch (error) {
    console.error("❌ Role Seeder Error:", error.message);
    throw error;
  }
};

export default seedRoles;

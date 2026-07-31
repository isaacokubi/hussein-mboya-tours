import Role from "../models/Role.js";

const roles = [
  { name: "admin" },
  { name: "customer" },
  { name: "agent" },
  { name: "manager" },
  { name: "guide" }
];

const seedRoles = async () => {
  try {
    await Promise.all(
      roles.map((role) =>
        Role.findOneAndUpdate(
          { name: role.name },
          { $set: role },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        )
      )
    );

    console.log(`✅ ${roles.length} roles seeded successfully`);
  } catch (error) {
    console.error("❌ Role Seeder Error:", error.message);
    throw error;
  }
};

export default seedRoles;
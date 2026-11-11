/**
 * Purpose: role Seed database seed module. Main declarations: seedRoles.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Role from "../models/Role.js";

// Declare roles for use by the surrounding module or function.
const roles = [
  { name: "super_admin", displayName: "Super Admin", level: 100, isSystem: true },
  { name: "admin", displayName: "Admin", level: 90, isSystem: true },
  { name: "tour_manager", displayName: "Tour Manager", level: 70, isSystem: true },
  { name: "agent", displayName: "Travel Agent", level: 50, isSystem: true },
  { name: "tour_guide", displayName: "Tour Guide", level: 40, isSystem: true },
  { name: "driver", displayName: "Driver", level: 30, isSystem: true },
  { name: "customer", displayName: "Customer", level: 10, isSystem: true, isDefault: true },
];

// Declare seedRoles for use by the surrounding module or function.
const seedRoles = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Repeat the enclosed work for each required iteration.
    for (const role of roles) {
      // Perform the side effect or state update expressed on the following line.
      await Role.findOneAndUpdate(
        { name: role.name },
        { $set: { ...role, status: "active" } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    }

    // Legacy aliases are intentionally not seeded. Existing data is normalized
    // by the dedicated migration before production deployment.
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("❌ Role Seeder Error:", error.message);
    // Stop the current operation by raising the value of error.
    throw error;
  }
};

export default seedRoles;

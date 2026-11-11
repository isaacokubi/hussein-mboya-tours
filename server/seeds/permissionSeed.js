/**
 * Purpose: permission Seed database seed module. Main declarations: seedTourGuidePermissions.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Permission from "../models/Permission.js";

// Declare tourGuidePermissions for use by the surrounding module or function.
const tourGuidePermissions = [
  {
    name: "view_assigned_tours",
    description: "Allow guide to view assigned tours",
  },
  {
    name: "view_tour_guests",
    description: "Allow guide to view guests in assigned tours",
  },
  {
    name: "update_tour_status",
    description: "Allow guide to update tour progress/status",
  },
  {
    name: "submit_tour_report",
    description: "Allow guide to submit tour reports",
  },
];

// Declare seedTourGuidePermissions for use by the surrounding module or function.
const seedTourGuidePermissions = async () => {
  // Declare operations for use by the surrounding module or function.
  const operations = tourGuidePermissions.map((permission) => ({
    updateOne: {
      filter: { name: permission.name },
      update: {
        $set: {
          ...permission,
          label: permission.label || permission.name.replace(/_/g, " "),
          module: permission.module || permission.name.split(/[._]/)[0],
          category: permission.category || "other",
          isActive: true,
        },
      },
      upsert: true,
    },
  }));

  // Perform the side effect or state update expressed on the following line.
  await Permission.bulkWrite(operations);

  // Perform the side effect or state update expressed on the following line.
  console.log(
    `✅ Seeded ${tourGuidePermissions.length} tour guide permissions`
  );
};

export default seedTourGuidePermissions;

import Permission from "../models/Permission.js";

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

const seedTourGuidePermissions = async () => {
  const operations = tourGuidePermissions.map((permission) => ({
    updateOne: {
      filter: { name: permission.name },
      update: { $set: permission },
      upsert: true,
    },
  }));

  await Permission.bulkWrite(operations);

  console.log(
    `✅ Seeded ${tourGuidePermissions.length} tour guide permissions`
  );
};

export default seedTourGuidePermissions;
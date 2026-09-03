import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";

import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import { runWithTenant } from "../tenancy/context.js";
import seedGlobalTours from "../seeds/globalToursTestSeed.js";

dotenv.config();

const KEEP_COLLECTIONS = new Set(["destinations", "tours"]);
const RESET_CONFIRMATION = "YES";

const roles = [
  { name: "super_admin", displayName: "Super Admin", level: 100, isSystem: true },
  { name: "admin", displayName: "Admin", level: 90, isSystem: true },
  { name: "tour_manager", displayName: "Tour Manager", level: 70, isSystem: true },
  { name: "agent", displayName: "Travel Agent", level: 50, isSystem: true },
  { name: "tour_guide", displayName: "Tour Guide", level: 40, isSystem: true },
  { name: "driver", displayName: "Driver", level: 30, isSystem: true },
  { name: "customer", displayName: "Customer", level: 10, isSystem: true, isDefault: true },
];

const permissions = [
  ["manage_users", "Manage users"],
  ["manage_tours", "Manage tours"],
  ["manage_destinations", "Manage destinations"],
  ["manage_bookings", "Manage bookings"],
  ["manage_payments", "Manage payments"],
  ["view_reports", "View reports"],
  ["create_tours", "Create tours"],
  ["update_tours", "Update tours"],
  ["assign_guides", "Assign guides"],
  ["view_customers", "View customers"],
  ["manage_itineraries", "Manage itineraries"],
  ["view_assigned_tours", "View assigned tours"],
  ["view_tour_guests", "View guests in assigned tours"],
  ["update_tour_status", "Update tour progress/status"],
  ["submit_tour_report", "Submit tour reports"],
];

async function seedCleanAccessData() {
  const permissionDocs = [];

  for (const [name, description] of permissions) {
    const permission = await Permission.findOneAndUpdate(
      { name },
      {
        $set: {
          name,
          description,
          label: name.replace(/_/g, " "),
          module: name.split(/[._]/)[0],
          category: "other",
          isActive: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    permissionDocs.push(permission);
  }

  const adminPermissionIds = permissionDocs
    .filter((permission) => [
      "manage_users",
      "manage_tours",
      "manage_destinations",
      "manage_bookings",
      "manage_payments",
      "view_reports",
    ].includes(permission.name))
    .map((permission) => permission._id);

  const roleDocs = {};
  for (const role of roles) {
    roleDocs[role.name] = await Role.findOneAndUpdate(
      { name: role.name },
      { $set: { ...role, status: "active" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  roleDocs.admin.permissions = adminPermissionIds;
  await roleDocs.admin.save();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@globaltours.co.ke";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      "SEED_ADMIN_PASSWORD is required. Set it in server/.env before running the reset."
    );
  }

  await User.findOneAndUpdate(
    { email: adminEmail.toLowerCase() },
    {
      $set: {
        name: "Global Tours Admin",
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: "admin",
        roleId: roleDocs.admin._id,
        legacyRole: "admin",
        status: "active",
        isVerified: true,
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Clean access data seeded: ${adminEmail}`);
}

async function resetDatabase() {
  if (process.env.CONFIRM_RESET !== RESET_CONFIRMATION) {
    throw new Error(
      `Destructive reset blocked. Re-run with CONFIRM_RESET=${RESET_CONFIRMATION}.`
    );
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const beforeDestinations = await Destination.countDocuments().catch(() => 0);
  const beforeTours = await Tour.countDocuments().catch(() => 0);

  const collections = await mongoose.connection.db.listCollections().toArray();
  let dropped = 0;

  for (const collection of collections) {
    if (KEEP_COLLECTIONS.has(collection.name)) continue;
    await mongoose.connection.db.dropCollection(collection.name);
    dropped += 1;
  }

  console.log(`Database reset complete: dropped ${dropped} non-tour collections.`);
  console.log(`Preserved collections: ${[...KEEP_COLLECTIONS].join(", ")}.`);
  console.log(`Before reset: ${beforeDestinations} destinations, ${beforeTours} tours.`);

  // Rebuild only the current Global Tours catalogue and clean system access data.
  await runWithTenant(
    { role: "super_admin", bypass: true, tenantId: null, tenant: null },
    async () => {
      await seedGlobalTours();
      await seedCleanAccessData();
    }
  );

  const destinationCount = await Destination.countDocuments();
  const tourCount = await Tour.countDocuments();

  console.log("Global Tours database reset and reseed complete.");
  console.log(`Destinations: ${destinationCount}`);
  console.log(`Tours: ${tourCount}`);
  console.log("Bookings: 0");
  console.log("Payments: 0");
  console.log("Other transactional/test data: 0");
}

resetDatabase()
  .catch((error) => {
    console.error("Global Tours database reset failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });

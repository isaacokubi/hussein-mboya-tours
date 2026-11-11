/**
 * Purpose: reset Global Tours Data operational script. Main declarations: seedCleanAccessData, resetDatabase.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import dotenv from "dotenv";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load node:child_process so this module can use its exported dependencies.
import { execFile } from "node:child_process";
// Load node:util so this module can use its exported dependencies.
import { promisify } from "node:util";

// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/Permission.js so this module can use its exported dependencies.
import Permission from "../models/Permission.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare execFileAsync for use by the surrounding module or function.
const execFileAsync = promisify(execFile);
// Declare KEEP_COLLECTIONS for use by the surrounding module or function.
const KEEP_COLLECTIONS = new Set(["destinations", "tours"]);
// Declare RESET_CONFIRMATION for use by the surrounding module or function.
const RESET_CONFIRMATION = "YES";

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

// Declare permissions for use by the surrounding module or function.
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

// Define seedCleanAccessData; its parameters and body implement this operation.
async function seedCleanAccessData() {
  // Declare permissionDocs for use by the surrounding module or function.
  const permissionDocs = [];

  // Repeat the enclosed work for each required iteration.
  for (const [name, description] of permissions) {
    // Declare permission for use by the surrounding module or function.
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
    // Perform the side effect or state update expressed on the following line.
    permissionDocs.push(permission);
  }

  // Declare adminPermissionIds for use by the surrounding module or function.
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

  // Declare roleDocs for use by the surrounding module or function.
  const roleDocs = {};
  // Repeat the enclosed work for each required iteration.
  for (const role of roles) {
    // Perform the side effect or state update expressed on the following line.
    roleDocs[role.name] = await Role.findOneAndUpdate(
      { name: role.name },
      { $set: { ...role, status: "active" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Perform the side effect or state update expressed on the following line.
  roleDocs.admin.permissions = adminPermissionIds;
  // Perform the side effect or state update expressed on the following line.
  await roleDocs.admin.save();

  // Declare adminEmail for use by the surrounding module or function.
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@globaltours.co.ke").toLowerCase();
  // Declare adminPassword for use by the surrounding module or function.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  // Check the condition (!adminPassword) and run the matching branch.
  if (!adminPassword) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(
      "SEED_ADMIN_PASSWORD is required. Set it in server/.env before running the reset."
    );
  }

  // Perform the side effect or state update expressed on the following line.
  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        name: "Global Tours Admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        roleId: roleDocs.admin._id,
        legacyRole: "admin",
        status: "active",
        isVerified: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Perform the side effect or state update expressed on the following line.
  console.log(`Clean admin access seeded: ${adminEmail}`);
}

// Define resetDatabase; its parameters and body implement this operation.
async function resetDatabase() {
  // Check the condition (process.env.CONFIRM_RESET !== RESET_CONFIRMATION) and run the matching branch.
  if (process.env.CONFIRM_RESET !== RESET_CONFIRMATION) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(
      `Destructive reset blocked. Re-run with CONFIRM_RESET=${RESET_CONFIRMATION}.`
    );
  }

  // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
  if (!process.env.MONGODB_URI) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("MONGODB_URI is missing.");
  }

  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI);

  // Declare beforeDestinations for use by the surrounding module or function.
  const beforeDestinations = await Destination.countDocuments().catch(() => 0);
  // Declare beforeTours for use by the surrounding module or function.
  const beforeTours = await Tour.countDocuments().catch(() => 0);

  // Declare collections for use by the surrounding module or function.
  const collections = await mongoose.connection.db.listCollections().toArray();
  // Declare dropped for use by the surrounding module or function.
  let dropped = 0;

  // Repeat the enclosed work for each required iteration.
  for (const collection of collections) {
    // Check the condition (KEEP_COLLECTIONS.has(collection.name)) and run the matching branch.
    if (KEEP_COLLECTIONS.has(collection.name)) continue;
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.db.dropCollection(collection.name);
    // Perform the side effect or state update expressed on the following line.
    dropped += 1;
  }

  // Perform the side effect or state update expressed on the following line.
  console.log(`Database reset complete: dropped ${dropped} non-catalog collections.`);
  // Perform the side effect or state update expressed on the following line.
  console.log(`Kept: ${[...KEEP_COLLECTIONS].join(", ")}.`);
  // Perform the side effect or state update expressed on the following line.
  console.log(`Before reset: ${beforeDestinations} destinations, ${beforeTours} tours.`);

  // Perform the side effect or state update expressed on the following line.
  await mongoose.connection.close();

  // Rebuild the current Global Tours catalogue using the canonical seed.
  // Perform the side effect or state update expressed on the following line.
  await execFileAsync(process.execPath, ["seeds/globalToursTestSeed.js"], {
    cwd: process.cwd(),
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  });

  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI);
  // Perform the side effect or state update expressed on the following line.
  await seedCleanAccessData();

  // Declare destinationCount for use by the surrounding module or function.
  const destinationCount = await Destination.countDocuments();
  // Declare tourCount for use by the surrounding module or function.
  const tourCount = await Tour.countDocuments();

  // Perform the side effect or state update expressed on the following line.
  console.log("Global Tours clean reset and reseed complete.");
  // Perform the side effect or state update expressed on the following line.
  console.log(`Destinations: ${destinationCount}`);
  // Perform the side effect or state update expressed on the following line.
  console.log(`Tours: ${tourCount}`);
  // Perform the side effect or state update expressed on the following line.
  console.log("Bookings: 0");
  // Perform the side effect or state update expressed on the following line.
  console.log("Payments: 0");
  // Perform the side effect or state update expressed on the following line.
  console.log("Customers: 0");
  // Perform the side effect or state update expressed on the following line.
  console.log("Agents/Guides/Vehicles: 0");
  // Perform the side effect or state update expressed on the following line.
  console.log("Other transactional/test data: 0");
}

// Perform the side effect or state update expressed on the following line.
resetDatabase()
  .catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("Global Tours database reset failed:", error.message);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  })
  .finally(async () => {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  });

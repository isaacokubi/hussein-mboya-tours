import * as firestore from "../config/firestore.js";
import dotenv from "dotenv";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const CONFIRM = process.env.CONFIRM_DEMO_RESET;
if (CONFIRM !== "YES") throw new Error("Refusing demo reset. Set CONFIRM_DEMO_RESET=YES.");
if (!process.env.FIREBASE_PROJECT_ID) throw new Error("FIREBASE_PROJECT_ID is required.");

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const seededDestinationSlugs = [
  "tsavo-national-park", "lake-naivasha", "watamu", "mount-kenya",
  "samburu-national-reserve",
];

const seededTourTitles = [
  "Tsavo East Wildlife Explorer", "Tsavo West Rhino & Springs Safari",
  "Naivasha Lakeside Escape", "Hell's Gate Cycling Adventure",
  "Lake Naivasha & Crescent Island Safari", "Watamu Beach Retreat",
  "Watamu Marine Discovery", "Malindi & Watamu Coastal Escape",
  "Mount Kenya Highland Adventure", "Mount Kenya Sirimon Trek",
  "Mount Kenya Scenic Highlands", "Samburu Wildlife Discovery",
  "Samburu Cultural Safari", "Northern Kenya Photography Safari",
  "Tsavo Family Safari", "Tsavo Luxury Wilderness Escape",
  "Naivasha Romantic Getaway", "Watamu Honeymoon Paradise",
  "Mount Kenya Family Highlands", "Samburu Luxury Wilderness Experience",
];

const slugify = (value) => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const resetSyntheticCatalog = async () => {
  const tourSlugs = seededTourTitles.map(slugify);
  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    await Tour.deleteMany({ slug: { $in: tourSlugs } });
    await Destination.deleteMany({ slug: { $in: seededDestinationSlugs } });
  });
};

const runSeeder = (script, label) => {
  console.log("\n=== SEEDING " + label.toUpperCase() + " ===");
  execFileSync(process.execPath, [path.join(serverDir, script)], {
    cwd: serverDir,
    env: process.env,
    stdio: "inherit",
  });
};

const main = async () => {
  await firestore.connectFirestore?.();
  await resetSyntheticCatalog();

  runSeeder("seeds/globalToursTestSeed.js", "global tours catalog");
  runSeeder("seeds/ensureDashboardMasterData.js", "dashboard master data");
  runSeeder("seeds/financialDashboardSeedRunner.js", "accounting and finance");
  runSeeder("seeds/dashboardOperationalSeed.js", "operations and website integrations");
  runSeeder("seeds/hospitalityDeveloperSeed.js", "hospitality and airport transfers");

  console.log(JSON.stringify({
    success: true,
    message: "Firestore demo reset complete. Only the known synthetic Global Tours catalog was removed before Firestore-native seeders ran.",
    destructiveScope: "known synthetic Global Tours catalog only",
    organizationsPreserved: true,
    usersPreserved: true,
    bookingsPreserved: true,
    paymentsPreserved: true,
  }, null, 2));
};

main()
  .catch((error) => {
    console.error("DEMO RESET FAILED:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await firestore.connection.close().catch(() => {});
  });

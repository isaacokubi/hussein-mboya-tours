/**
 * Purpose: bootstrap First Super Admin operational script. Main declarations: ask, askSecret, envOrAsk.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "../tenancy/bootstrap.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load node:readline/promises so this module can use its exported dependencies.
import readline from "node:readline/promises";
// Load node:process so this module can use its exported dependencies.
import { stdin as input, stdout as output } from "node:process";
// Load ../config/env.js so this module can use its exported dependencies.
import env from "../config/env.js";
// Load ../services/onboardingService.js so this module can use its exported dependencies.
import { bootstrapFirstSuperAdmin } from "../services/onboardingService.js";

// Declare rl for use by the surrounding module or function.
const rl = readline.createInterface({ input, output });

// Declare ask for use by the surrounding module or function.
const ask = async (label, fallback = "") => {
  // Declare value for use by the surrounding module or function.
  const value = await rl.question(fallback ? `${label} [${fallback}]: ` : `${label}: `);
  // Return the result of String(value || fallback).trim() to the caller.
  return String(value || fallback).trim();
};

// Declare askSecret for use by the surrounding module or function.
const askSecret = async (label) => {
  // Declare value for use by the surrounding module or function.
  const value = await rl.question(`${label}: `, { hideEchoBack: true });
  // Return the result of String(value || "").trim() to the caller.
  return String(value || "").trim();
};

// Declare envOrAsk for use by the surrounding module or function.
const envOrAsk = async (key, label) => process.env[key]?.trim() || ask(label);

// Run this operation with a dedicated error-handling path for failures.
try {
  // Declare mongoUri for use by the surrounding module or function.
  const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI;
  // Check the condition (!mongoUri) and run the matching branch.
  if (!mongoUri) throw new Error("MONGODB_URI is not configured.");

  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(mongoUri);

  // Perform the side effect or state update expressed on the following line.
  console.log("\n============================================================");
  // Perform the side effect or state update expressed on the following line.
  console.log("GLOBAL TOURS — FIRST COMPANY ONBOARDING");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================================");
  // Perform the side effect or state update expressed on the following line.
  console.log("This command is one-time only. It creates the first platform");
  // Perform the side effect or state update expressed on the following line.
  console.log("SuperAdmin, the first company/tenant, and its first Admin.");
  // Perform the side effect or state update expressed on the following line.
  console.log("It refuses to run if a SuperAdmin already exists.\n");

  // Declare companyName for use by the surrounding module or function.
  const companyName = await envOrAsk("BOOTSTRAP_COMPANY_NAME", "Company name");
  // Declare companySlug for use by the surrounding module or function.
  const companySlug = await envOrAsk("BOOTSTRAP_COMPANY_SLUG", "Company slug");
  // Declare country for use by the surrounding module or function.
  const country = await envOrAsk("BOOTSTRAP_COUNTRY", "Country");
  // Declare timezone for use by the surrounding module or function.
  const timezone = await envOrAsk("BOOTSTRAP_TIMEZONE", "Timezone");
  // Declare currency for use by the surrounding module or function.
  const currency = await envOrAsk("BOOTSTRAP_CURRENCY", "Currency");

  // Perform the side effect or state update expressed on the following line.
  console.log("\n--- Platform SuperAdmin ---");
  // Declare superAdminName for use by the surrounding module or function.
  const superAdminName = await envOrAsk("BOOTSTRAP_SUPERADMIN_NAME", "SuperAdmin full name");
  // Declare superAdminEmail for use by the surrounding module or function.
  const superAdminEmail = await envOrAsk("BOOTSTRAP_SUPERADMIN_EMAIL", "SuperAdmin email");
  // Declare superAdminPhone for use by the surrounding module or function.
  const superAdminPhone = await envOrAsk("BOOTSTRAP_SUPERADMIN_PHONE", "SuperAdmin phone (10 digits)");
  // Declare superAdminPassword for use by the surrounding module or function.
  const superAdminPassword = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD || await askSecret("SuperAdmin password (12+ chars, uppercase + number)");

  // Perform the side effect or state update expressed on the following line.
  console.log("\n--- First Company Admin ---");
  // Declare adminName for use by the surrounding module or function.
  const adminName = await envOrAsk("BOOTSTRAP_ADMIN_NAME", "Admin full name");
  // Declare adminEmail for use by the surrounding module or function.
  const adminEmail = await envOrAsk("BOOTSTRAP_ADMIN_EMAIL", "Admin email");
  // Declare adminPhone for use by the surrounding module or function.
  const adminPhone = await envOrAsk("BOOTSTRAP_ADMIN_PHONE", "Admin phone (10 digits)");
  // Declare adminPassword for use by the surrounding module or function.
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || await askSecret("Admin password (12+ chars, uppercase + number)");

  // Declare result for use by the surrounding module or function.
  const result = await bootstrapFirstSuperAdmin({
    name: superAdminName,
    email: superAdminEmail,
    phone: superAdminPhone,
    password: superAdminPassword,
    companyName,
    companySlug,
    country,
    timezone,
    currency,
    admin: {
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password: adminPassword,
    },
  });

  // Perform the side effect or state update expressed on the following line.
  console.log("\n============================================================");
  // Perform the side effect or state update expressed on the following line.
  console.log("ONBOARDING COMPLETE");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================================");
  // Perform the side effect or state update expressed on the following line.
  console.log(`Company       : ${result.organization.name}`);
  // Perform the side effect or state update expressed on the following line.
  console.log(`Tenant ID     : ${result.organization._id}`);
  // Perform the side effect or state update expressed on the following line.
  console.log(`SuperAdmin    : ${result.superAdmin.email}`);
  // Perform the side effect or state update expressed on the following line.
  console.log(`First Admin   : ${result.admin.email}`);
  // Perform the side effect or state update expressed on the following line.
  console.log("\nNext steps:");
  // Perform the side effect or state update expressed on the following line.
  console.log("1. Sign in as the SuperAdmin.");
  // Perform the side effect or state update expressed on the following line.
  console.log("2. Change the SuperAdmin password if this was a temporary credential.");
  // Perform the side effect or state update expressed on the following line.
  console.log("3. Confirm the company appears in SuperAdmin → Tenants.");
  // Perform the side effect or state update expressed on the following line.
  console.log("4. Sign in as the first Admin and configure company settings.");
  // Perform the side effect or state update expressed on the following line.
  console.log("5. Create additional staff from the Admin dashboard.");
  // Perform the side effect or state update expressed on the following line.
  console.log("\nThe public registration endpoint can only create customer accounts.");
} catch (error) {
  // Perform the side effect or state update expressed on the following line.
  console.error(`\nONBOARDING FAILED: ${error.message}`);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
} finally {
  // Perform the side effect or state update expressed on the following line.
  rl.close();
  // Perform the side effect or state update expressed on the following line.
  await mongoose.disconnect().catch(() => {});
}

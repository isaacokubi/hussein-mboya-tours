import "../tenancy/bootstrap.js";
import mongoose from "mongoose";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import env from "../config/env.js";
import { bootstrapFirstSuperAdmin } from "../services/onboardingService.js";

const rl = readline.createInterface({ input, output });

const ask = async (label, fallback = "") => {
  const value = await rl.question(fallback ? `${label} [${fallback}]: ` : `${label}: `);
  return String(value || fallback).trim();
};

const askSecret = async (label) => {
  const value = await rl.question(`${label}: `, { hideEchoBack: true });
  return String(value || "").trim();
};

const envOrAsk = async (key, label) => process.env[key]?.trim() || ask(label);

try {
  const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGODB_URI/MONGO_URI is not configured.");

  await mongoose.connect(mongoUri);

  console.log("\n============================================================");
  console.log("HUSSEIN MBOYA TOURS — FIRST COMPANY ONBOARDING");
  console.log("============================================================");
  console.log("This command is one-time only. It creates the first platform");
  console.log("SuperAdmin, the first company/tenant, and its first Admin.");
  console.log("It refuses to run if a SuperAdmin already exists.\n");

  const companyName = await envOrAsk("BOOTSTRAP_COMPANY_NAME", "Company name");
  const companySlug = await envOrAsk("BOOTSTRAP_COMPANY_SLUG", "Company slug");
  const country = await envOrAsk("BOOTSTRAP_COUNTRY", "Country");
  const timezone = await envOrAsk("BOOTSTRAP_TIMEZONE", "Timezone");
  const currency = await envOrAsk("BOOTSTRAP_CURRENCY", "Currency");

  console.log("\n--- Platform SuperAdmin ---");
  const superAdminName = await envOrAsk("BOOTSTRAP_SUPERADMIN_NAME", "SuperAdmin full name");
  const superAdminEmail = await envOrAsk("BOOTSTRAP_SUPERADMIN_EMAIL", "SuperAdmin email");
  const superAdminPhone = await envOrAsk("BOOTSTRAP_SUPERADMIN_PHONE", "SuperAdmin phone (10 digits)");
  const superAdminPassword = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD || await askSecret("SuperAdmin password (12+ chars, uppercase + number)");

  console.log("\n--- First Company Admin ---");
  const adminName = await envOrAsk("BOOTSTRAP_ADMIN_NAME", "Admin full name");
  const adminEmail = await envOrAsk("BOOTSTRAP_ADMIN_EMAIL", "Admin email");
  const adminPhone = await envOrAsk("BOOTSTRAP_ADMIN_PHONE", "Admin phone (10 digits)");
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || await askSecret("Admin password (12+ chars, uppercase + number)");

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

  console.log("\n============================================================");
  console.log("ONBOARDING COMPLETE");
  console.log("============================================================");
  console.log(`Company       : ${result.organization.name}`);
  console.log(`Tenant ID     : ${result.organization._id}`);
  console.log(`SuperAdmin    : ${result.superAdmin.email}`);
  console.log(`First Admin   : ${result.admin.email}`);
  console.log("\nNext steps:");
  console.log("1. Sign in as the SuperAdmin.");
  console.log("2. Change the SuperAdmin password if this was a temporary credential.");
  console.log("3. Confirm the company appears in SuperAdmin → Tenants.");
  console.log("4. Sign in as the first Admin and configure company settings.");
  console.log("5. Create additional staff from the Admin dashboard.");
  console.log("\nThe public registration endpoint can only create customer accounts.");
} catch (error) {
  console.error(`\nONBOARDING FAILED: ${error.message}`);
  process.exitCode = 1;
} finally {
  rl.close();
  await mongoose.disconnect().catch(() => {});
}

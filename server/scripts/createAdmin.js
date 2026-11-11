/**
 * Purpose: create Admin operational script. Main declarations: ask, askSecret.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "../tenancy/bootstrap.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load node:readline/promises so this module can use its exported dependencies.
import readline from "node:readline/promises";
// Load node:process so this module can use its exported dependencies.
import { stdin as input, stdout as output } from "node:process";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../services/onboardingService.js so this module can use its exported dependencies.
import { ensureSystemRoles } from "../services/onboardingService.js";
// Load ../config/env.js so this module can use its exported dependencies.
import env from "../config/env.js";

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
const askSecret = async (label) => String(await rl.question(`${label}: `, { hideEchoBack: true }) || "").trim();

// Run this operation with a dedicated error-handling path for failures.
try {
  // Declare mongoUri for use by the surrounding module or function.
  const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI;
  // Check the condition (!mongoUri) and run the matching branch.
  if (!mongoUri) throw new Error("MONGODB_URI is not configured.");
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(mongoUri);

  // Declare tenantId for use by the surrounding module or function.
  const tenantId = process.env.ADMIN_TENANT_ID || process.argv[2] || await ask("Company/Tenant ID");
  // Declare name for use by the surrounding module or function.
  const name = process.env.ADMIN_NAME || process.argv[3] || await ask("Admin full name");
  // Declare email for use by the surrounding module or function.
  const email = String(process.env.ADMIN_EMAIL || process.argv[4] || await ask("Admin email")).trim().toLowerCase();
  // Declare phone for use by the surrounding module or function.
  const phone = String(process.env.ADMIN_PHONE || process.argv[5] || await ask("Admin phone (10 digits)")).trim();
  // Declare password for use by the surrounding module or function.
  const password = process.env.ADMIN_PASSWORD || await askSecret("Admin password (12+ chars, uppercase + number)");

  // Check the condition (!mongoose.Types.ObjectId.isValid(tenantId)) and run the matching branch.
  if (!mongoose.Types.ObjectId.isValid(tenantId)) throw new Error("Company/Tenant ID is invalid.");
  // Check the condition (!name) and run the matching branch.
  if (!name) throw new Error("Admin name is required.");
  // Check the condition (!/^\S+@\S+\.\S+$/.test(email)) and run the matching branch.
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Admin email is invalid.");
  // Check the condition (!/^\d{10}$/.test(phone)) and run the matching branch.
  if (!/^\d{10}$/.test(phone)) throw new Error("Admin phone must contain exactly 10 digits.");
  // Check the condition (password.length < 12 || !/[A-Z]/.test(password) || !/\d/.test(password) and run the matching branch.
  if (password.length < 12 || !/[A-Z]/.test(password) || !/\d/.test(password)) throw new Error("Admin password must be at least 12 characters and include an uppercase letter and a number.");

  // Declare organization for use by the surrounding module or function.
  const organization = await runWithTenant({ bypass: true }, () => Organization.findById(tenantId).lean());
  // Check the condition (!organization) and run the matching branch.
  if (!organization) throw new Error("Company/Tenant not found.");
  // Check the condition (organization.status === "cancelled") and run the matching branch.
  if (organization.status === "cancelled") throw new Error("Cannot create an Admin for a cancelled company.");
  // Check the condition (await runWithTenant({ bypass: true }, () => User.exists({ email }))) and run the matching branch.
  if (await runWithTenant({ bypass: true }, () => User.exists({ email }))) throw new Error("A user with this email already exists.");

  // Declare { admin: role } for use by the surrounding module or function.
  const { admin: role } = await ensureSystemRoles();
  // Declare user for use by the surrounding module or function.
  const user = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.create({
    name: name.trim(), email, phone, password, role: "admin", legacyRole: "admin", roleId: role._id,
    status: "active", isVerified: true,
  }));

  // Perform the side effect or state update expressed on the following line.
  console.log(`Admin created successfully: ${user.email}`);
  // Perform the side effect or state update expressed on the following line.
  console.log(`Tenant: ${organization.name} (${organization._id})`);
} catch (error) {
  // Perform the side effect or state update expressed on the following line.
  console.error(`CREATE ADMIN FAILED: ${error.message}`);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
} finally {
  // Perform the side effect or state update expressed on the following line.
  rl.close();
  // Perform the side effect or state update expressed on the following line.
  await mongoose.disconnect().catch(() => {});
}

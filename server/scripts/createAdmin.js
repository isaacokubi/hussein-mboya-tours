import "../tenancy/bootstrap.js";
import mongoose from "mongoose";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { runWithTenant } from "../tenancy/context.js";
import { ensureSystemRoles } from "../services/onboardingService.js";
import env from "../config/env.js";

const rl = readline.createInterface({ input, output });
const ask = async (label, fallback = "") => {
  const value = await rl.question(fallback ? `${label} [${fallback}]: ` : `${label}: `);
  return String(value || fallback).trim();
};
const askSecret = async (label) => String(await rl.question(`${label}: `, { hideEchoBack: true }) || "").trim();

try {
  const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGODB_URI/MONGO_URI is not configured.");
  await mongoose.connect(mongoUri);

  const tenantId = process.env.ADMIN_TENANT_ID || process.argv[2] || await ask("Company/Tenant ID");
  const name = process.env.ADMIN_NAME || process.argv[3] || await ask("Admin full name");
  const email = String(process.env.ADMIN_EMAIL || process.argv[4] || await ask("Admin email")).trim().toLowerCase();
  const phone = String(process.env.ADMIN_PHONE || process.argv[5] || await ask("Admin phone (10 digits)")).trim();
  const password = process.env.ADMIN_PASSWORD || await askSecret("Admin password (12+ chars, uppercase + number)");

  if (!mongoose.Types.ObjectId.isValid(tenantId)) throw new Error("Company/Tenant ID is invalid.");
  if (!name) throw new Error("Admin name is required.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Admin email is invalid.");
  if (!/^\d{10}$/.test(phone)) throw new Error("Admin phone must contain exactly 10 digits.");
  if (password.length < 12 || !/[A-Z]/.test(password) || !/\d/.test(password)) throw new Error("Admin password must be at least 12 characters and include an uppercase letter and a number.");

  const organization = await runWithTenant({ bypass: true }, () => Organization.findById(tenantId).lean());
  if (!organization) throw new Error("Company/Tenant not found.");
  if (organization.status === "cancelled") throw new Error("Cannot create an Admin for a cancelled company.");
  if (await runWithTenant({ bypass: true }, () => User.exists({ email }))) throw new Error("A user with this email already exists.");

  const { admin: role } = await ensureSystemRoles();
  const user = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.create({
    name: name.trim(), email, phone, password, role: "admin", legacyRole: "admin", roleId: role._id,
    status: "active", isVerified: true,
  }));

  console.log(`Admin created successfully: ${user.email}`);
  console.log(`Tenant: ${organization.name} (${organization._id})`);
} catch (error) {
  console.error(`CREATE ADMIN FAILED: ${error.message}`);
  process.exitCode = 1;
} finally {
  rl.close();
  await mongoose.disconnect().catch(() => {});
}

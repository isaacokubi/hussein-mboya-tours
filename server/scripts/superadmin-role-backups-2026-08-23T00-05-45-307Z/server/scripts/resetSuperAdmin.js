import "../tenancy/bootstrap.js";
import mongoose from "mongoose";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import User from "../models/User.js";
import env from "../config/env.js";
import { ensureSystemRoles } from "../services/onboardingService.js";
import { runWithTenant } from "../tenancy/context.js";

const rl = readline.createInterface({ input, output });
const ask = async (label) => String(await rl.question(`${label}: `) || "").trim();
const askSecret = async (label) => String(await rl.question(`${label}: `, { hideEchoBack: true }) || "").trim();

try {
  if (String(process.env.RESET_SUPERADMIN_CONFIRM || "") !== "RESET_SUPERADMIN") {
    throw new Error("Recovery is locked. Set RESET_SUPERADMIN_CONFIRM=RESET_SUPERADMIN to explicitly authorize a SuperAdmin password reset.");
  }

  const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGODB_URI/MONGO_URI is not configured.");
  await mongoose.connect(mongoUri);

  const email = String(process.env.SUPERADMIN_EMAIL || await ask("Existing SuperAdmin email")).trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || await askSecret("New SuperAdmin password (12+ chars, uppercase + number)");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("SuperAdmin email is invalid.");
  if (password.length < 12 || !/[A-Z]/.test(password) || !/\d/.test(password)) throw new Error("Password must be at least 12 characters and include an uppercase letter and a number.");

  const { superadmin } = await ensureSystemRoles();
  const user = await runWithTenant({ bypass: true }, () => User.findOne({ email, role: { $in: ["superadmin", "super_admin"] } }).select("+password"));
  if (!user) throw new Error("Existing SuperAdmin was not found. Use the one-time bootstrap command for a brand-new installation.");

  user.password = password;
  user.role = "superadmin";
  user.legacyRole = "superadmin";
  user.roleId = superadmin._id;
  user.status = "active";
  user.isVerified = true;
  user.loginAttempts = 0;
  user.lockUntil = null;
  await runWithTenant({ bypass: true }, () => user.save());

  console.log(`SuperAdmin password reset successfully for ${user.email}.`);
} catch (error) {
  console.error(`SUPERADMIN RECOVERY FAILED: ${error.message}`);
  process.exitCode = 1;
} finally {
  rl.close();
  await mongoose.disconnect().catch(() => {});
}

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { TEST_LOGIN_EMAILS } from "../seeds/completeTestDemoSeed.js";

const CONFIRM = process.env.CONFIRM_DEMO_PASSWORD_RESET;
const DEMO_PASSWORD = String(process.env.SEED_DEMO_PASSWORD || "Password@2785");

function validatePassword(password) {
  if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new Error("SEED_DEMO_PASSWORD must be at least 12 characters and contain upper/lowercase letters and a number.");
  }
}

async function main() {
  if (CONFIRM !== "YES") throw new Error("Refusing password reset. Set CONFIRM_DEMO_PASSWORD_RESET=YES.");
  validatePassword(DEMO_PASSWORD);
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, maxPoolSize: 1 });
  try {
    const users = mongoose.connection.db.collection("users");
    const accounts = await users.find({ email: { $in: TEST_LOGIN_EMAILS } }, {
      projection: { _id: 1, email: 1, role: 1, tenantId: 1, status: 1 },
    }).sort({ email: 1 }).toArray();
    if (accounts.length !== TEST_LOGIN_EMAILS.length) {
      throw new Error(`Safety check failed: expected ${TEST_LOGIN_EMAILS.length} seeded demo users, found ${accounts.length}. No changes made.`);
    }
    const found = new Set(accounts.map(({ email }) => email));
    const missing = TEST_LOGIN_EMAILS.filter((email) => !found.has(email));
    if (missing.length) throw new Error(`Safety check failed: missing seeded accounts: ${missing.join(", ")}. No changes made.`);
    const platform = accounts.filter((user) => user.email === "superadmin1@husseinmboya.com");
    const tenantUsers = accounts.filter((user) => user.email !== "superadmin1@husseinmboya.com");
    if (platform.length !== 1 || platform[0].tenantId != null || !["super_admin", "superadmin"].includes(platform[0].role)) {
      throw new Error("Safety check failed: platform owner must be a tenantless Super Admin. No changes made.");
    }
    if (tenantUsers.length !== 36 || tenantUsers.some((user) => !user.tenantId || user.status !== "active")) {
      throw new Error("Safety check failed: expected 36 active tenant users with tenant assignments. No changes made.");
    }
    const tenants = new Set(tenantUsers.map((user) => String(user.tenantId)));
    if (tenants.size !== 3) throw new Error(`Safety check failed: expected users in 3 tenants, found ${tenants.size}. No changes made.`);

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const result = await users.updateMany({ _id: { $in: accounts.map((user) => user._id) }, email: { $in: TEST_LOGIN_EMAILS } }, {
      $set: { password: passwordHash, loginAttempts: 0, lockUntil: null },
    });
    if (result.matchedCount !== TEST_LOGIN_EMAILS.length || result.modifiedCount !== TEST_LOGIN_EMAILS.length) {
      throw new Error(`Safety verification failed: matched=${result.matchedCount}, modified=${result.modifiedCount}.`);
    }

    const verified = await users.find({ email: { $in: TEST_LOGIN_EMAILS } }, { projection: { email: 1, password: 1 } }).toArray();
    if (verified.length !== TEST_LOGIN_EMAILS.length || verified.some((user) => !bcrypt.compareSync(DEMO_PASSWORD, user.password))) {
      throw new Error("Post-update verification failed: at least one seeded account does not match the requested password.");
    }
    console.log(JSON.stringify({ status: "passed", updatedAccounts: result.modifiedCount, tenantAccounts: tenantUsers.length, platformAccounts: platform.length, tenantCount: tenants.size, passwordHashVerified: true }));
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main().catch((error) => {
  console.error(`DEMO PASSWORD RESET FAILED: ${error.message}`);
  process.exitCode = 1;
});

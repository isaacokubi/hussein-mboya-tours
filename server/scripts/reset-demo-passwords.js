/**
 * Purpose: reset demo passwords operational script. Main declarations: validatePassword, main.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load bcryptjs so this module can use its exported dependencies.
import bcrypt from "bcryptjs";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../seeds/completeTestDemoSeed.js so this module can use its exported dependencies.
import { TEST_LOGIN_EMAILS } from "../seeds/completeTestDemoSeed.js";

// Declare CONFIRM for use by the surrounding module or function.
const CONFIRM = process.env.CONFIRM_DEMO_PASSWORD_RESET;
// Declare DEMO_PASSWORD for use by the surrounding module or function.
const DEMO_PASSWORD = String(process.env.SEED_DEMO_PASSWORD || "");
// Declare PLATFORM_EMAIL for use by the surrounding module or function.
const PLATFORM_EMAIL = "superadmin1@husseinmboya.com";
// Declare TENANT_DOMAINS for use by the surrounding module or function.
const TENANT_DOMAINS = { "hussein-mboya": "husseinmboya.com", "amani-trails": "amanitrails.com", "demo-safari": "demosafari.com" };

// Define validatePassword; its parameters and body implement this operation.
function validatePassword(password) {
  // Check the condition (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(passw) and run the matching branch.
  if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("SEED_DEMO_PASSWORD must be at least 12 characters and contain upper/lowercase letters and a number.");
  }
}

// Define main; its parameters and body implement this operation.
async function main() {
  // Check the condition (CONFIRM !== "YES") and run the matching branch.
  if (CONFIRM !== "YES") throw new Error("Refusing password reset. Set CONFIRM_DEMO_PASSWORD_RESET=YES.");
  // Perform the side effect or state update expressed on the following line.
  validatePassword(DEMO_PASSWORD);
  // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
  // Declare target for use by the surrounding module or function.
  const target = new URL(process.env.MONGODB_URI);
  // Check the condition (target.hostname.toLowerCase() !== "cluster0.cdtxzts.mongodb.net" || de) and run the matching branch.
  if (target.hostname.toLowerCase() !== "cluster0.cdtxzts.mongodb.net" || decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "") !== "husseindb") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Safety check failed: password reset requires the configured demo Atlas host and husseindb database.");
  }

  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, maxPoolSize: 1 });
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare users for use by the surrounding module or function.
    const users = mongoose.connection.db.collection("users");
    // Declare accounts for use by the surrounding module or function.
    const accounts = await users.find({ email: { $in: TEST_LOGIN_EMAILS } }, {
      projection: { _id: 1, email: 1, role: 1, tenantId: 1, status: 1 },
    }).sort({ email: 1 }).toArray();
    // Check the condition (accounts.length !== TEST_LOGIN_EMAILS.length) and run the matching branch.
    if (accounts.length !== TEST_LOGIN_EMAILS.length) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(`Safety check failed: expected ${TEST_LOGIN_EMAILS.length} seeded demo users, found ${accounts.length}. No changes made.`);
    }
    // Declare found for use by the surrounding module or function.
    const found = new Set(accounts.map(({ email }) => email));
    // Check the condition (found.size !== TEST_LOGIN_EMAILS.length) and run the matching branch.
    if (found.size !== TEST_LOGIN_EMAILS.length) throw new Error("Safety check failed: duplicate canonical demo login records were found. No changes made.");
    // Declare missing for use by the surrounding module or function.
    const missing = TEST_LOGIN_EMAILS.filter((email) => !found.has(email));
    // Check the condition (missing.length) and run the matching branch.
    if (missing.length) throw new Error(`Safety check failed: missing seeded accounts: ${missing.join(", ")}. No changes made.`);
    // Declare platform for use by the surrounding module or function.
    const platform = accounts.filter((user) => user.email === PLATFORM_EMAIL);
    // Declare tenantUsers for use by the surrounding module or function.
    const tenantUsers = accounts.filter((user) => user.email !== PLATFORM_EMAIL);
    // Check the condition (platform.length !== 1 || platform[0].tenantId != null || platform[0].r) and run the matching branch.
    if (platform.length !== 1 || platform[0].tenantId != null || platform[0].role !== "super_admin" || platform[0].status !== "active") {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Safety check failed: platform owner must be a tenantless Super Admin. No changes made.");
    }
    // Check the condition (tenantUsers.length !== 36 || tenantUsers.some((user) => !user.tenantId) and run the matching branch.
    if (tenantUsers.length !== 36 || tenantUsers.some((user) => !user.tenantId || user.status !== "active")) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Safety check failed: expected 36 active tenant users with tenant assignments. No changes made.");
    }
    // Declare tenants for use by the surrounding module or function.
    const tenants = new Set(tenantUsers.map((user) => String(user.tenantId)));
    // Check the condition (tenants.size !== 3) and run the matching branch.
    if (tenants.size !== 3) throw new Error(`Safety check failed: expected users in 3 tenants, found ${tenants.size}. No changes made.`);
    // Declare tenantDocs for use by the surrounding module or function.
    const tenantDocs = await Organization.find({ slug: { $in: Object.keys(TENANT_DOMAINS) } }).select("_id slug").lean();
    // Declare tenantIdBySlug for use by the surrounding module or function.
    const tenantIdBySlug = new Map(tenantDocs.map((tenant) => [tenant.slug, String(tenant._id)]));
    // Check the condition (tenantIdBySlug.size !== 3) and run the matching branch.
    if (tenantIdBySlug.size !== 3) throw new Error("Safety check failed: expected all 3 canonical demo tenants. No changes made.");
    // Repeat the enclosed work for each required iteration.
    for (const account of tenantUsers) {
      // Declare slug for use by the surrounding module or function.
      const slug = Object.entries(TENANT_DOMAINS).find(([, domain]) => account.email.endsWith(`@${domain}`))?.[0];
      // Declare local for use by the surrounding module or function.
      const local = account.email.split("@")[0];
      // Declare expectedRole for use by the surrounding module or function.
      const expectedRole = local === "admin1" ? "admin" : local === "tourmanager1" ? "tour_manager" : local.startsWith("agent") ? "agent" : local.startsWith("guide") ? "tour_guide" : local.startsWith("driver") ? "driver" : "customer";
      // Check the condition (!slug || String(account.tenantId) !== tenantIdBySlug.get(slug) || acco) and run the matching branch.
      if (!slug || String(account.tenantId) !== tenantIdBySlug.get(slug) || account.role !== expectedRole) {
        // Stop the current operation by raising a new Error instance.
        throw new Error("Safety check failed: a demo account has the wrong tenant or role. No changes made.");
      }
    }

    // Declare passwordHash for use by the surrounding module or function.
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    // Declare result for use by the surrounding module or function.
    const result = await users.updateMany({ _id: { $in: accounts.map((user) => user._id) }, email: { $in: TEST_LOGIN_EMAILS } }, {
      $set: { password: passwordHash, loginAttempts: 0, lockUntil: null },
    });
    // Check the condition (result.matchedCount !== TEST_LOGIN_EMAILS.length || result.modifiedCou) and run the matching branch.
    if (result.matchedCount !== TEST_LOGIN_EMAILS.length || result.modifiedCount !== TEST_LOGIN_EMAILS.length) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(`Safety verification failed: matched=${result.matchedCount}, modified=${result.modifiedCount}.`);
    }

    // Declare verified for use by the surrounding module or function.
    const verified = await users.find({ email: { $in: TEST_LOGIN_EMAILS } }, { projection: { email: 1, password: 1 } }).toArray();
    // Check the condition (verified.length !== TEST_LOGIN_EMAILS.length || verified.some((user) =) and run the matching branch.
    if (verified.length !== TEST_LOGIN_EMAILS.length || verified.some((user) => !bcrypt.compareSync(DEMO_PASSWORD, user.password))) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Post-update verification failed: at least one seeded account does not match the requested password.");
    }
    // Perform the side effect or state update expressed on the following line.
    console.log(JSON.stringify({ status: "passed", updatedAccounts: result.modifiedCount, tenantAccounts: tenantUsers.length, platformAccounts: platform.length, tenantCount: tenants.size, passwordHashVerified: true }));
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.disconnect().catch(() => {});
  }
}

// Perform the side effect or state update expressed on the following line.
main().catch((error) => {
  // Declare safeMessage for use by the surrounding module or function.
  const safeMessage = String(error?.message || "Password reset failed.").replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[MongoDB URI redacted]");
  // Perform the side effect or state update expressed on the following line.
  console.error(`DEMO PASSWORD RESET FAILED: ${safeMessage}`);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
});

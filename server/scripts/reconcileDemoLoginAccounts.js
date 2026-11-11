/**
 * Purpose: reconcile Demo Login Accounts operational script. Main declarations: assertTarget, validatePassword, emailFor, legacyEmailFor, roleForOldPlatform.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load bcryptjs so this module can use its exported dependencies.
import bcrypt from "bcryptjs";
// Load node:crypto so this module can use its exported dependencies.
import { randomBytes } from "node:crypto";
// Load node:url so this module can use its exported dependencies.
import { pathToFileURL } from "node:url";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare TENANTS for use by the surrounding module or function.
export const TENANTS = [
  { slug: "hussein-mboya", legacyDomain: "hussein-mboya.com", domain: "husseinmboya.com", label: "Hussein Mboya Tours" },
  { slug: "amani-trails", legacyDomain: "amani-trails.com", domain: "amanitrails.com", label: "Amani Trails Safaris" },
  { slug: "demo-safari", legacyDomain: "demo-safari.com", domain: "demosafari.com", label: "Demo Safari Adventures" },
];
// Declare ACCOUNT_SPECS for use by the surrounding module or function.
export const ACCOUNT_SPECS = [
  { legacyLocal: "admin", local: "admin1", role: "admin", title: "Administrator" },
  { legacyLocal: "manager", local: "tourmanager1", role: "tour_manager", title: "Tour Manager" },
  { legacyLocal: "agent", local: "agent1", role: "agent", title: "Travel Agent" },
  { legacyLocal: null, local: "agent2", role: "agent", title: "Travel Agent" },
  { legacyLocal: "guide1", local: "guide1", role: "tour_guide", title: "Tour Guide" },
  { legacyLocal: null, local: "guide2", role: "tour_guide", title: "Tour Guide" },
  { legacyLocal: "driver1", local: "driver1", role: "driver", title: "Driver" },
  { legacyLocal: null, local: "driver2", role: "driver", title: "Driver" },
  ...[1, 2, 3, 4].map((n) => ({ legacyLocal: `customer${n}`, local: `customer${n}`, role: "customer", title: "Customer" })),
];
// Declare PLATFORM_OLD for use by the surrounding module or function.
export const PLATFORM_OLD = "superadmin@hussein-mboya.com";
// Declare PLATFORM_NEW for use by the surrounding module or function.
export const PLATFORM_NEW = "superadmin1@husseinmboya.com";
// Declare platformRoleNames for use by the surrounding module or function.
const platformRoleNames = ["super_admin", "superadmin"];
// Declare isDryRun for use by the surrounding module or function.
const isDryRun = process.argv.includes("--dry-run");
// Declare expectedHost for use by the surrounding module or function.
const expectedHost = "cluster0.cdtxzts.mongodb.net";
// Declare expectedDatabase for use by the surrounding module or function.
const expectedDatabase = "husseindb";

// Define assertTarget; its parameters and body implement this operation.
function assertTarget() {
  // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
  // Declare target for use by the surrounding module or function.
  const target = new URL(process.env.MONGODB_URI);
  // Declare database for use by the surrounding module or function.
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  // Check the condition (target.hostname.toLowerCase() !== expectedHost || database !== expecte) and run the matching branch.
  if (target.hostname.toLowerCase() !== expectedHost || database !== expectedDatabase) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Refusing demo-account reconciliation: target must be the configured demo Atlas host and husseindb database.");
  }
  // Check the condition (process.env.NODE_ENV === "production") and run the matching branch.
  if (process.env.NODE_ENV === "production") throw new Error("Refusing demo-account reconciliation with NODE_ENV=production.");
  // Check the condition (process.env.ALLOW_ATLAS_DEMO_SEED !== "YES") and run the matching branch.
  if (process.env.ALLOW_ATLAS_DEMO_SEED !== "YES") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Set ALLOW_ATLAS_DEMO_SEED=YES to explicitly authorize the configured demo Atlas target.");
  }
  // Check the condition (!isDryRun && process.env.CONFIRM_DEMO_ACCOUNT_MIGRATION !== "YES") and run the matching branch.
  if (!isDryRun && process.env.CONFIRM_DEMO_ACCOUNT_MIGRATION !== "YES") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Set CONFIRM_DEMO_ACCOUNT_MIGRATION=YES to apply the account migration. Use --dry-run to preview.");
  }
}

// Define validatePassword; its parameters and body implement this operation.
function validatePassword(password) {
  // Check the condition (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(passw) and run the matching branch.
  if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("SEED_DEMO_PASSWORD must be at least 12 characters and contain uppercase, lowercase, and a number.");
  }
}

// Define emailFor; its parameters and body implement this operation.
export function emailFor(local, domain) { return `${local}@${domain}`; }
// Define legacyEmailFor; its parameters and body implement this operation.
function legacyEmailFor(local, domain) { return `${local}@${domain}`; }
// Define roleForOldPlatform; its parameters and body implement this operation.
function roleForOldPlatform(user) { return platformRoleNames.includes(String(user?.role || "").toLowerCase()); }
// Define generatedPhone; its parameters and body implement this operation.
function generatedPhone(index) { return String(7900000000 + index).slice(-10); }

// Define main; its parameters and body implement this operation.
async function main() {
  // Perform the side effect or state update expressed on the following line.
  assertTarget();
  // Declare password for use by the surrounding module or function.
  const password = String(process.env.SEED_DEMO_PASSWORD || "");
  // Check the condition (!isDryRun) and run the matching branch.
  if (!isDryRun) validatePassword(password);
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, maxPoolSize: 2 });
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare db for use by the surrounding module or function.
    const db = mongoose.connection.db;
    // Declare users for use by the surrounding module or function.
    const users = db.collection("users");
    // Declare organizations for use by the surrounding module or function.
    const organizations = db.collection("organizations");
    // Declare tenantDocs for use by the surrounding module or function.
    const tenantDocs = await organizations.find({ slug: { $in: TENANTS.map((tenant) => tenant.slug) } }).toArray();
    // Declare tenantBySlug for use by the surrounding module or function.
    const tenantBySlug = new Map(tenantDocs.map((tenant) => [tenant.slug, tenant]));
    // Check the condition (tenantBySlug.size !== TENANTS.length) and run the matching branch.
    if (tenantBySlug.size !== TENANTS.length) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(`Expected all 3 demo tenants; found ${tenantBySlug.size}. No changes made.`);
    }

    // Declare plan for use by the surrounding module or function.
    const plan = [];
    // Declare globalOld for use by the surrounding module or function.
    const globalOld = await users.findOne({ email: PLATFORM_OLD, tenantId: null });
    // Declare globalNew for use by the surrounding module or function.
    const globalNew = await users.findOne({ email: PLATFORM_NEW, tenantId: null });
    // Check the condition (globalOld && globalNew && String(globalOld._id) !== String(globalNew._) and run the matching branch.
    if (globalOld && globalNew && String(globalOld._id) !== String(globalNew._id)) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Both legacy and canonical platform accounts exist with different IDs. Resolve this duplicate manually; no changes made.");
    }
    // Check the condition (globalNew && !roleForOldPlatform(globalNew)) and run the matching branch.
    if (globalNew && !roleForOldPlatform(globalNew)) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Canonical platform account has an unexpected role. No changes made.");
    }
    // Perform the side effect or state update expressed on the following line.
    plan.push({ action: globalOld && !globalNew ? "rename-global-platform-account" : globalNew ? "verify-global-platform-account" : "create-global-platform-account", from: globalOld ? PLATFORM_OLD : null, to: PLATFORM_NEW });

    // Declare tenantPlans for use by the surrounding module or function.
    const tenantPlans = [];
    // Repeat the enclosed work for each required iteration.
    for (const tenantSpec of TENANTS) {
      // Declare tenant for use by the surrounding module or function.
      const tenant = tenantBySlug.get(tenantSpec.slug);
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = tenant._id;
      // Declare roleDocs for use by the surrounding module or function.
      const roleDocs = await db.collection("roles").find({ tenantId }).toArray();
      // Declare roleByName for use by the surrounding module or function.
      const roleByName = new Map(roleDocs.map((role) => [String(role.name).toLowerCase(), role]));
      // Repeat the enclosed work for each required iteration.
      for (const roleName of ["admin", "tour_manager", "agent", "tour_guide", "driver", "customer"]) {
        // Check the condition (!roleByName.has(roleName)) and run the matching branch.
        if (!roleByName.has(roleName)) throw new Error(`Tenant ${tenantSpec.slug} is missing role ${roleName}. No changes made.`);
      }
      // Declare entries for use by the surrounding module or function.
      const entries = [];
      // Repeat the enclosed work for each required iteration.
      for (const spec of ACCOUNT_SPECS) {
        // Declare canonicalEmail for use by the surrounding module or function.
        const canonicalEmail = emailFor(spec.local, tenantSpec.domain);
        // Declare oldEmail for use by the surrounding module or function.
        const oldEmail = spec.legacyLocal ? legacyEmailFor(spec.legacyLocal, tenantSpec.legacyDomain) : null;
        // Declare canonical for use by the surrounding module or function.
        const canonical = await users.findOne({ tenantId, email: canonicalEmail });
        // Declare legacy for use by the surrounding module or function.
        const legacy = oldEmail ? await users.findOne({ tenantId, email: oldEmail }) : null;
        // Check the condition (canonical && legacy && String(canonical._id) !== String(legacy._id)) and run the matching branch.
        if (canonical && legacy && String(canonical._id) !== String(legacy._id)) {
          // Stop the current operation by raising a new Error instance.
          throw new Error(`Both legacy and canonical accounts exist for ${tenantSpec.slug}/${spec.local}; no changes made.`);
        }
        // Declare current for use by the surrounding module or function.
        const current = canonical || legacy;
        // Check the condition (current && String(current.tenantId) !== String(tenantId)) and run the matching branch.
        if (current && String(current.tenantId) !== String(tenantId)) {
          // Stop the current operation by raising a new Error instance.
          throw new Error(`Account ${canonicalEmail} is assigned to a different tenant; no changes made.`);
        }
        // Perform the side effect or state update expressed on the following line.
        entries.push({ spec, canonicalEmail, oldEmail, current, roleDoc: roleByName.get(spec.role) });
      }
      // Perform the side effect or state update expressed on the following line.
      tenantPlans.push({ tenantSpec, tenant, entries });
      // Repeat the enclosed work for each required iteration.
      for (const entry of entries) {
        // Perform the side effect or state update expressed on the following line.
        plan.push({
          tenant: tenantSpec.slug,
          action: entry.current ? (entry.current.email === entry.canonicalEmail ? "normalize-existing-account" : "rename-legacy-account") : "create-missing-account",
          from: entry.current?.email || null,
          to: entry.canonicalEmail,
          role: entry.spec.role,
        });
      }
    }

    // Perform the side effect or state update expressed on the following line.
    console.log(JSON.stringify({ mode: isDryRun ? "dry-run" : "apply", target: expectedDatabase, tenants: TENANTS.map(({ slug }) => slug), plannedChanges: plan.length, plan }, null, 2));
    // Check the condition (isDryRun) and run the matching branch.
    if (isDryRun) return;

    // Declare passwordHash for use by the surrounding module or function.
    const passwordHash = await bcrypt.hash(password, 10);
    // Declare now for use by the surrounding module or function.
    const now = new Date();
    // Declare globalAccount for use by the surrounding module or function.
    const globalAccount = globalOld || globalNew;
    // Check the condition (globalAccount) and run the matching branch.
    if (globalAccount) {
      // Perform the side effect or state update expressed on the following line.
      await users.updateOne({ _id: globalAccount._id, tenantId: null }, { $set: {
        email: PLATFORM_NEW, role: "super_admin", legacyRole: "super_admin", status: "active",
        password: passwordHash, loginAttempts: 0, lockUntil: null, isVerified: true, updatedAt: now,
      } });
    } else {
      // Perform the side effect or state update expressed on the following line.
      await runWithTenant({ tenantId: null, role: "super_admin", bypass: true }, async () => {
        // Declare role for use by the surrounding module or function.
        const role = await Role.findOne({ tenantId: null, name: "super_admin" });
        // Declare account for use by the surrounding module or function.
        const account = new User({
          name: "Platform Owner TEST GLOBAL", email: PLATFORM_NEW, phone: generatedPhone(0),
          password, role: "super_admin", legacyRole: "super_admin", roleId: role?._id || null,
          tenantId: null, status: "active", isVerified: true, loginAttempts: 0, lockUntil: null,
          referralCode: randomBytes(4).toString("hex").toUpperCase(),
        });
        // Perform the side effect or state update expressed on the following line.
        await account.save();
      });
    }

    // Declare created for use by the surrounding module or function.
    let created = 0;
    // Declare renamed for use by the surrounding module or function.
    let renamed = 0;
    // Repeat the enclosed work for each required iteration.
    for (const { tenantSpec, tenant, entries } of tenantPlans) {
      // Perform the side effect or state update expressed on the following line.
      await runWithTenant({ tenantId: tenant._id, tenant, role: "admin", bypass: true }, async () => {
        // Repeat the enclosed work for each required iteration.
        for (let i = 0; i < entries.length; i++) {
          // Declare { spec, canonicalEmail, current, roleDoc } for use by the surrounding module or function.
          const { spec, canonicalEmail, current, roleDoc } = entries[i];
          // Declare userId for use by the surrounding module or function.
          let userId;
          // Check the condition (current) and run the matching branch.
          if (current) {
            // Perform the side effect or state update expressed on the following line.
            userId = current._id;
            // Declare wasLegacy for use by the surrounding module or function.
            const wasLegacy = current.email !== canonicalEmail;
            // Perform the side effect or state update expressed on the following line.
            await users.updateOne({ _id: current._id, tenantId: tenant._id }, { $set: {
              email: canonicalEmail, role: spec.role, legacyRole: spec.role, roleId: roleDoc._id,
              status: "active", isVerified: true, password: passwordHash, loginAttempts: 0, lockUntil: null, updatedAt: now,
            } });
            // Check the condition (wasLegacy) and run the matching branch.
            if (wasLegacy) renamed++;
            // Perform the side effect or state update expressed on the following line.
            await Promise.all([
              db.collection("staffs").updateMany({ tenantId: tenant._id, user: current._id }, { $set: { email: canonicalEmail, updatedAt: now } }),
              db.collection("agents").updateMany({ tenantId: tenant._id, user: current._id }, { $set: { email: canonicalEmail, updatedAt: now } }),
              db.collection("customers").updateMany({ tenantId: tenant._id, user: current._id }, { $set: { email: canonicalEmail, updatedAt: now } }),
            ]);
          } else {
            // Declare account for use by the surrounding module or function.
            const account = new User({
              tenantId: tenant._id, email: canonicalEmail,
              name: `${spec.title} TEST ${tenantSpec.slug} ${spec.local}`,
              phone: generatedPhone(TENANTS.indexOf(tenantSpec) * 100 + i + 1),
              password, role: spec.role, legacyRole: spec.role, roleId: roleDoc._id,
              status: "active", isVerified: true, loginAttempts: 0, lockUntil: null,
              referralCode: randomBytes(4).toString("hex").toUpperCase(),
            });
            // Perform the side effect or state update expressed on the following line.
            await account.save();
            // Perform the side effect or state update expressed on the following line.
            userId = account._id;
            // Perform the side effect or state update expressed on the following line.
            created++;
          }

          // Declare existingStaff for use by the surrounding module or function.
          const existingStaff = await Staff.findOne({ tenantId: tenant._id, user: userId });
          // Check the condition (["tour_guide", "driver", "tour_manager", "admin"].includes(spec.role) ) and run the matching branch.
          if (["tour_guide", "driver", "tour_manager", "admin"].includes(spec.role) && !existingStaff) {
            // Declare position for use by the surrounding module or function.
            const position = spec.role === "tour_guide" ? "guide" : spec.role === "driver" ? "driver" : spec.role === "tour_manager" ? "tour_manager" : "admin";
            // Perform the side effect or state update expressed on the following line.
            await Staff.create({
              tenantId: tenant._id, user: userId, name: `${spec.title} TEST ${tenantSpec.slug} ${spec.local}`,
              email: canonicalEmail, phone: generatedPhone(TENANTS.indexOf(tenantSpec) * 100 + i + 1),
              position, role: spec.role === "tour_guide" ? "guide" : spec.role === "tour_manager" ? "manager" : spec.role,
              status: "active", isActive: true, availability: "available",
              employeeNumber: `MIG-${tenantSpec.slug}-${spec.local}`, createdBy: null,
            });
          }
          // Check the condition (spec.role === "agent" && !(await Agent.findOne({ tenantId: tenant._id,) and run the matching branch.
          if (spec.role === "agent" && !(await Agent.findOne({ tenantId: tenant._id, user: userId }))) {
            // Perform the side effect or state update expressed on the following line.
            await Agent.create({
              tenantId: tenant._id, user: userId,
              companyName: `${tenantSpec.label} Demo Agent ${spec.local}`,
              email: canonicalEmail, phone: generatedPhone(TENANTS.indexOf(tenantSpec) * 100 + i + 1),
              commissionRate: 8, status: "active", isApproved: true,
              description: "Synthetic demo agent account created by the canonical account reconciliation.",
            });
          }
          // Check the condition (spec.role === "customer" && !(await Customer.findOne({ tenantId: tenan) and run the matching branch.
          if (spec.role === "customer" && !(await Customer.findOne({ tenantId: tenant._id, user: userId }))) {
            // Perform the side effect or state update expressed on the following line.
            await Customer.create({
              tenantId: tenant._id, user: userId, firstName: spec.local, lastName: tenantSpec.slug,
              email: canonicalEmail, phone: generatedPhone(TENANTS.indexOf(tenantSpec) * 100 + i + 1),
              nationality: "Kenyan", country: "Kenya", county: tenant.county || "Kenya",
              city: tenant.county || "Kenya", address: `Demo ${tenantSpec.label}, Kenya`,
              customerType: "individual", status: "active", preferredContactMethod: "email", marketingConsent: false,
            });
          }
        }
      });
    }

    // Declare finalEmails for use by the surrounding module or function.
    const finalEmails = [PLATFORM_NEW, ...TENANTS.flatMap((tenant) => ACCOUNT_SPECS.map((spec) => emailFor(spec.local, tenant.domain)))];
    // Declare finalUsers for use by the surrounding module or function.
    const finalUsers = await users.find({ email: { $in: finalEmails } }, { projection: { email: 1, role: 1, tenantId: 1, status: 1 } }).toArray();
    // Declare emailSet for use by the surrounding module or function.
    const emailSet = new Set(finalUsers.map(({ email }) => email));
    // Declare missing for use by the surrounding module or function.
    const missing = finalEmails.filter((email) => !emailSet.has(email));
    // Check the condition (finalUsers.length !== 37 || missing.length) and run the matching branch.
    if (finalUsers.length !== 37 || missing.length) throw new Error(`Post-migration verification failed: found ${finalUsers.length}/37 canonical accounts; missing ${missing.join(", ")}`);
    // Declare global for use by the surrounding module or function.
    const global = finalUsers.find(({ email }) => email === PLATFORM_NEW);
    // Check the condition (!global || global.tenantId != null || global.role !== "super_admin") and run the matching branch.
    if (!global || global.tenantId != null || global.role !== "super_admin") throw new Error("Post-migration verification failed: platform owner must be a tenantless super_admin.");
    // Repeat the enclosed work for each required iteration.
    for (const { tenantSpec, tenant } of tenantPlans) {
      // Declare tenantUsers for use by the surrounding module or function.
      const tenantUsers = finalUsers.filter((user) => String(user.tenantId) === String(tenant._id));
      // Check the condition (tenantUsers.length !== 12 || tenantUsers.some((user) => user.status !=) and run the matching branch.
      if (tenantUsers.length !== 12 || tenantUsers.some((user) => user.status !== "active")) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(`Post-migration verification failed for ${tenantSpec.slug}: expected 12 active tenant accounts, found ${tenantUsers.length}.`);
      }
    }
    // Declare badHashes for use by the surrounding module or function.
    const badHashes = await users.find({ email: { $in: finalEmails }, password: { $not: /^\$2[aby]\$/ } }, { projection: { email: 1 } }).toArray();
    // Check the condition (badHashes.length) and run the matching branch.
    if (badHashes.length) throw new Error(`Post-migration verification failed: invalid password hashes for ${badHashes.map(({ email }) => email).join(", ")}`);
    // Perform the side effect or state update expressed on the following line.
    console.log(JSON.stringify({ status: "passed", canonicalAccounts: finalUsers.length, tenantCount: TENANTS.length, tenantAccounts: 36, platformAccounts: 1, renamedExistingAccounts: renamed, createdMissingAccounts: created, passwordHashesUpdated: true }));
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.disconnect().catch(() => {});
  }
}

// Declare invokedPath for use by the surrounding module or function.
const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
// Check the condition (invokedPath === import.meta.url) and run the matching branch.
if (invokedPath === import.meta.url) {
  // Perform the side effect or state update expressed on the following line.
  main().catch((error) => {
    // Declare message for use by the surrounding module or function.
    const message = String(error?.message || "Demo account reconciliation failed.")
      .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[MongoDB URI redacted]");
    // Perform the side effect or state update expressed on the following line.
    console.error(`DEMO ACCOUNT RECONCILIATION FAILED: ${message}`);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  });
}

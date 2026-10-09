import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";
import Organization from "../models/Organization.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import Customer from "../models/Customer.js";
import { runWithTenant } from "../tenancy/context.js";

export const TENANTS = [
  { slug: "hussein-mboya", legacyDomain: "hussein-mboya.com", domain: "husseinmboya.com", label: "Hussein Mboya Tours" },
  { slug: "amani-trails", legacyDomain: "amani-trails.com", domain: "amanitrails.com", label: "Amani Trails Safaris" },
  { slug: "demo-safari", legacyDomain: "demo-safari.com", domain: "demosafari.com", label: "Demo Safari Adventures" },
];
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
export const PLATFORM_OLD = "superadmin@hussein-mboya.com";
export const PLATFORM_NEW = "superadmin1@husseinmboya.com";
const platformRoleNames = ["super_admin", "superadmin"];
const isDryRun = process.argv.includes("--dry-run");
const expectedHost = "cluster0.cdtxzts.mongodb.net";
const expectedDatabase = "husseindb";

function assertTarget() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
  const target = new URL(process.env.MONGODB_URI);
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  if (target.hostname.toLowerCase() !== expectedHost || database !== expectedDatabase) {
    throw new Error("Refusing demo-account reconciliation: target must be the configured demo Atlas host and husseindb database.");
  }
  if (process.env.NODE_ENV === "production") throw new Error("Refusing demo-account reconciliation with NODE_ENV=production.");
  if (process.env.ALLOW_ATLAS_DEMO_SEED !== "YES") {
    throw new Error("Set ALLOW_ATLAS_DEMO_SEED=YES to explicitly authorize the configured demo Atlas target.");
  }
  if (!isDryRun && process.env.CONFIRM_DEMO_ACCOUNT_MIGRATION !== "YES") {
    throw new Error("Set CONFIRM_DEMO_ACCOUNT_MIGRATION=YES to apply the account migration. Use --dry-run to preview.");
  }
}

function validatePassword(password) {
  if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new Error("SEED_DEMO_PASSWORD must be at least 12 characters and contain uppercase, lowercase, and a number.");
  }
}

export function emailFor(local, domain) { return `${local}@${domain}`; }
function legacyEmailFor(local, domain) { return `${local}@${domain}`; }
function roleForOldPlatform(user) { return platformRoleNames.includes(String(user?.role || "").toLowerCase()); }
function generatedPhone(index) { return String(7900000000 + index).slice(-10); }

async function main() {
  assertTarget();
  const password = String(process.env.SEED_DEMO_PASSWORD || "");
  if (!isDryRun) validatePassword(password);
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, maxPoolSize: 2 });
  try {
    const db = mongoose.connection.db;
    const users = db.collection("users");
    const organizations = db.collection("organizations");
    const tenantDocs = await organizations.find({ slug: { $in: TENANTS.map((tenant) => tenant.slug) } }).toArray();
    const tenantBySlug = new Map(tenantDocs.map((tenant) => [tenant.slug, tenant]));
    if (tenantBySlug.size !== TENANTS.length) {
      throw new Error(`Expected all 3 demo tenants; found ${tenantBySlug.size}. No changes made.`);
    }

    const plan = [];
    const globalOld = await users.findOne({ email: PLATFORM_OLD, tenantId: null });
    const globalNew = await users.findOne({ email: PLATFORM_NEW, tenantId: null });
    if (globalOld && globalNew && String(globalOld._id) !== String(globalNew._id)) {
      throw new Error("Both legacy and canonical platform accounts exist with different IDs. Resolve this duplicate manually; no changes made.");
    }
    if (globalNew && !roleForOldPlatform(globalNew)) {
      throw new Error("Canonical platform account has an unexpected role. No changes made.");
    }
    plan.push({ action: globalOld && !globalNew ? "rename-global-platform-account" : globalNew ? "verify-global-platform-account" : "create-global-platform-account", from: globalOld ? PLATFORM_OLD : null, to: PLATFORM_NEW });

    const tenantPlans = [];
    for (const tenantSpec of TENANTS) {
      const tenant = tenantBySlug.get(tenantSpec.slug);
      const tenantId = tenant._id;
      const roleDocs = await db.collection("roles").find({ tenantId }).toArray();
      const roleByName = new Map(roleDocs.map((role) => [String(role.name).toLowerCase(), role]));
      for (const roleName of ["admin", "tour_manager", "agent", "tour_guide", "driver", "customer"]) {
        if (!roleByName.has(roleName)) throw new Error(`Tenant ${tenantSpec.slug} is missing role ${roleName}. No changes made.`);
      }
      const entries = [];
      for (const spec of ACCOUNT_SPECS) {
        const canonicalEmail = emailFor(spec.local, tenantSpec.domain);
        const oldEmail = spec.legacyLocal ? legacyEmailFor(spec.legacyLocal, tenantSpec.legacyDomain) : null;
        const canonical = await users.findOne({ tenantId, email: canonicalEmail });
        const legacy = oldEmail ? await users.findOne({ tenantId, email: oldEmail }) : null;
        if (canonical && legacy && String(canonical._id) !== String(legacy._id)) {
          throw new Error(`Both legacy and canonical accounts exist for ${tenantSpec.slug}/${spec.local}; no changes made.`);
        }
        const current = canonical || legacy;
        if (current && String(current.tenantId) !== String(tenantId)) {
          throw new Error(`Account ${canonicalEmail} is assigned to a different tenant; no changes made.`);
        }
        entries.push({ spec, canonicalEmail, oldEmail, current, roleDoc: roleByName.get(spec.role) });
      }
      tenantPlans.push({ tenantSpec, tenant, entries });
      for (const entry of entries) {
        plan.push({
          tenant: tenantSpec.slug,
          action: entry.current ? (entry.current.email === entry.canonicalEmail ? "normalize-existing-account" : "rename-legacy-account") : "create-missing-account",
          from: entry.current?.email || null,
          to: entry.canonicalEmail,
          role: entry.spec.role,
        });
      }
    }

    console.log(JSON.stringify({ mode: isDryRun ? "dry-run" : "apply", target: expectedDatabase, tenants: TENANTS.map(({ slug }) => slug), plannedChanges: plan.length, plan }, null, 2));
    if (isDryRun) return;

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();
    const globalAccount = globalOld || globalNew;
    if (globalAccount) {
      await users.updateOne({ _id: globalAccount._id, tenantId: null }, { $set: {
        email: PLATFORM_NEW, role: "super_admin", legacyRole: "super_admin", status: "active",
        password: passwordHash, loginAttempts: 0, lockUntil: null, isVerified: true, updatedAt: now,
      } });
    } else {
      await runWithTenant({ tenantId: null, role: "super_admin", bypass: true }, async () => {
        const role = await Role.findOne({ tenantId: null, name: "super_admin" });
        const account = new User({
          name: "Platform Owner TEST GLOBAL", email: PLATFORM_NEW, phone: generatedPhone(0),
          password, role: "super_admin", legacyRole: "super_admin", roleId: role?._id || null,
          tenantId: null, status: "active", isVerified: true, loginAttempts: 0, lockUntil: null,
          referralCode: randomBytes(4).toString("hex").toUpperCase(),
        });
        await account.save();
      });
    }

    let created = 0;
    let renamed = 0;
    for (const { tenantSpec, tenant, entries } of tenantPlans) {
      await runWithTenant({ tenantId: tenant._id, tenant, role: "admin", bypass: true }, async () => {
        for (let i = 0; i < entries.length; i++) {
          const { spec, canonicalEmail, current, roleDoc } = entries[i];
          let userId;
          if (current) {
            userId = current._id;
            const wasLegacy = current.email !== canonicalEmail;
            await users.updateOne({ _id: current._id, tenantId: tenant._id }, { $set: {
              email: canonicalEmail, role: spec.role, legacyRole: spec.role, roleId: roleDoc._id,
              status: "active", isVerified: true, password: passwordHash, loginAttempts: 0, lockUntil: null, updatedAt: now,
            } });
            if (wasLegacy) renamed++;
            await Promise.all([
              db.collection("staffs").updateMany({ tenantId: tenant._id, user: current._id }, { $set: { email: canonicalEmail, updatedAt: now } }),
              db.collection("agents").updateMany({ tenantId: tenant._id, user: current._id }, { $set: { email: canonicalEmail, updatedAt: now } }),
              db.collection("customers").updateMany({ tenantId: tenant._id, user: current._id }, { $set: { email: canonicalEmail, updatedAt: now } }),
            ]);
          } else {
            const account = new User({
              tenantId: tenant._id, email: canonicalEmail,
              name: `${spec.title} TEST ${tenantSpec.slug} ${spec.local}`,
              phone: generatedPhone(TENANTS.indexOf(tenantSpec) * 100 + i + 1),
              password, role: spec.role, legacyRole: spec.role, roleId: roleDoc._id,
              status: "active", isVerified: true, loginAttempts: 0, lockUntil: null,
              referralCode: randomBytes(4).toString("hex").toUpperCase(),
            });
            await account.save();
            userId = account._id;
            created++;
          }

          const existingStaff = await Staff.findOne({ tenantId: tenant._id, user: userId });
          if (["tour_guide", "driver", "tour_manager", "admin"].includes(spec.role) && !existingStaff) {
            const position = spec.role === "tour_guide" ? "guide" : spec.role === "driver" ? "driver" : spec.role === "tour_manager" ? "tour_manager" : "admin";
            await Staff.create({
              tenantId: tenant._id, user: userId, name: `${spec.title} TEST ${tenantSpec.slug} ${spec.local}`,
              email: canonicalEmail, phone: generatedPhone(TENANTS.indexOf(tenantSpec) * 100 + i + 1),
              position, role: spec.role === "tour_guide" ? "guide" : spec.role === "tour_manager" ? "manager" : spec.role,
              status: "active", isActive: true, availability: "available",
              employeeNumber: `MIG-${tenantSpec.slug}-${spec.local}`, createdBy: null,
            });
          }
          if (spec.role === "agent" && !(await Agent.findOne({ tenantId: tenant._id, user: userId }))) {
            await Agent.create({
              tenantId: tenant._id, user: userId,
              companyName: `${tenantSpec.label} Demo Agent ${spec.local}`,
              email: canonicalEmail, phone: generatedPhone(TENANTS.indexOf(tenantSpec) * 100 + i + 1),
              commissionRate: 8, status: "active", isApproved: true,
              description: "Synthetic demo agent account created by the canonical account reconciliation.",
            });
          }
          if (spec.role === "customer" && !(await Customer.findOne({ tenantId: tenant._id, user: userId }))) {
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

    const finalEmails = [PLATFORM_NEW, ...TENANTS.flatMap((tenant) => ACCOUNT_SPECS.map((spec) => emailFor(spec.local, tenant.domain)))];
    const finalUsers = await users.find({ email: { $in: finalEmails } }, { projection: { email: 1, role: 1, tenantId: 1, status: 1 } }).toArray();
    const emailSet = new Set(finalUsers.map(({ email }) => email));
    const missing = finalEmails.filter((email) => !emailSet.has(email));
    if (finalUsers.length !== 37 || missing.length) throw new Error(`Post-migration verification failed: found ${finalUsers.length}/37 canonical accounts; missing ${missing.join(", ")}`);
    const global = finalUsers.find(({ email }) => email === PLATFORM_NEW);
    if (!global || global.tenantId != null || global.role !== "super_admin") throw new Error("Post-migration verification failed: platform owner must be a tenantless super_admin.");
    for (const { tenantSpec, tenant } of tenantPlans) {
      const tenantUsers = finalUsers.filter((user) => String(user.tenantId) === String(tenant._id));
      if (tenantUsers.length !== 12 || tenantUsers.some((user) => user.status !== "active")) {
        throw new Error(`Post-migration verification failed for ${tenantSpec.slug}: expected 12 active tenant accounts, found ${tenantUsers.length}.`);
      }
    }
    const badHashes = await users.find({ email: { $in: finalEmails }, password: { $not: /^\$2[aby]\$/ } }, { projection: { email: 1 } }).toArray();
    if (badHashes.length) throw new Error(`Post-migration verification failed: invalid password hashes for ${badHashes.map(({ email }) => email).join(", ")}`);
    console.log(JSON.stringify({ status: "passed", canonicalAccounts: finalUsers.length, tenantCount: TENANTS.length, tenantAccounts: 36, platformAccounts: 1, renamedExistingAccounts: renamed, createdMissingAccounts: created, passwordHashesUpdated: true }));
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    const message = String(error?.message || "Demo account reconciliation failed.")
      .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[MongoDB URI redacted]");
    console.error(`DEMO ACCOUNT RECONCILIATION FAILED: ${message}`);
    process.exitCode = 1;
  });
}

/**
 * Purpose: create Global Tours Admins operational script. Main declarations: createTenantAdmin, createPlatformOwner.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare SUPERADMIN_EMAIL for use by the surrounding module or function.
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "platform@globaltours.test";
// Declare SUPERADMIN_PASSWORD for use by the surrounding module or function.
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
// Declare ADMIN_EMAILS for use by the surrounding module or function.
const ADMIN_EMAILS = [
  process.env.ADMIN1_EMAIL || "admin1@globaltours.test",
  process.env.ADMIN2_EMAIL || "admin2@globaltours.test",
];
// Declare ADMIN_PASSWORDS for use by the surrounding module or function.
const ADMIN_PASSWORDS = [process.env.ADMIN1_PASSWORD, process.env.ADMIN2_PASSWORD];
// Declare GLOBAL_TOURS_ID for use by the surrounding module or function.
const GLOBAL_TOURS_ID = new mongoose.Types.ObjectId("6a87fe1bc3f48c3dcddf4a23");

// Check the condition (!SUPERADMIN_PASSWORD || ADMIN_PASSWORDS.some((password) => !password)) and run the matching branch.
if (!SUPERADMIN_PASSWORD || ADMIN_PASSWORDS.some((password) => !password)) {
  // Stop the current operation by raising a new Error instance.
  throw new Error("Set SUPERADMIN_PASSWORD, ADMIN1_PASSWORD and ADMIN2_PASSWORD before running this script.");
}

// Perform the side effect or state update expressed on the following line.
await mongoose.connect(process.env.MONGODB_URI);

// Organization is tenant-scoped, so resolve the known platform tenant directly
// from MongoDB rather than attempting a tenant-scoped Organization query.
// Declare org for use by the surrounding module or function.
const org = await mongoose.connection.db.collection("organizations").findOne({
  _id: GLOBAL_TOURS_ID,
});
// Check the condition (!org) and run the matching branch.
if (!org) throw new Error("Global Tours organization not found.");

// Declare createTenantAdmin for use by the surrounding module or function.
const createTenantAdmin = async (email, password, index) => runWithTenant(
  { tenantId: org._id, tenant: org, role: "admin", bypass: false },
  async () => {
    // Declare existing for use by the surrounding module or function.
    const existing = await User.findOne({ email });
    // Check the condition (existing) and run the matching branch.
    if (existing) throw new Error(`User already exists: ${email}`);
    // Return the result of User.create() to the caller.
    return User.create({
      name: `Global Tours Admin ${index}`,
      email,
      phone: index === 1 ? "0712345678" : "0723456789",
      password,
      role: "admin",
      legacyRole: "admin",
      tenantId: org._id,
      status: "active",
      isVerified: true,
      loginAttempts: 0,
      lockUntil: null,
    });
  }
);

// Declare createPlatformOwner for use by the surrounding module or function.
const createPlatformOwner = async () => runWithTenant(
  { tenantId: null, tenant: null, role: "super_admin", bypass: true },
  async () => {
    // Declare existing for use by the surrounding module or function.
    const existing = await User.findOne({
      email: SUPERADMIN_EMAIL,
      role: { $in: ["super_admin", "superadmin"] },
      tenantId: null,
    });
    // Check the condition (existing) and run the matching branch.
    if (existing) throw new Error(`Platform owner already exists: ${SUPERADMIN_EMAIL}`);
    // Return the result of User.create() to the caller.
    return User.create({
      name: "Global Tours Platform Owner",
      email: SUPERADMIN_EMAIL,
      phone: "0734567890",
      password: SUPERADMIN_PASSWORD,
      role: "super_admin",
      legacyRole: "super_admin",
      tenantId: null,
      status: "active",
      isVerified: true,
      loginAttempts: 0,
      lockUntil: null,
    });
  }
);

// Declare superadmin for use by the surrounding module or function.
const superadmin = await createPlatformOwner();
// Declare admins for use by the surrounding module or function.
const admins = [];
// Repeat the enclosed work for each required iteration.
for (let i = 0; i < ADMIN_EMAILS.length; i += 1) {
  // Perform the side effect or state update expressed on the following line.
  admins.push(await createTenantAdmin(ADMIN_EMAILS[i], ADMIN_PASSWORDS[i], i + 1));
}

// Declare verifyPlatform for use by the surrounding module or function.
const verifyPlatform = await runWithTenant(
  { tenantId: null, tenant: null, role: "super_admin", bypass: true },
  () => User.findOne({ _id: superadmin._id }).select("+password")
);
// Check the condition (!verifyPlatform || verifyPlatform.tenantId !== null || !["super_admin") and run the matching branch.
if (!verifyPlatform || verifyPlatform.tenantId !== null || !["super_admin", "superadmin"].includes(verifyPlatform.role)) {
  // Stop the current operation by raising a new Error instance.
  throw new Error("Platform owner verification failed.");
}
// Check the condition (!(await verifyPlatform.matchPassword(SUPERADMIN_PASSWORD))) and run the matching branch.
if (!(await verifyPlatform.matchPassword(SUPERADMIN_PASSWORD))) throw new Error("Platform owner password verification failed.");

// Repeat the enclosed work for each required iteration.
for (let i = 0; i < admins.length; i += 1) {
  // Declare admin for use by the surrounding module or function.
  const admin = await runWithTenant(
    { tenantId: org._id, tenant: org, role: "admin", bypass: false },
    () => User.findOne({ _id: admins[i]._id }).select("+password")
  );
  // Check the condition (!admin || String(admin.tenantId) !== String(org._id) || admin.role !==) and run the matching branch.
  if (!admin || String(admin.tenantId) !== String(org._id) || admin.role !== "admin") {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`Tenant admin verification failed: ${ADMIN_EMAILS[i]}`);
  }
  // Check the condition (!(await admin.matchPassword(ADMIN_PASSWORDS[i]))) and run the matching branch.
  if (!(await admin.matchPassword(ADMIN_PASSWORDS[i]))) throw new Error(`Tenant admin password verification failed: ${ADMIN_EMAILS[i]}`);
}

// Perform the side effect or state update expressed on the following line.
console.log("SUCCESS: created and verified the platform owner and Global Tours administrators.");
// Perform the side effect or state update expressed on the following line.
console.log(`SUPERADMIN: ${SUPERADMIN_EMAIL} (tenantId=null)`);
// Perform the side effect or state update expressed on the following line.
console.log(`ADMIN: ${ADMIN_EMAILS[0]} (tenantId=${org._id})`);
// Perform the side effect or state update expressed on the following line.
console.log(`ADMIN: ${ADMIN_EMAILS[1]} (tenantId=${org._id})`);

// Perform the side effect or state update expressed on the following line.
await mongoose.disconnect();

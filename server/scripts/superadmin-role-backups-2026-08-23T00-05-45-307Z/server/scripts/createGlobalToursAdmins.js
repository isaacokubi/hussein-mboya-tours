import mongoose from "mongoose";
import User from "../models/User.js";
import { runWithTenant } from "../tenancy/context.js";

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "platform@globaltours.test";
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
const ADMIN_EMAILS = [
  process.env.ADMIN1_EMAIL || "admin1@globaltours.test",
  process.env.ADMIN2_EMAIL || "admin2@globaltours.test",
];
const ADMIN_PASSWORDS = [process.env.ADMIN1_PASSWORD, process.env.ADMIN2_PASSWORD];
const GLOBAL_TOURS_ID = new mongoose.Types.ObjectId("6a87fe1bc3f48c3dcddf4a23");

if (!SUPERADMIN_PASSWORD || ADMIN_PASSWORDS.some((password) => !password)) {
  throw new Error("Set SUPERADMIN_PASSWORD, ADMIN1_PASSWORD and ADMIN2_PASSWORD before running this script.");
}

await mongoose.connect(process.env.MONGODB_URI);

// Organization is tenant-scoped, so resolve the known platform tenant directly
// from MongoDB rather than attempting a tenant-scoped Organization query.
const org = await mongoose.connection.db.collection("organizations").findOne({
  _id: GLOBAL_TOURS_ID,
});
if (!org) throw new Error("Global Tours organization not found.");

const createTenantAdmin = async (email, password, index) => runWithTenant(
  { tenantId: org._id, tenant: org, role: "admin", bypass: false },
  async () => {
    const existing = await User.findOne({ email });
    if (existing) throw new Error(`User already exists: ${email}`);
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

const createPlatformOwner = async () => runWithTenant(
  { tenantId: null, tenant: null, role: "superadmin", bypass: true },
  async () => {
    const existing = await User.findOne({
      email: SUPERADMIN_EMAIL,
      role: { $in: ["superadmin", "super_admin"] },
      tenantId: null,
    });
    if (existing) throw new Error(`Platform owner already exists: ${SUPERADMIN_EMAIL}`);
    return User.create({
      name: "Global Tours Platform Owner",
      email: SUPERADMIN_EMAIL,
      phone: "0734567890",
      password: SUPERADMIN_PASSWORD,
      role: "superadmin",
      legacyRole: "superadmin",
      tenantId: null,
      status: "active",
      isVerified: true,
      loginAttempts: 0,
      lockUntil: null,
    });
  }
);

const superadmin = await createPlatformOwner();
const admins = [];
for (let i = 0; i < ADMIN_EMAILS.length; i += 1) {
  admins.push(await createTenantAdmin(ADMIN_EMAILS[i], ADMIN_PASSWORDS[i], i + 1));
}

const verifyPlatform = await runWithTenant(
  { tenantId: null, tenant: null, role: "superadmin", bypass: true },
  () => User.findOne({ _id: superadmin._id }).select("+password")
);
if (!verifyPlatform || verifyPlatform.tenantId !== null || !["superadmin", "super_admin"].includes(verifyPlatform.role)) {
  throw new Error("Platform owner verification failed.");
}
if (!(await verifyPlatform.matchPassword(SUPERADMIN_PASSWORD))) throw new Error("Platform owner password verification failed.");

for (let i = 0; i < admins.length; i += 1) {
  const admin = await runWithTenant(
    { tenantId: org._id, tenant: org, role: "admin", bypass: false },
    () => User.findOne({ _id: admins[i]._id }).select("+password")
  );
  if (!admin || String(admin.tenantId) !== String(org._id) || admin.role !== "admin") {
    throw new Error(`Tenant admin verification failed: ${ADMIN_EMAILS[i]}`);
  }
  if (!(await admin.matchPassword(ADMIN_PASSWORDS[i]))) throw new Error(`Tenant admin password verification failed: ${ADMIN_EMAILS[i]}`);
}

console.log("SUCCESS: created and verified the platform owner and Global Tours administrators.");
console.log(`SUPERADMIN: ${SUPERADMIN_EMAIL} (tenantId=null)`);
console.log(`ADMIN: ${ADMIN_EMAILS[0]} (tenantId=${org._id})`);
console.log(`ADMIN: ${ADMIN_EMAILS[1]} (tenantId=${org._id})`);

await mongoose.disconnect();

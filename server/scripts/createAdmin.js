import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const name = process.env.ADMIN_NAME || process.argv[2];
const email = String(process.env.ADMIN_EMAIL || process.argv[3] || "").trim().toLowerCase();
const phone = process.env.ADMIN_PHONE || process.argv[4];
const password = process.env.ADMIN_PASSWORD || process.argv[5];

if (!name || !email || !phone || !password) {
  console.error("Usage: npm run create:admin -- \"Full Name\" email@example.com 0712345678 StrongPassword");
  process.exit(1);
}

if (!/^\d{10}$/.test(String(phone))) {
  console.error("Phone must be exactly 10 digits.");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const tenantId = process.env.DEFAULT_TENANT_ID;
if (!tenantId) throw new Error("DEFAULT_TENANT_ID is required. Run npm run migrate:multitenancy first.");
const tenant = await Organization.findById(tenantId).lean();
if (!tenant) throw new Error("DEFAULT_TENANT_ID does not reference an existing organization.");

const permissionNames = [
  "admin.dashboard", "user.manage", "staff.manage", "tour.manage",
  "booking.manage", "payment.manage", "refund.manage", "analytics.view",
  "settings.manage", "roles.manage", "notifications.view", "finance.view",
];

const permissionIds = [];
for (const permissionName of permissionNames) {
  const permission = await Permission.findOneAndUpdate(
    { name: permissionName },
    {
      $setOnInsert: {
        name: permissionName,
        label: permissionName.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        module: permissionName.split(/[._]/)[0],
        category: "system",
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );
  permissionIds.push(permission._id);
}

await runWithTenant({ tenantId: tenant._id, tenant, bypass: false }, async () => {
const role = await Role.findOneAndUpdate(
  { name: "admin" },
  {
    $set: {
      displayName: "Administrator",
      permissions: permissionIds,
      status: "active",
      isSystem: true,
      level: 100,
    },
  },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);

let user = await User.findOne({ email });
if (user) {
  user.name = name;
  user.phone = phone;
  user.password = password;
  user.role = "admin";
  user.legacyRole = "admin";
  user.roleId = role._id;
  user.status = "active";
  user.isVerified = true;
  await user.save();
  // debug removed
} else {
  user = await User.create({
    name,
    email,
    phone,
    password,
    role: "admin",
    legacyRole: "admin",
    roleId: role._id,
    status: "active",
    isVerified: true,
  });
  // debug removed
}

});

await mongoose.disconnect();

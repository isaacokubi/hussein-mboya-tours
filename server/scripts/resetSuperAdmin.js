import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";
import env from "../config/env.js";

const email = String(process.env.SUPERADMIN_EMAIL || "superadmin@coerent.com").trim().toLowerCase();
const password = String(process.env.SUPERADMIN_PASSWORD || "").trim();

if (!password || password.length < 8) {
  console.error("Set SUPERADMIN_PASSWORD to a temporary password of at least 8 characters.");
  process.exit(1);
}

const mongoUri = env.MONGO_URI || process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("MongoDB connection string is missing (MONGO_URI/MONGODB_URI).");
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);

  const role = await Role.findOneAndUpdate(
    { name: { $in: ["superadmin", "super_admin"] } },
    {
      $setOnInsert: {
        name: "superadmin",
        displayName: "Super Admin",
        description: "Platform-level administrator",
        permissions: [],
        isSystem: true,
        status: "active",
        level: 1000,
      },
    },
    { upsert: true, new: true }
  );

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        password: hashedPassword,
        role: "superadmin",
        legacyRole: "superadmin",
        roleId: role._id,
        status: "active",
        isVerified: true,
        loginAttempts: 0,
        lockUntil: null,
      },
      $setOnInsert: {
        name: "Super Administrator",
        phone: String(process.env.SUPERADMIN_PHONE || "0700000000"),
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).select("_id email role roleId status isVerified");

  console.log(`SuperAdmin ready: ${user.email} (${user._id})`);
  console.log("Use the temporary password supplied through SUPERADMIN_PASSWORD, then change it after login.");
} finally {
  await mongoose.disconnect();
}

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";

const email = "superadmin@coerent.com";
const password = String(process.env.SUPERADMIN_RESET_PASSWORD || "").trim();

if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
  throw new Error("Set SUPERADMIN_RESET_PASSWORD to a password of at least 8 characters containing an uppercase letter and a number.");
}

if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  throw new Error("MONGO_URI or MONGODB_URI is required.");
}

await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

const role = await Role.findOne({ name: { $in: ["superadmin", "super_admin"] } }).sort({ createdAt: 1 });
const user = await User.findOne({ email }).select("+password");

if (!user) {
  throw new Error(`No user found for ${email}. Create the account through the application's approved SuperAdmin provisioning flow first.`);
}

user.password = await bcrypt.hash(password, 10);
user.role = "superadmin";
user.legacyRole = "superadmin";
user.roleId = role?._id || null;
user.status = "active";
user.loginAttempts = 0;
user.lockUntil = null;
user.passwordResetCodeHash = "";
user.passwordResetExpiresAt = null;
user.passwordResetAttempts = 0;
await user.save({ validateBeforeSave: false });

console.log(`SuperAdmin password reset successfully for ${email}.`);
console.log("Role:", user.role);
console.log("Role document:", role?._id?.toString() || "not found; durable role fallback is active");

await mongoose.disconnect();

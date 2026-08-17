import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";
import Role from "../models/Role.js";

dotenv.config();

const migrateRoles = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    const users = await User.find();

    for (const user of users) {
      const roleName = user.legacyRole || user.role || "customer";

      const role = await Role.findOne({
        name: roleName,
      });

      if (!role) {
        // debug removed
        continue;
      }

      user.role = roleName;      // string role
      user.roleId = role._id;    // RBAC reference

      await user.save();

      // debug removed
    }

    // debug removed
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

migrateRoles();
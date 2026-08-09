import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

    const permissionNames = [
      "manage_users",
      "manage_tours",
      "manage_destinations",
      "manage_bookings",
      "manage_payments",
      "view_reports",
    ];

    const permissionIds = [];

    for (const name of permissionNames) {
      let permission = await Permission.findOne({ name });

      if (!permission) {
        permission = await Permission.create({
          name,
          label: name.replace(/_/g, " "),
          module: name.split(/[._]/)[0],
          category: "other",
        });
      }

      permissionIds.push(permission._id);
    }

    let adminRole = await Role.findOne({
      name: "admin",
    });

    if (!adminRole) {
      adminRole = await Role.create({
        name: "admin",
        displayName: "Admin",
        permissions: permissionIds,
      });

      console.log("✅ Admin role created");
    } else {
      adminRole.permissions = permissionIds;
      await adminRole.save();

      console.log("✅ Admin role updated");
    }

    const email = "admin@husseinmboyatours.com";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("ℹ️ Admin already exists");

      await mongoose.connection.close();
      return;
    }

    const admin = await User.create({
      name: "Hussein Mboya Admin",

      email,

      password: "Admin@12345",

      role: "admin",

      roleId: adminRole._id,

      legacyRole: "admin",

      status: "active",

      isVerified: true,
    });

    console.log("=================================");
    console.log("✅ ADMIN CREATED");
    console.log("Email:", admin.email);
    console.log("Password:", "Admin@12345");
    console.log("=================================");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Admin seed failed:", error);

    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

createAdmin();
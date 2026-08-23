import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

import crypto from "crypto";
dotenv.config();

const createSuperAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    // --------------------------------------------------
    // PERMISSIONS
    // --------------------------------------------------

    const permissionNames = [
      "manage_users",
      "manage_roles",
      "manage_destinations",
      "manage_tours",
      "manage_bookings",
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

        // debug removed
      }

      permissionIds.push(permission._id);
    }

    // --------------------------------------------------
    // ROLE
    // --------------------------------------------------

    let superAdminRole = await Role.findOne({
      name: "super_admin",
    });

    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: "super_admin",
        displayName: "Super Admin",
        permissions: permissionIds,
      });

      // debug removed
    } else {
      superAdminRole.permissions = permissionIds;

      await superAdminRole.save();

      // debug removed
    }

    // --------------------------------------------------
    // USER
    // --------------------------------------------------

    const email = "admin@husseinmboyatours.com";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // debug removed
      return;
    }

    const admin = await User.create({
      name: "System Admin",

      email,

      password: process.env.SEED_SUPERADMIN_PASSWORD || crypto.randomBytes(18).toString("base64url"), // pre-save hook hashes it

      phone: "",

      // Application role
      role: "admin",

      // RBAC role
      roleId: superAdminRole._id,

      // Legacy support
      legacyRole: "super_admin",

      status: "active",

      isVerified: true,
    });

    // debug removed
    console.log({
      name: admin.name,
      email: admin.email,
      password: process.env.SEED_SUPERADMIN_PASSWORD || crypto.randomBytes(18).toString("base64url"),
      role: admin.role,
      roleId: superAdminRole.name,
    });
  } catch (error) {
    console.error("❌ ADMIN SEED ERROR:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

createSuperAdmin();

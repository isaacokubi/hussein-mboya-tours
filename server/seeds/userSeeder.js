import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";
import Role from "../models/Role.js";

dotenv.config();

const seedUsers = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

    /*
    |--------------------------------------------------------------------------
    | FIND ROLES
    |--------------------------------------------------------------------------
    */

    const adminRole = await Role.findOne({
      name: "superadmin",
    });

    const managerRole = await Role.findOne({
      name: "tourmanager",
    });

    if (!adminRole) {
      throw new Error("Superadmin role not found. Run role seeder first.");
    }

    if (!managerRole) {
      throw new Error("Tour Manager role not found. Run role seeder first.");
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE EXISTING USERS
    |--------------------------------------------------------------------------
    */

    await User.deleteMany({
      email: {
        $in: [
          "admin@husseinmboyatours.com",
          "manager@husseinmboyatours.com",
        ],
      },
    });

    console.log("🗑 Existing demo users removed");

    /*
    |--------------------------------------------------------------------------
    | CREATE SUPER ADMIN
    |--------------------------------------------------------------------------
    */

    const admin = await User.create({
      name: "Hussein Mboya",

      email: "admin@husseinmboyatours.com",

      phone: "0712345678",

      password: "Admin@12345",

      role: adminRole._id,

      legacyRole: "superadmin",

      isActive: true,

      isVerified: true,
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE TOUR MANAGER
    |--------------------------------------------------------------------------
    */

    const manager = await User.create({
      name: "Tour Manager",

      email: "manager@husseinmboyatours.com",

      phone: "0712345679",

      password: "Manager@12345",

      role: managerRole._id,

      legacyRole: "tourmanager",

      isActive: true,

      isVerified: true,
    });

    console.log("\n====================================");

    console.log("✅ SUPER ADMIN CREATED");

    console.log({
      name: admin.name,
      email: admin.email,
      password: "Admin@12345",
      role: "superadmin",
    });

    console.log("------------------------------------");

    console.log("✅ TOUR MANAGER CREATED");

    console.log({
      name: manager.name,
      email: manager.email,
      password: "Manager@12345",
      role: "tourmanager",
    });

    console.log("====================================");

    await mongoose.connection.close();

    console.log("🔌 MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("❌ USER SEED ERROR:", error.message);

    await mongoose.connection.close().catch(() => {});

    process.exit(1);
  }
};

seedUsers();
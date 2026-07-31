import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

dotenv.config();

const createCustomer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

    // -------------------------------------------------
    // CUSTOMER PERMISSIONS
    // -------------------------------------------------

    const permissionNames = [
      "view_tours",
      "view_destinations",
      "create_bookings",
      "manage_own_bookings",
      "submit_reviews",
    ];

    const permissionIds = [];

    for (const name of permissionNames) {
      let permission = await Permission.findOne({ name });

      if (!permission) {
        permission = await Permission.create({
          name,
          label: name.replace(/_/g, " "),
        });

        console.log(`✅ Created permission: ${name}`);
      }

      permissionIds.push(permission._id);
    }

    // -------------------------------------------------
    // CUSTOMER ROLE
    // -------------------------------------------------

    let customerRole = await Role.findOne({
      name: "customer",
    });

    if (!customerRole) {
      customerRole = await Role.create({
        name: "customer",
        permissions: permissionIds,
      });

      console.log("✅ Customer role created");
    } else {
      customerRole.permissions = permissionIds;

      await customerRole.save();

      console.log("✅ Customer role updated");
    }

    // -------------------------------------------------
    // CUSTOMER USER
    // -------------------------------------------------

    const email = "customer@husseinmboyatours.com";

    const existingCustomer = await User.findOne({ email });

    if (existingCustomer) {
      console.log("ℹ️ Customer already exists");

      await mongoose.connection.close();
      return;
    }

    const customer = await User.create({
      name: "John Customer",

      email,

      password: "Customer@12345",

      phone: "",

      role: "customer",

      roleId: customerRole._id,

      legacyRole: "customer",

      status: "active",

      isVerified: true,
    });

    console.log("=================================");
    console.log("✅ CUSTOMER CREATED");
    console.log("Name:", customer.name);
    console.log("Email:", customer.email);
    console.log("Password:", "Customer@12345");
    console.log("Role:", customer.role);
    console.log("=================================");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ CUSTOMER SEED ERROR:", error);

    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

createCustomer();
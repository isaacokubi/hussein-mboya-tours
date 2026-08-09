import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

dotenv.config();

const createBookingAgent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

    // -------------------------------------------------
    // AGENT PERMISSIONS
    // -------------------------------------------------

    const permissionNames = [
      "create_bookings",
      "manage_customer_bookings",
      "view_tours",
      "view_destinations",
      "view_commissions",
      "view_wallet",
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

        console.log(`✅ Created permission: ${name}`);
      }

      permissionIds.push(permission._id);
    }

    // -------------------------------------------------
    // AGENT ROLE
    // -------------------------------------------------

    let agentRole = await Role.findOne({
      name: "agent",
    });

    if (!agentRole) {
      agentRole = await Role.create({
        name: "agent",
        displayName: "Travel Agent",
        permissions: permissionIds,
      });

      console.log("✅ Agent role created");
    } else {
      agentRole.permissions = permissionIds;

      await agentRole.save();

      console.log("✅ Agent role updated");
    }

    // -------------------------------------------------
    // AGENT USER
    // -------------------------------------------------

    const email = "agent@husseinmboyatours.com";

    const existingAgent = await User.findOne({ email });

    if (existingAgent) {
      console.log("ℹ️ Agent already exists");

      await mongoose.connection.close();
      return;
    }

    const agent = await User.create({
      name: "Booking Agent",

      email,

      password: "Agent@12345",

      phone: "",

      role: "agent",

      roleId: agentRole._id,

      legacyRole: "agent",

      status: "active",

      isVerified: true,
    });

    console.log("=================================");
    console.log("✅ BOOKING AGENT CREATED");
    console.log("Name:", agent.name);
    console.log("Email:", agent.email);
    console.log("Password:", "Agent@12345");
    console.log("Role:", agent.role);
    console.log("=================================");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ BOOKING AGENT SEED ERROR:", error);

    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

createBookingAgent();
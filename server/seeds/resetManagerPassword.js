import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";

dotenv.config();

const resetManagerPassword = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    const manager = await User.findOne({
      email: "manager@husseinmboyatours.com",
    });

    if (!manager) {
      throw new Error(
        "Tour Manager not found. Run seeds/tourManagerSeed.js first."
      );
    }

    const managerRole = await Role.findOne({
      name: "tour_manager",
    });

    if (!managerRole) {
      throw new Error(
        "tour_manager role not found. Run seeds/tourManagerSeed.js first."
      );
    }

    manager.password = "Manager@12345";

    manager.role = "tour_manager";
    manager.roleId = managerRole._id;
    manager.legacyRole = "tour_manager";

    manager.status = "active";
    manager.isVerified = true;

    manager.loginAttempts = 0;
    manager.lockUntil = null;

    await manager.save();

    console.log("\n======================================");
    console.log("TOUR MANAGER PASSWORD RESET");
    console.log("======================================");
    console.log("Email:    manager@husseinmboyatours.com");
    console.log("Password: Manager@12345");
    console.log("Role:     tour_manager");
    console.log("Role ID:  ", managerRole._id.toString());
    console.log("======================================\n");

  } catch (error) {
    console.error("Password reset failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    console.log("MongoDB connection closed");
  }
};

resetManagerPassword();

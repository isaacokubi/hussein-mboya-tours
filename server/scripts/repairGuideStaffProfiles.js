import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import Staff from "../models/Staff.js";

dotenv.config();

const permissionNames = [
  "view_assigned_tours",
  "view_tour_guests",
  "update_tour_status",
  "submit_tour_report",
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  let role = await Role.findOne({ name: "guide" });

  if (!role) {
    role = await Role.create({
      name: "guide",
      displayName: "Tour Guide",
      description: "Tour guide access",
      permissions: [],
      isSystem: true,
      status: "active",
      level: 2,
    });
  }

  const permissions = [];
  for (const name of permissionNames) {
    let permission = await Permission.findOne({ name });

    if (!permission) {
      permission = await Permission.create({
        name,
        label: name.replace(/_/g, " "),
        module: "guide",
        category: "other",
      });
    }

    permissions.push(permission._id);
  }

  role.permissions = permissions;
  role.status = "active";
  await role.save();

  const users = await User.find({
    role: {
      $in: ["guide", "tour_guide", "tourguide"],
    },
  });

  let repaired = 0;

  for (const user of users) {
    user.roleId = role._id;
    user.role = "tour_guide";
    user.legacyRole = "tour_guide";
    user.status = "active";
    await user.save();

    let staff = await Staff.findOne({
      $or: [
        { user: user._id },
        { email: user.email },
      ],
      position: "guide",
    });

    if (!staff) {
      staff = await Staff.create({
        user: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        position: "guide",
        role: "guide",
        status: "active",
        isActive: true,
        isDeleted: false,
        availability: "available",
        createdBy: user._id,
      });
    } else {
      staff.user = user._id;
      staff.name = user.name;
      staff.email = user.email;
      staff.phone = user.phone || staff.phone || "";
      staff.status = "active";
      staff.isActive = true;
      staff.isDeleted = false;
      await staff.save();
    }

    repaired += 1;
    console.log(`Repaired ${user.email} -> ${staff._id}`);
  }

  console.log(`Repaired ${repaired} guide account(s).`);
};

run()
  .catch((error) => {
    console.error("GUIDE DATA REPAIR FAILED:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });

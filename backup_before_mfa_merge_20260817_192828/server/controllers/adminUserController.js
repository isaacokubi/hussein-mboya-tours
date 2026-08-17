import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import bcrypt from "bcryptjs";

const STATUS_VALUES = [
  "active",
  "inactive",
  "disabled",
  "suspended",
  "blocked",
];

export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 100);
    const search = String(req.query.search || "").trim();
    const query = {};

    if (search) {
      const regex = { $regex: search, $options: "i" };
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { role: regex },
        { legacyRole: regex },
        { status: regex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .populate("roleId", "name displayName permissions")
        .sort({ createdAt: -1 })
        
        .lean(),
      User.countDocuments(query),
    ]);

    const data = users.map((user) => ({
      ...user,
      role: user.roleId?.name || user.role || user.legacyRole || "customer",
      isActive: user.status === "active",
    }));

    return res.json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      count: data.length,
      data,
      users: data,
      pagination: {
page,
limit,
total,
pages: Math.ceil(total / limit)
},
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CREATE STAFF ACCOUNT
|--------------------------------------------------------------------------
*/

export const createStaffAccount = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body || {};
    const normalizedRole = String(role || "").toLowerCase().replace(/[\s-]/g, "_");
    const allowed = {
      admin: "admin",
      manager: "tour_manager",
      tour_manager: "tour_manager",
      guide: "tour_guide",
      tour_guide: "tour_guide",
      driver: "driver",
      agent: "agent",
      travel_agent: "agent",
    };

    const canonicalRole = allowed[normalizedRole];
    if (!canonicalRole) {
      return res.status(400).json({
        success: false,
        message: "Choose admin, manager, agent, guide or driver.",
      });
    }

    if (!name?.trim() || !email?.trim() || !/^\d{10}$/.test(String(phone || "")) || String(password || "").length < 8) {
      return res.status(400).json({ success: false, message: "Name, email, 10-digit phone and an 8+ character password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: "A user with this email already exists." });
    }

    const permissionNamesByRole = {
      admin: [
        "admin.dashboard", "user.manage", "staff.manage", "tour.manage",
        "booking.manage", "payment.manage", "refund.manage",
        "analytics.view", "settings.manage", "roles.manage",
        "notifications.view", "finance.view",
      ],
      agent: [
        "booking.create", "booking.view", "customer.view", "commission.view",
        "view_agent_dashboard", "view_agent_tours", "create_agent_tour",
        "edit_agent_tour", "delete_agent_tour",
      ],
      tour_manager: [
        "tour.view", "tour.create", "tour.update", "booking.view",
        "booking.cancel", "tour.assign", "tour.availability", "calendar.manage",
        "customer.view", "guide.view", "vehicle.view", "report.view",
      ],
      tour_guide: [
        "tour.view", "view_assigned_tours", "view_tour_guests",
        "update_tour_status", "submit_tour_report",
      ],
      driver: ["tour.view", "view_assigned_tours"],
    };

    let roleDoc = await Role.findOne({
      name: { $in: [canonicalRole, canonicalRole.replace("tour_", "")] },
    });

    if (!roleDoc) {
      const names = permissionNamesByRole[canonicalRole] || [];
      const permissionIds = [];
      for (const name of names) {
        const permission = await (await import("../models/Permission.js")).default.findOneAndUpdate(
          { name },
          {
            $setOnInsert: {
              name,
              label: name.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              module: name.split(/[._]/)[0],
              category: "system",
              isActive: true,
            },
          },
          { upsert: true, new: true }
        );
        permissionIds.push(permission._id);
      }
      roleDoc = await Role.create({
        name: canonicalRole,
        displayName: canonicalRole.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: `${canonicalRole} access`,
        permissions: permissionIds,
        isSystem: ["admin", "tour_manager", "tour_guide", "driver"].includes(canonicalRole),
        level: canonicalRole === "admin" ? 100 : 20,
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password,
      role: canonicalRole,
      legacyRole: canonicalRole,
      roleId: roleDoc?._id || null,
      status: "active",
      isVerified: true,
    });

    let staff = null;
    let agent = null;

    if (canonicalRole === "agent") {
      agent = await Agent.create({
        user: user._id,
        companyName: "",
        phone: user.phone,
        email: user.email,
        commissionRate: 10,
        isApproved: false,
        status: "active",
      });
    }

    if (["tour_guide", "driver"].includes(canonicalRole)) {
      staff = await Staff.create({
        user: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        position: canonicalRole === "tour_guide" ? "guide" : "driver",
        role: canonicalRole === "tour_guide" ? "guide" : "driver",
        status: "active",
        isActive: true,
        availability: "available",
        createdBy: req.user._id,
      });
    }

    const safeUser = await User.findById(user._id)
      .select("-password")
      .populate("roleId", "name displayName permissions")
      .lean();

    return res.status(201).json({
      success: true,
      message: `${canonicalRole.replace("_", " ")} account created successfully.`,
      user: safeUser,
      staff,
      agent,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user status",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = {
      ...user,
      isActive: user.status === "active",
    };

    return res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      user: result,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

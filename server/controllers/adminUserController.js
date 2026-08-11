import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Staff from "../models/Staff.js";
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
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
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
        .skip((page - 1) * limit)
        .limit(limit)
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
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
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
    };

    const canonicalRole = allowed[normalizedRole];
    if (!canonicalRole) {
      return res.status(400).json({ success: false, message: "Choose admin, manager, guide or driver." });
    }

    if (!name?.trim() || !email?.trim() || !/^\d{10}$/.test(String(phone || "")) || String(password || "").length < 8) {
      return res.status(400).json({ success: false, message: "Name, email, 10-digit phone and an 8+ character password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: "A user with this email already exists." });
    }

    const roleDoc = await Role.findOne({
      name: { $in: [canonicalRole, canonicalRole.replace("tour_", "")] },
    });

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

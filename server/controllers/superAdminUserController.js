import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";

const STATUS_VALUES = ["active", "inactive", "disabled", "suspended", "blocked"];
const ROLE_MAP = {
  admin: "admin", administrator: "admin",
  manager: "manager", tour_manager: "manager", "tour manager": "manager",
  tour_guide: "tour_guide", guide: "tour_guide", "tour guide": "tour_guide",
  driver: "driver", agent: "agent", travel_agent: "agent", "travel agent": "agent",
  customer: "customer",
};

const normalizeRole = (value) => ROLE_MAP[String(value || "").toLowerCase().replace(/-/g, "_")] || null;

export const getSuperAdminUsers = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);
    const search = String(req.query.search || "").trim();
    const query = {};
    if (search) {
      const regex = { $regex: search, $options: "i" };
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }, { role: regex }, { legacyRole: regex }, { status: regex }];
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select("-password").populate("roleId", "name displayName permissions").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);
    const data = users.map((user) => ({
      ...user,
      role: user.roleId?.name || user.role || user.legacyRole || "customer",
      status: user.status || "active",
      isActive: (user.status || "active") === "active",
    }));
    return res.json({ success: true, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)), count: data.length, users: data, data });
  } catch (error) { next(error); }
};

export const createSuperAdminCompanyAccount = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body || {};
    const canonicalRole = normalizeRole(role);
    if (!canonicalRole) return res.status(400).json({ success: false, message: "Choose a valid company account role." });
    if (!name?.trim() || !email?.trim() || !/^\d{10}$/.test(String(phone || ""))) return res.status(400).json({ success: false, message: "Name, email and a 10-digit phone are required." });
    if (String(password || "").length < 12 || !/[A-Z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ success: false, message: "Password must be at least 12 characters and include an uppercase letter and a number." });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, message: "A user with this email already exists." });

    const roleDoc = await Role.findOne({ name: canonicalRole });
    if (!roleDoc) return res.status(400).json({ success: false, message: `System role '${canonicalRole}' is not configured.` });

    const user = await User.create({ name: name.trim(), email: normalizedEmail, phone: String(phone).trim(), password, role: canonicalRole, legacyRole: canonicalRole, roleId: roleDoc._id, status: "active", isVerified: true });
    let staff = null;
    let agent = null;
    if (["tour_guide", "driver"].includes(canonicalRole)) {
      staff = await Staff.create({ user: user._id, name: user.name, email: user.email, phone: user.phone, position: canonicalRole === "tour_guide" ? "guide" : "driver", role: canonicalRole === "tour_guide" ? "guide" : "driver", status: "active", isActive: true, availability: "available", createdBy: req.user?._id });
    }
    if (canonicalRole === "agent") agent = await Agent.create({ user: user._id, companyName: "", phone: user.phone, email: user.email, commissionRate: 10, isApproved: false, status: "active" });
    const safeUser = await User.findById(user._id).select("-password").populate("roleId", "name displayName permissions").lean();
    return res.status(201).json({ success: true, message: "Company account created successfully.", user: safeUser, staff, agent });
  } catch (error) { next(error); }
};

export const updateSuperAdminUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });
    if (!STATUS_VALUES.includes(status)) return res.status(400).json({ success: false, message: "Invalid user status" });
    const user = await User.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true }).select("-password").lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, message: `User status changed to ${status}`, user, data: user });
  } catch (error) { next(error); }
};

export const deleteSuperAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });
    if (String(req.user?._id) === String(id)) return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    const user = await User.findById(id).select("_id role legacyRole");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (["super_admin", "superadmin"].includes(String(user.role || user.legacyRole || "").toLowerCase())) return res.status(403).json({ success: false, message: "SuperAdmin accounts cannot be deleted." });
    await Promise.all([Staff.deleteMany({ user: user._id }), Agent.deleteMany({ user: user._id }), User.deleteOne({ _id: user._id })]);
    return res.json({ success: true, deleted: true, message: "User account deleted successfully." });
  } catch (error) { next(error); }
};

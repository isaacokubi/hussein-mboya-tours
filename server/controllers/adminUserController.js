import { requireTenantId } from "../tenancy/context.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import { ensureSystemRoles } from "../services/onboardingService.js";

const STATUS_VALUES = ["active", "inactive", "disabled", "suspended", "blocked"];

const isDuplicateKeyError = (error) => error?.code === 11000;

const duplicateMessage = (error) => {
  const key = Object.keys(error?.keyPattern || {})[0];
  if (key === "tenantId") return "A tenant index conflict was detected. Run the tenant index reconciliation before creating staff accounts.";
  if (key === "email") return "A user or staff account with this email already exists for this company.";
  if (key === "phone") return "A user with this phone number already exists.";
  return "A record with these details already exists.";
};

export const getUsers = async (req, res, next) => {
  requireTenantId();
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
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
    const pages = Math.max(1, Math.ceil(total / limit));
    const data = users.map((user) => ({ ...user, role: user.roleId?.name || user.role || user.legacyRole || "customer", isActive: user.status === "active" }));
    return res.json({ success: true, page, limit, total, pages, count: data.length, data, users: data, pagination: { page, limit, total, pages } });
  } catch (error) { next(error); }
};

export const createStaffAccount = async (req, res, next) => {
  let createdUser = null;
  let createdStaff = null;
  let createdAgent = null;

  try {
    const tenantId = requireTenantId();
    if (!tenantId) return res.status(400).json({ success: false, message: "Select a company before creating a staff account." });

    const { name, email, phone, password, role } = req.body || {};
    const normalizedRole = String(role || "").toLowerCase().replace(/[\s-]/g, "_");
    const allowed = { admin: "admin", manager: "manager", tour_manager: "manager", guide: "tour_guide", tour_guide: "tour_guide", driver: "driver", agent: "agent", travel_agent: "agent" };
    const canonicalRole = allowed[normalizedRole];
    if (!canonicalRole) return res.status(400).json({ success: false, message: "Choose admin, manager, agent, guide or driver." });
    if (!name?.trim() || !email?.trim() || !/^\d{10}$/.test(String(phone || ""))) return res.status(400).json({ success: false, message: "Name, email and a 10-digit phone are required." });
    if (String(password || "").length < 12 || !/[A-Z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ success: false, message: "Password must be at least 12 characters and include an uppercase letter and a number." });

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).select("_id role tenantId").lean();
    if (existingUser) return res.status(409).json({ success: false, message: "A user with this email already exists for this company." });

    if (["tour_guide", "driver"].includes(canonicalRole)) {
      const existingStaff = await Staff.findOne({ email: normalizedEmail }).select("_id user position").lean();
      if (existingStaff) return res.status(409).json({ success: false, message: "A staff profile with this email already exists for this company." });
    }

    const permissionNamesByRole = {
      admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage", "notifications.view", "finance.view", "customer.view", "tour.view", "tour.create", "tour.update", "booking.view", "report.view", "guide.view", "vehicle.view"],
      agent: ["booking.create", "booking.view", "customer.view", "commission.view", "view_agent_dashboard", "view_agent_tours", "create_agent_tour", "edit_agent_tour", "delete_agent_tour"],
      manager: ["tour.view", "tour.create", "tour.update", "booking.view", "booking.cancel", "tour.assign", "tour.availability", "calendar.manage", "customer.view", "guide.view", "vehicle.view", "report.view"],
      tour_guide: ["tour.view", "view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"],
      driver: ["tour.view", "view_assigned_tours"],
    };

    if (canonicalRole === "admin") await ensureSystemRoles();

    let roleDoc = await Role.findOne({ name: { $in: [canonicalRole, canonicalRole.replace("tour_", "")] } });
    if (!roleDoc) {
      const permissionIds = [];
      for (const permissionName of permissionNamesByRole[canonicalRole] || []) {
        const Permission = (await import("../models/Permission.js")).default;
        const permission = await Permission.findOneAndUpdate(
          { name: permissionName },
          { $setOnInsert: { name: permissionName, label: permissionName.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), module: permissionName.split(/[._]/)[0], category: "system", isActive: true } },
          { upsert: true, new: true }
        );
        permissionIds.push(permission._id);
      }
      roleDoc = await Role.create({ name: canonicalRole, displayName: canonicalRole.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), description: `${canonicalRole} access`, permissions: permissionIds, isSystem: ["admin", "manager", "tour_guide", "driver", "agent", "customer"].includes(canonicalRole), level: canonicalRole === "admin" ? 100 : 20 });
    }

    if (["super_admin", "superadmin"].includes(roleDoc.name)) return res.status(403).json({ success: false, message: "SuperAdmin accounts can only be created through the one-time platform bootstrap process." });

    // The tenant is supplied explicitly as well as being enforced by the tenant
    // plugin. This makes the write deterministic and protects it from partial
    // tenant context during account creation.
    createdUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password,
      role: canonicalRole,
      legacyRole: canonicalRole,
      roleId: roleDoc._id,
      tenantId,
      status: "active",
      isVerified: true,
    });

    if (canonicalRole === "agent") {
      createdAgent = await Agent.create({ user: createdUser._id, tenantId, companyName: "", phone: createdUser.phone, email: createdUser.email, commissionRate: 10, isApproved: false, status: "active" });
    }

    if (["tour_guide", "driver"].includes(canonicalRole)) {
      createdStaff = await Staff.create({ user: createdUser._id, tenantId, name: createdUser.name, email: createdUser.email, phone: createdUser.phone, position: canonicalRole === "tour_guide" ? "guide" : "driver", role: canonicalRole === "tour_guide" ? "guide" : "driver", status: "active", isActive: true, availability: "available", createdBy: req.user._id });
    }

    const safeUser = await User.findById(createdUser._id).select("-password").populate("roleId", "name displayName permissions").lean();
    return res.status(201).json({ success: true, message: `${canonicalRole.replace("_", " ")} account created successfully.`, user: safeUser, staff: createdStaff, agent: createdAgent });
  } catch (error) {
    // Never leave a login account behind when its staff/agent profile failed.
    // The old implementation created User first and returned 500 after Staff
    // failed, so the next click appeared to create duplicates.
    if (createdUser?._id) {
      try {
        await Promise.allSettled([
          createdStaff?._id ? Staff.deleteOne({ _id: createdStaff._id }) : Promise.resolve(),
          createdAgent?._id ? Agent.deleteOne({ _id: createdAgent._id }) : Promise.resolve(),
          User.deleteOne({ _id: createdUser._id }),
        ]);
      } catch { /* preserve the original error */ }
    }

    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ success: false, message: duplicateMessage(error) });
    }
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });
    if (!STATUS_VALUES.includes(status)) return res.status(400).json({ success: false, message: "Invalid user status" });
    const user = await User.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true }).select("-password").lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const result = { ...user, isActive: user.status === "active" };
    return res.status(200).json({ success: true, message: `User status changed to ${status}`, user: result, data: result });
  } catch (error) { next(error); }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });
    if (String(req.user?._id) === String(id)) return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    const user = await User.findById(id).select("_id role");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase())) return res.status(403).json({ success: false, message: "SuperAdmin accounts cannot be deleted." });
    await Promise.all([Staff.deleteMany({ user: user._id }), Agent.deleteMany({ user: user._id }), User.deleteOne({ _id: user._id })]);
    return res.json({ success: true, deleted: true, message: "User account deleted successfully." });
  } catch (error) { next(error); }
};

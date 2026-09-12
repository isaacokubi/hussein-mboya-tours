import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Staff from "../models/Staff.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

const duplicateMessage = (error) => {
  const key = Object.keys(error?.keyPattern || {})[0];
  if (key === "email") return "A staff member with this email already exists for this company.";
  if (key === "phone") return "A staff member with this phone number already exists for this company.";
  if (key === "user") return "This user already has a staff profile.";
  return "A staff record with these details already exists.";
};

const roleToStaffIdentity = (role) => {
  const normalized = String(role || "").toLowerCase().replace(/[\s-]/g, "_");
  const map = {
    admin: { position: "admin", role: "admin" },
    manager: { position: "tour_manager", role: "manager" },
    tour_manager: { position: "tour_manager", role: "manager" },
    tour_guide: { position: "guide", role: "guide" },
    guide: { position: "guide", role: "guide" },
    driver: { position: "driver", role: "driver" },
    support: { position: "support", role: "support" },
  };
  return map[normalized] || null;
};

const ensureManagerStaffProfiles = async (req) => {
  const tenantId = requireTenantId();
  const managerUsers = await User.find({
    tenantId,
    status: "active",
    $or: [{ role: "manager" }, { role: "tour_manager" }, { legacyRole: "manager" }, { legacyRole: "tour_manager" }],
  }).select("_id name email phone").lean();
  if (!managerUsers.length) return;

  const userIds = managerUsers.map((user) => user._id);
  const existing = await Staff.find({ tenantId, user: { $in: userIds } }).select("user").lean();
  const existingIds = new Set(existing.filter((staff) => staff.user).map((staff) => String(staff.user)));
  const missing = managerUsers.filter((user) => !existingIds.has(String(user._id)));
  if (!missing.length) return;

  await Promise.all(missing.map((user) => Staff.create({
    user: user._id,
    tenantId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    position: "tour_manager",
    role: "manager",
    status: "active",
    isActive: true,
    availability: "available",
    createdBy: req.user?._id,
  }).catch(async (error) => {
    if (error?.code !== 11000) throw error;
  })));
};

const synchronizeStaffIdentities = async (staff) => {
  if (!staff.length) return staff;
  const userIds = staff.map((member) => member.user).filter(Boolean);
  if (!userIds.length) return staff;
  const users = await User.find({ _id: { $in: userIds } }).select("_id role legacyRole roleId").populate("roleId", "name").lean();
  const userMap = new Map(users.map((user) => [String(user._id), user]));
  await Promise.all(staff.map(async (member) => {
    const user = userMap.get(String(member.user));
    const canonical = roleToStaffIdentity(user?.roleId?.name || user?.role || user?.legacyRole);
    if (!canonical || (member.position === canonical.position && member.role === canonical.role)) return;
    member.position = canonical.position;
    member.role = canonical.role;
    await Staff.updateOne({ _id: member._id }, { $set: canonical });
  }));
  return staff;
};

export const createStaff = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    if (!body.name?.trim() || !email || !phone || !body.position) return res.status(400).json({ success: false, message: "Name, email, phone and position are required." });
    const existing = await Staff.findOne(mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: [{ email }, { phone }, ...(body.user ? [{ user: body.user }] : [])] })).select("_id email phone user position").lean();
    if (existing) {
      const field = String(existing.email).toLowerCase() === email ? "email" : String(existing.phone) === phone ? "phone number" : "user account";
      return res.status(409).json({ success: false, message: `A staff member with this ${field} already exists for this company.` });
    }
    const requestedIdentity = roleToStaffIdentity(body.role || body.position);
    const staff = await Staff.create({ ...body, tenantId, email, phone, ...(requestedIdentity || {}) });
    return res.status(201).json({ success: true, message: "Staff created successfully", data: staff });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: duplicateMessage(error) });
    next(error);
  }
};

export const getStaff = async (req, res, next) => {
  try {
    await ensureManagerStaffProfiles(req);
    const { position, availability, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else {
      const role = String(req.user?.roleId?.name || req.user?.role || "").toLowerCase().replace(/[\s_-]/g, "");
      const includeInactive = role === "admin" && String(req.query.includeInactive || "").toLowerCase() === "true";
      if (!includeInactive) filter.isActive = true;
    }
    if (position) filter.position = position === "guide" ? { $in: ["guide", "tour_guide", "tourguide"] } : position === "driver" ? { $in: ["driver", "tour_driver"] } : position;
    if (availability) filter.availability = availability;
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }, { position: { $regex: search, $options: "i" } }, { status: { $regex: search, $options: "i" } }];
    const scopedFilter = mergeTenantFilter(req, filter);
    const skip = Math.max(Number(page) - 1, 0) * Number(limit);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const [staff, total] = await Promise.all([
      Staff.find(scopedFilter).populate("assignedTours", "title startDate endDate tourStatus").sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      Staff.countDocuments(scopedFilter),
    ]);
    await synchronizeStaffIdentities(staff);
    return res.status(200).json({ success: true, pagination: { total, page: Number(page), limit: safeLimit, pages: Math.max(1, Math.ceil(total / safeLimit)) }, data: staff });
  } catch (error) { next(error); }
};

export const getStaffById = async (req, res, next) => {
  try {
    const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("assignedTours", "title startDate endDate tourStatus");
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    await synchronizeStaffIdentities([staff]);
    return res.status(200).json({ success: true, data: staff });
  } catch (error) { next(error); }
};

export const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    if (req.body.email) {
      const email = String(req.body.email).trim().toLowerCase();
      const duplicate = await Staff.findOne(mergeTenantFilter(req, { _id: { $ne: staff._id }, isDeleted: { $ne: true }, email })).select("_id").lean();
      if (duplicate) return res.status(409).json({ success: false, message: "A staff member with this email already exists for this company." });
      req.body.email = email;
    }
    if (req.body.phone) {
      const phone = String(req.body.phone).trim();
      const duplicate = await Staff.findOne(mergeTenantFilter(req, { _id: { $ne: staff._id }, isDeleted: { $ne: true }, phone })).select("_id").lean();
      if (duplicate) return res.status(409).json({ success: false, message: "A staff member with this phone number already exists for this company." });
      req.body.phone = phone;
    }
    const requestedIdentity = roleToStaffIdentity(req.body.role || req.body.position);
    Object.assign(staff, req.body, requestedIdentity || {});
    await staff.save();
    if (staff.user) {
      const user = await User.findOne(mergeTenantFilter(req, { _id: staff.user }));
      const userRole = roleToStaffIdentity(staff.role || staff.position);
      if (user && userRole) {
        const roleDoc = await Role.findOne({ name: userRole.role }).select("_id name").lean();
        user.role = userRole.role;
        user.legacyRole = userRole.role;
        if (roleDoc) user.roleId = roleDoc._id;
        await user.save();
      }
    }
    return res.status(200).json({ success: true, message: "Staff updated successfully", data: staff });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: duplicateMessage(error) });
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const filter = mergeTenantFilter(req, { _id: req.params.id });
    const staff = await Staff.findOne(filter).select("_id name").lean();
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    const result = await Staff.deleteOne(filter);
    if (result.deletedCount !== 1) return res.status(409).json({ success: false, message: "Staff member could not be deleted. Please refresh and try again." });
    return res.status(200).json({ success: true, message: "Staff member permanently deleted", data: { id: staff._id } });
  } catch (error) { next(error); }
};

export const restoreStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { isActive: true, status: "active", availability: "available", isDeleted: false }, { new: true });
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    return res.status(200).json({ success: true, message: "Staff restored successfully", data: staff });
  } catch (error) { next(error); }
};

export const getGuides = async (req, res, next) => {
  try {
    const guides = await Staff.find(mergeTenantFilter(req, { position: { $in: ["guide", "tour_guide", "tourguide"] }, isActive: true, isDeleted: { $ne: true }, status: "active" })).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: guides.length, data: guides });
  } catch (error) { next(error); }
};

export const getDrivers = async (req, res, next) => {
  try {
    const drivers = await Staff.find(mergeTenantFilter(req, { position: { $in: ["driver", "tour_driver"] }, isActive: true, isDeleted: { $ne: true }, status: "active" })).populate("assignedTours", "title startDate endDate").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (error) { next(error); }
};

export const updateStaffAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    if (!availability) return res.status(400).json({ success: false, message: "Availability is required" });
    const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { availability }, { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    return res.status(200).json({ success: true, message: "Availability updated successfully", data: staff });
  } catch (error) { next(error); }
};
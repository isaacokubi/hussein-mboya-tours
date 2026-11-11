/**
 * Purpose: staff Controller HTTP controller. Main declarations: duplicateMessage, roleToStaffIdentity, ensureManagerStaffProfiles, synchronizeStaffIdentities, createStaff.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";

// Declare duplicateMessage for use by the surrounding module or function.
const duplicateMessage = (error) => {
  // Declare key for use by the surrounding module or function.
  const key = Object.keys(error?.keyPattern || {})[0];
  // Check the condition (key === "email") and run the matching branch.
  if (key === "email") return "A staff member with this email already exists for this company.";
  // Check the condition (key === "phone") and run the matching branch.
  if (key === "phone") return "A staff member with this phone number already exists for this company.";
  // Check the condition (key === "user") and run the matching branch.
  if (key === "user") return "This user already has a staff profile.";
  // Return a configured text value to the caller.
  return "A staff record with these details already exists.";
};

// Declare roleToStaffIdentity for use by the surrounding module or function.
const roleToStaffIdentity = (role) => {
  // Declare normalized for use by the surrounding module or function.
  const normalized = String(role || "").toLowerCase().replace(/[\s-]/g, "_");
  // Declare map for use by the surrounding module or function.
  const map = {
    admin: { position: "admin", role: "admin" },
    manager: { position: "tour_manager", role: "manager" },
    tour_manager: { position: "tour_manager", role: "manager" },
    tour_guide: { position: "guide", role: "guide" },
    guide: { position: "guide", role: "guide" },
    driver: { position: "driver", role: "driver" },
    support: { position: "support", role: "support" },
  };
  // Return the expression shown below to the caller.
  return map[normalized] || null;
};

// Declare ensureManagerStaffProfiles for use by the surrounding module or function.
const ensureManagerStaffProfiles = async (req) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Declare managerUsers for use by the surrounding module or function.
  const managerUsers = await User.find({
    tenantId,
    status: "active",
    $or: [{ role: "manager" }, { role: "tour_manager" }, { legacyRole: "manager" }, { legacyRole: "tour_manager" }],
  }).select("_id name email phone").lean();
  // Check the condition (!managerUsers.length) and run the matching branch.
  if (!managerUsers.length) return;

  // Declare userIds for use by the surrounding module or function.
  const userIds = managerUsers.map((user) => user._id);
  // Declare existing for use by the surrounding module or function.
  const existing = await Staff.find({ tenantId, user: { $in: userIds } }).select("user").lean();
  // Declare existingIds for use by the surrounding module or function.
  const existingIds = new Set(existing.filter((staff) => staff.user).map((staff) => String(staff.user)));
  // Declare missing for use by the surrounding module or function.
  const missing = managerUsers.filter((user) => !existingIds.has(String(user._id)));
  // Check the condition (!missing.length) and run the matching branch.
  if (!missing.length) return;

  // Perform the side effect or state update expressed on the following line.
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
    // Check the condition (error?.code !== 11000) and run the matching branch.
    if (error?.code !== 11000) throw error;
  })));
};

// Declare synchronizeStaffIdentities for use by the surrounding module or function.
const synchronizeStaffIdentities = async (staff, tenantId) => {
  // Check the condition (!staff.length || !tenantId) and run the matching branch.
  if (!staff.length || !tenantId) return staff;
  // Declare userIds for use by the surrounding module or function.
  const userIds = staff.map((member) => member.user).filter(Boolean);
  // Check the condition (!userIds.length) and run the matching branch.
  if (!userIds.length) return staff;
  // Declare users for use by the surrounding module or function.
  const users = await User.find({ tenantId, _id: { $in: userIds } }).select("_id role legacyRole roleId").populate("roleId", "name").lean();
  // Declare userMap for use by the surrounding module or function.
  const userMap = new Map(users.map((user) => [String(user._id), user]));
  // Perform the side effect or state update expressed on the following line.
  await Promise.all(staff.map(async (member) => {
    // Declare user for use by the surrounding module or function.
    const user = userMap.get(String(member.user));
    // Declare canonical for use by the surrounding module or function.
    const canonical = roleToStaffIdentity(user?.roleId?.name || user?.role || user?.legacyRole);
    // Check the condition (!canonical || (member.position === canonical.position && member.role =) and run the matching branch.
    if (!canonical || (member.position === canonical.position && member.role === canonical.role)) return;
    // Perform the side effect or state update expressed on the following line.
    member.position = canonical.position;
    // Perform the side effect or state update expressed on the following line.
    member.role = canonical.role;
    // Perform the side effect or state update expressed on the following line.
    await Staff.updateOne({ _id: member._id, tenantId }, { $set: canonical });
  }));
  // Return the value of staff to the caller.
  return staff;
};

// Declare createStaff for use by the surrounding module or function.
export const createStaff = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare body for use by the surrounding module or function.
    const body = req.body || {};
    // Declare email for use by the surrounding module or function.
    const email = String(body.email || "").trim().toLowerCase();
    // Declare phone for use by the surrounding module or function.
    const phone = String(body.phone || "").trim();
    // Check the condition (!body.name?.trim() || !email || !phone || !body.position) and run the matching branch.
    if (!body.name?.trim() || !email || !phone || !body.position) return res.status(400).json({ success: false, message: "Name, email, phone and position are required." });
    // Declare existing for use by the surrounding module or function.
    const existing = await Staff.findOne(mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: [{ email }, { phone }, ...(body.user ? [{ user: body.user }] : [])] })).select("_id email phone user position").lean();
    // Check the condition (existing) and run the matching branch.
    if (existing) {
      // Declare field for use by the surrounding module or function.
      const field = String(existing.email).toLowerCase() === email ? "email" : String(existing.phone) === phone ? "phone number" : "user account";
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: `A staff member with this ${field} already exists for this company.` });
    }
    // Declare requestedIdentity for use by the surrounding module or function.
    const requestedIdentity = roleToStaffIdentity(body.role || body.position);
    // Declare staff for use by the surrounding module or function.
    const staff = await Staff.create({ ...body, tenantId, email, phone, ...(requestedIdentity || {}) });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, message: "Staff created successfully", data: staff });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return res.status(409).json({ success: false, message: duplicateMessage(error) });
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getStaff for use by the surrounding module or function.
export const getStaff = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await ensureManagerStaffProfiles(req);
    // Declare { position, availability, status, search, page = 1, limit = 20 } for use by the surrounding module or function.
    const { position, availability, status, search, page = 1, limit = 20 } = req.query;
    // Declare filter for use by the surrounding module or function.
    const filter = {};
    // Check the condition (status) and run the matching branch.
    if (status) filter.status = status;
    else {
      // Declare role for use by the surrounding module or function.
      const role = String(req.user?.roleId?.name || req.user?.role || "").toLowerCase().replace(/[\s_-]/g, "");
      // Declare includeInactive for use by the surrounding module or function.
      const includeInactive = role === "admin" && String(req.query.includeInactive || "").toLowerCase() === "true";
      // Check the condition (!includeInactive) and run the matching branch.
      if (!includeInactive) filter.isActive = true;
    }
    // Check the condition (position) and run the matching branch.
    if (position) filter.position = position === "guide" ? { $in: ["guide", "tour_guide", "tourguide"] } : position === "driver" ? { $in: ["driver", "tour_driver"] } : position;
    // Check the condition (availability) and run the matching branch.
    if (availability) filter.availability = availability;
    // Check the condition (search) and run the matching branch.
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }, { position: { $regex: search, $options: "i" } }, { status: { $regex: search, $options: "i" } }];
    // Declare scopedFilter for use by the surrounding module or function.
    const scopedFilter = mergeTenantFilter(req, filter);
    // Declare skip for use by the surrounding module or function.
    const skip = Math.max(Number(page) - 1, 0) * Number(limit);
    // Declare safeLimit for use by the surrounding module or function.
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    // Declare [staff, total] for use by the surrounding module or function.
    const [staff, total] = await Promise.all([
      Staff.find(scopedFilter).populate("assignedTours", "title startDate endDate tourStatus").sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      Staff.countDocuments(scopedFilter),
    ]);
    // Perform the side effect or state update expressed on the following line.
    await synchronizeStaffIdentities(staff, requireTenantId());
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, pagination: { total, page: Number(page), limit: safeLimit, pages: Math.max(1, Math.ceil(total / safeLimit)) }, data: staff });
  } catch (error) { next(error); }
};

// Declare getStaffById for use by the surrounding module or function.
export const getStaffById = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare staff for use by the surrounding module or function.
    const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("assignedTours", "title startDate endDate tourStatus");
    // Check the condition (!staff) and run the matching branch.
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    // Perform the side effect or state update expressed on the following line.
    await synchronizeStaffIdentities([staff], requireTenantId());
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: staff });
  } catch (error) { next(error); }
};

// Declare updateStaff for use by the surrounding module or function.
export const updateStaff = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare staff for use by the surrounding module or function.
    const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!staff) and run the matching branch.
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    // Check the condition (req.body.email) and run the matching branch.
    if (req.body.email) {
      // Declare email for use by the surrounding module or function.
      const email = String(req.body.email).trim().toLowerCase();
      // Declare duplicate for use by the surrounding module or function.
      const duplicate = await Staff.findOne(mergeTenantFilter(req, { _id: { $ne: staff._id }, isDeleted: { $ne: true }, email })).select("_id").lean();
      // Check the condition (duplicate) and run the matching branch.
      if (duplicate) return res.status(409).json({ success: false, message: "A staff member with this email already exists for this company." });
      // Perform the side effect or state update expressed on the following line.
      req.body.email = email;
    }
    // Check the condition (req.body.phone) and run the matching branch.
    if (req.body.phone) {
      // Declare phone for use by the surrounding module or function.
      const phone = String(req.body.phone).trim();
      // Declare duplicate for use by the surrounding module or function.
      const duplicate = await Staff.findOne(mergeTenantFilter(req, { _id: { $ne: staff._id }, isDeleted: { $ne: true }, phone })).select("_id").lean();
      // Check the condition (duplicate) and run the matching branch.
      if (duplicate) return res.status(409).json({ success: false, message: "A staff member with this phone number already exists for this company." });
      // Perform the side effect or state update expressed on the following line.
      req.body.phone = phone;
    }
    // Declare requestedIdentity for use by the surrounding module or function.
    const requestedIdentity = roleToStaffIdentity(req.body.role || req.body.position);
    // Perform the side effect or state update expressed on the following line.
    Object.assign(staff, req.body, requestedIdentity || {});
    // Perform the side effect or state update expressed on the following line.
    await staff.save();
    // Check the condition (staff.user) and run the matching branch.
    if (staff.user) {
      // Declare user for use by the surrounding module or function.
      const user = await User.findOne(mergeTenantFilter(req, { _id: staff.user }));
      // Declare userRole for use by the surrounding module or function.
      const userRole = roleToStaffIdentity(staff.role || staff.position);
      // Check the condition (user && userRole) and run the matching branch.
      if (user && userRole) {
        // Declare roleDoc for use by the surrounding module or function.
        const roleDoc = await Role.findOne(mergeTenantFilter(req, { name: userRole.role })).select("_id name").lean();
        // Perform the side effect or state update expressed on the following line.
        user.role = userRole.role;
        // Perform the side effect or state update expressed on the following line.
        user.legacyRole = userRole.role;
        // Check the condition (roleDoc) and run the matching branch.
        if (roleDoc) user.roleId = roleDoc._id;
        // Perform the side effect or state update expressed on the following line.
        await user.save();
      }
    }
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Staff updated successfully", data: staff });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return res.status(409).json({ success: false, message: duplicateMessage(error) });
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare deleteStaff for use by the surrounding module or function.
export const deleteStaff = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter(req, { _id: req.params.id });
    // Declare staff for use by the surrounding module or function.
    const staff = await Staff.findOne(filter).select("_id name").lean();
    // Check the condition (!staff) and run the matching branch.
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    // Declare result for use by the surrounding module or function.
    const result = await Staff.deleteOne(filter);
    // Check the condition (result.deletedCount !== 1) and run the matching branch.
    if (result.deletedCount !== 1) return res.status(409).json({ success: false, message: "Staff member could not be deleted. Please refresh and try again." });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Staff member permanently deleted", data: { id: staff._id } });
  } catch (error) { next(error); }
};

// Declare restoreStaff for use by the surrounding module or function.
export const restoreStaff = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare staff for use by the surrounding module or function.
    const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { isActive: true, status: "active", availability: "available", isDeleted: false }, { new: true });
    // Check the condition (!staff) and run the matching branch.
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Staff restored successfully", data: staff });
  } catch (error) { next(error); }
};

// Declare getGuides for use by the surrounding module or function.
export const getGuides = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare guides for use by the surrounding module or function.
    const guides = await Staff.find(mergeTenantFilter(req, { position: { $in: ["guide", "tour_guide", "tourguide"] }, isActive: true, isDeleted: { $ne: true }, status: "active" })).sort({ createdAt: -1 });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: guides.length, data: guides });
  } catch (error) { next(error); }
};

// Declare getDrivers for use by the surrounding module or function.
export const getDrivers = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare drivers for use by the surrounding module or function.
    const drivers = await Staff.find(mergeTenantFilter(req, { position: { $in: ["driver", "tour_driver"] }, isActive: true, isDeleted: { $ne: true }, status: "active" })).populate("assignedTours", "title startDate endDate").sort({ createdAt: -1 });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (error) { next(error); }
};

// Declare updateStaffAvailability for use by the surrounding module or function.
export const updateStaffAvailability = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { availability } for use by the surrounding module or function.
    const { availability } = req.body;
    // Check the condition (!availability) and run the matching branch.
    if (!availability) return res.status(400).json({ success: false, message: "Availability is required" });
    // Declare staff for use by the surrounding module or function.
    const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { availability }, { new: true, runValidators: true });
    // Check the condition (!staff) and run the matching branch.
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Availability updated successfully", data: staff });
  } catch (error) { next(error); }
};
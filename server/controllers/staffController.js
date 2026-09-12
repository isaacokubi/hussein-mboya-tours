import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Staff from "../models/Staff.js";

const duplicateMessage = (error) => {
  const key = Object.keys(error?.keyPattern || {})[0];
  if (key === "email") return "A staff member with this email already exists for this company.";
  if (key === "phone") return "A staff member with this phone number already exists for this company.";
  if (key === "user") return "This user already has a staff profile.";
  return "A staff record with these details already exists.";
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
    const staff = await Staff.create({ ...body, tenantId, email, phone });
    return res.status(201).json({ success: true, message: "Staff created successfully", data: staff });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: duplicateMessage(error) });
    next(error);
  }
};

export const getStaff = async (req, res, next) => {
  try {
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
    return res.status(200).json({ success: true, pagination: { total, page: Number(page), limit: safeLimit, pages: Math.max(1, Math.ceil(total / safeLimit)) }, data: staff });
  } catch (error) { next(error); }
};

export const getStaffById = async (req, res, next) => {
  try {
    const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("assignedTours", "title startDate endDate tourStatus");
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
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
    Object.assign(staff, req.body);
    await staff.save();
    return res.status(200).json({ success: true, message: "Staff updated successfully", data: staff });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: duplicateMessage(error) });
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { isActive: false, status: "inactive", availability: "offline", isDeleted: true }, { new: true });
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    return res.status(200).json({ success: true, message: "Staff removed successfully" });
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
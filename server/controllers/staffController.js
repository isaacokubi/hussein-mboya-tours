import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// server/controllers/staffController.js

import Staff from "../models/Staff.js";

export const createStaff = async (req, res, next) => {
  requireTenantId();
  try {
    const tenantId = requireTenantId();
    const staff = await Staff.create({ ...req.body, tenantId });
    return res.status(201).json({ success: true, message: "Staff created successfully", data: staff });
  } catch (error) { next(error); }
};

export const getStaff = async (req, res, next) => {
  requireTenantId();
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
    if (search) filter.$or = ["name", "email", "phone", "position", "status"].map((field) => ({ [field]: { $regex: search, $options: "i" } }));
    const tenantFilter = mergeTenantFilter(req, filter);
    const skip = (Number(page) - 1) * Number(limit);
    const [staff, total] = await Promise.all([
      Staff.find(tenantFilter).populate("assignedTours", "title startDate endDate tourStatus").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Staff.countDocuments(tenantFilter),
    ]);
    return res.status(200).json({ success: true, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, data: staff });
  } catch (error) { next(error); }
};

export const getStaffById = async (req, res, next) => {
  requireTenantId();
  try {
    const staff = await Staff.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("assignedTours", "title startDate endDate tourStatus");
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    return res.status(200).json({ success: true, data: staff });
  } catch (error) { next(error); }
};

export const updateStaff = async (req, res, next) => {
  requireTenantId();
  try {
    const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), req.body, { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    return res.status(200).json({ success: true, message: "Staff updated successfully", data: staff });
  } catch (error) { next(error); }
};

export const deleteStaff = async (req, res, next) => {
  requireTenantId();
  try {
    const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { isActive: false, status: "inactive", availability: "unavailable" }, { new: true });
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    return res.status(200).json({ success: true, message: "Staff removed successfully" });
  } catch (error) { next(error); }
};

export const restoreStaff = async (req, res, next) => {
  requireTenantId();
  try {
    const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { isActive: true, status: "active", availability: "available" }, { new: true });
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    return res.status(200).json({ success: true, message: "Staff restored successfully", data: staff });
  } catch (error) { next(error); }
};

export const getGuides = async (req, res, next) => {
  requireTenantId();
  try {
    const guides = await Staff.find(mergeTenantFilter(req, { position: { $in: ["guide", "tour_guide", "tourguide"] }, isActive: true, isDeleted: { $ne: true }, status: "active" })).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: guides.length, data: guides });
  } catch (error) { next(error); }
};

export const getDrivers = async (req, res, next) => {
  requireTenantId();
  try {
    const drivers = await Staff.find(mergeTenantFilter(req, { position: { $in: ["driver", "tour_driver"] }, isActive: true, isDeleted: { $ne: true }, status: "active" })).populate("assignedTours", "title startDate endDate").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (error) { next(error); }
};

export const updateStaffAvailability = async (req, res, next) => {
  requireTenantId();
  try {
    const { availability } = req.body;
    if (!availability) return res.status(400).json({ success: false, message: "Availability is required" });
    const staff = await Staff.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), { availability }, { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });
    return res.status(200).json({ success: true, message: "Availability updated successfully", data: staff });
  } catch (error) { next(error); }
};

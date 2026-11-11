/**
 * Purpose: tenant Directory Controller HTTP controller. Main declarations: getStaffByPosition, getTenantGuides, getTenantDrivers, getTenantVehicles, getTenantCustomers.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";

// Declare getStaffByPosition for use by the surrounding module or function.
const getStaffByPosition = async (req, res, next, positions) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare staff for use by the surrounding module or function.
    const staff = await Staff.find(mergeTenantFilter(req, { position: { $in: positions }, isActive: true, isDeleted: { $ne: true } }))
      .select("name email phone position availability assignedTours")
      .populate("assignedTours", "title startDate endDate status")
      .sort({ name: 1 }).lean();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: staff.length, data: staff, staff });
  } catch (error) { next(error); }
};

// Declare getTenantGuides for use by the surrounding module or function.
export const getTenantGuides = async (req, res, next) => getStaffByPosition(req, res, next, ["guide", "tour_guide", "tourguide"]);
// Declare getTenantDrivers for use by the surrounding module or function.
export const getTenantDrivers = async (req, res, next) => getStaffByPosition(req, res, next, ["driver"]);

// Declare getTenantVehicles for use by the surrounding module or function.
export const getTenantVehicles = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare vehicles for use by the surrounding module or function.
    const vehicles = await Vehicle.find(mergeTenantFilter(req, { isDeleted: { $ne: true } }))
      .populate("driver", "name phone email")
      .sort({ createdAt: -1 }).lean();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: vehicles.length, data: vehicles, vehicles });
  } catch (error) { next(error); }
};

// Declare getTenantCustomers for use by the surrounding module or function.
export const getTenantCustomers = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { search = "", page = 1, limit = 10 } for use by the surrounding module or function.
    const { search = "", page = 1, limit = 10 } = req.query;
    // Declare currentPage for use by the surrounding module or function.
    const currentPage = Math.max(Number(page) || 1, 1);
    // Declare pageSize for use by the surrounding module or function.
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: [{ role: "customer" }, { legacyRole: "customer" }] });
    // Declare term for use by the surrounding module or function.
    const term = String(search).trim();
    // Check the condition (term) and run the matching branch.
    if (term) {
      // Declare regex for use by the surrounding module or function.
      const regex = { $regex: term, $options: "i" };
      // Perform the side effect or state update expressed on the following line.
      filter.$and = [{ $or: [{ role: "customer" }, { legacyRole: "customer" }] }, { $or: [{ name: regex }, { email: regex }, { phone: regex }] }];
      // Perform the side effect or state update expressed on the following line.
      delete filter.$or;
    }
    // Declare [customers, total] for use by the surrounding module or function.
    const [customers, total] = await Promise.all([
      User.find(filter).select("name email phone role roleId status createdAt").sort({ createdAt: -1 }).skip((currentPage - 1) * pageSize).limit(pageSize).lean(),
      User.countDocuments(filter),
    ]);
    // Declare ids for use by the surrounding module or function.
    const ids = customers.map((customer) => customer._id);
    // Declare legacy for use by the surrounding module or function.
    const legacy = await Customer.find(mergeTenantFilter(req, { user: { $in: ids } })).select("_id user customerType").lean();
    // Declare legacyMap for use by the surrounding module or function.
    const legacyMap = new Map(legacy.map((record) => [record.user?.toString(), record]));
    // Declare bookingStats for use by the surrounding module or function.
    const bookingStats = await Booking.find(mergeTenantFilter(req, { isDeleted: { $ne: true }, user: { $in: ids } })).select("user status totalAmount depositAmount refundAmount paymentStatus").lean();
    // Declare stats for use by the surrounding module or function.
    const stats = new Map();
    // Repeat the enclosed work for each required iteration.
    for (const booking of bookingStats) {
      // Declare key for use by the surrounding module or function.
      const key = booking.user?.toString(); if (!key) continue;
      // Declare current for use by the surrounding module or function.
      const current = stats.get(key) || { totalBookings: 0, totalSpent: 0 };
      // Perform the side effect or state update expressed on the following line.
      current.totalBookings += 1;
      // Check the condition (["paid", "completed"].includes(String(booking.paymentStatus || "").toL) and run the matching branch.
      if (["paid", "completed"].includes(String(booking.paymentStatus || "").toLowerCase())) current.totalSpent += Math.max(0, Number(booking.depositAmount || booking.totalAmount || 0) - Number(booking.refundAmount || 0));
      // Perform the side effect or state update expressed on the following line.
      stats.set(key, current);
    }
    // Declare data for use by the surrounding module or function.
    const data = customers.map((customer) => ({ ...customer, customerType: legacyMap.get(customer._id.toString())?.customerType || "individual", isActive: customer.status === "active", ...(stats.get(customer._id.toString()) || { totalBookings: 0, totalSpent: 0 }) }));
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, pagination: { total, page: currentPage, pages: Math.ceil(total / pageSize), limit: pageSize }, count: data.length, data, customers: data });
  } catch (error) { next(error); }
};

import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";

export const getTenantGuides = async (req, res, next) => {
  requireTenantId();
  try {
    const guides = await Staff.find(mergeTenantFilter(req, { position: { $in: ["guide", "tour_guide", "tourguide"] }, isActive: true, isDeleted: { $ne: true } }))
      .select("name email phone position availability assignedTours")
      .populate("assignedTours", "title startDate endDate status")
      .sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, count: guides.length, data: guides, guides });
  } catch (error) { next(error); }
};

export const getTenantVehicles = async (req, res, next) => {
  requireTenantId();
  try {
    const vehicles = await Vehicle.find(mergeTenantFilter(req, { isDeleted: { $ne: true } }))
      .populate("driver", "name phone email")
      .sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, count: vehicles.length, data: vehicles, vehicles });
  } catch (error) { next(error); }
};

export const getTenantCustomers = async (req, res, next) => {
  requireTenantId();
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const filter = mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: [{ role: "customer" }, { legacyRole: "customer" }] });
    const term = String(search).trim();
    if (term) {
      const regex = { $regex: term, $options: "i" };
      filter.$and = [{ $or: [{ role: "customer" }, { legacyRole: "customer" }] }, { $or: [{ name: regex }, { email: regex }, { phone: regex }] }];
      delete filter.$or;
    }
    const [customers, total] = await Promise.all([
      User.find(filter).select("name email phone role roleId status createdAt").sort({ createdAt: -1 }).skip((currentPage - 1) * pageSize).limit(pageSize).lean(),
      User.countDocuments(filter),
    ]);
    const ids = customers.map((customer) => customer._id);
    const legacy = await Customer.find(mergeTenantFilter(req, { user: { $in: ids } })).select("_id user customerType").lean();
    const legacyMap = new Map(legacy.map((record) => [record.user?.toString(), record]));
    const bookingStats = await Booking.find(mergeTenantFilter(req, { isDeleted: { $ne: true }, user: { $in: ids } })).select("user status totalAmount depositAmount refundAmount paymentStatus").lean();
    const stats = new Map();
    for (const booking of bookingStats) {
      const key = booking.user?.toString(); if (!key) continue;
      const current = stats.get(key) || { totalBookings: 0, totalSpent: 0 };
      current.totalBookings += 1;
      if (["paid", "completed"].includes(String(booking.paymentStatus || "").toLowerCase())) current.totalSpent += Math.max(0, Number(booking.depositAmount || booking.totalAmount || 0) - Number(booking.refundAmount || 0));
      stats.set(key, current);
    }
    const data = customers.map((customer) => ({ ...customer, customerType: legacyMap.get(customer._id.toString())?.customerType || "individual", isActive: customer.status === "active", ...(stats.get(customer._id.toString()) || { totalBookings: 0, totalSpent: 0 }) }));
    return res.status(200).json({ success: true, pagination: { total, page: currentPage, pages: Math.ceil(total / pageSize), limit: pageSize }, count: data.length, data, customers: data });
  } catch (error) { next(error); }
};

/**
 * Purpose: customer Controller HTTP controller. Main declarations: isValidId, getConfirmedSpend, getCustomers, getCustomerProfile.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// server/controllers/customerController.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/Quotation.js so this module can use its exported dependencies.
import Quotation from "../models/Quotation.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";

// Declare isValidId for use by the surrounding module or function.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
// Declare successfulBookingStatuses for use by the surrounding module or function.
const successfulBookingStatuses = new Set(["confirmed", "assigned", "ongoing", "completed"]);
// Declare excludedPaymentStatuses for use by the surrounding module or function.
const excludedPaymentStatuses = new Set(["failed", "cancelled", "refunded"]);
// Declare CUSTOMER_PAGE_SIZE for use by the surrounding module or function.
const CUSTOMER_PAGE_SIZE = 10;

// Declare getConfirmedSpend for use by the surrounding module or function.
const getConfirmedSpend = (booking) => {
  // Declare bookingStatus for use by the surrounding module or function.
  const bookingStatus = String(booking.status || "pending").toLowerCase();
  // Declare paymentStatus for use by the surrounding module or function.
  const paymentStatus = String(booking.paymentStatus || "pending").toLowerCase();
  // "Confirmed spend" represents an actually paid confirmed booking, not the
  // booking's requested deposit. A depositAmount can be a required deposit and
  // is therefore not proof that the customer has paid that amount.
  // Check the condition (!successfulBookingStatuses.has(bookingStatus) || !["paid", "completed") and run the matching branch.
  if (
    !successfulBookingStatuses.has(bookingStatus) ||
    !["paid", "completed", "success"].includes(paymentStatus)
  ) return 0;

  // Declare bookingValue for use by the surrounding module or function.
  const bookingValue = Number(booking.totalAmount || 0);
  // Return the result of Math.max() to the caller.
  return Math.max(0, bookingValue - Number(booking.refundAmount || 0));
};

// Declare getCustomers for use by the surrounding module or function.
export const getCustomers = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { search = "", page = 1 } for use by the surrounding module or function.
    const { search = "", page = 1 } = req.query;
    // Declare currentPage for use by the surrounding module or function.
    const currentPage = Math.max(Number(page) || 1, 1);
    // Declare pageSize for use by the surrounding module or function.
    const pageSize = CUSTOMER_PAGE_SIZE;
    // Declare skip for use by the surrounding module or function.
    const skip = (currentPage - 1) * pageSize;
    // Declare nonCustomerRoleIds for use by the surrounding module or function.
    const nonCustomerRoleIds = await Role.find(mergeTenantFilter({ name: { $nin: ["customer", "Customer"] } })).distinct("_id");
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter({ isDeleted: { $ne: true }, $and: [{ $or: [{ role: "customer" }, { legacyRole: "customer" }] }, { $or: [{ roleId: null }, { roleId: { $nin: nonCustomerRoleIds } }] }] });
    // Declare trimmedSearch for use by the surrounding module or function.
    const trimmedSearch = String(search).trim();
    // Check the condition (trimmedSearch) and run the matching branch.
    if (trimmedSearch) { const regex = { $regex: trimmedSearch, $options: "i" }; filter.$and = [{ $or: [{ role: "customer" }, { legacyRole: "customer" }] }, { $or: [{ name: regex }, { email: regex }, { phone: regex }] }, { $or: [{ roleId: null }, { roleId: { $nin: nonCustomerRoleIds } }] }]; }
    // Declare [customers, total] for use by the surrounding module or function.
    const [customers, total] = await Promise.all([User.find(filter).select("name email phone role roleId legacyRole status createdAt").populate("roleId", "name displayName").sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(), User.countDocuments(filter)]);
    // Declare customerIds for use by the surrounding module or function.
    const customerIds = customers.map((customer) => customer._id);
    // Declare customerRecords for use by the surrounding module or function.
    const customerRecords = await Customer.find(mergeTenantFilter({ user: { $in: customerIds } })).select("_id user customerType").lean();
    // Declare legacyCustomerIds for use by the surrounding module or function.
    const legacyCustomerIds = customerRecords.map((customer) => customer._id);
    // Declare legacyToUser for use by the surrounding module or function.
    const legacyToUser = new Map(customerRecords.map((customer) => [customer._id.toString(), customer.user?.toString()]));
    // Declare bookingStats for use by the surrounding module or function.
    const bookingStats = await Booking.find(mergeTenantFilter({ isDeleted: { $ne: true }, $or: [{ user: { $in: customerIds } }, { customer: { $in: legacyCustomerIds } }] })).select("user customer status totalAmount depositAmount refundAmount paymentStatus").lean();
    // Declare statsMap for use by the surrounding module or function.
    const statsMap = {};
    // Repeat the enclosed work for each required iteration.
    for (const booking of bookingStats) { const ownerId = booking.user?.toString() || legacyToUser.get(booking.customer?.toString()); if (!ownerId) continue; if (!statsMap[ownerId]) statsMap[ownerId] = { totalBookings: 0, confirmedBookings: 0, confirmedSpend: 0 }; statsMap[ownerId].totalBookings += 1; const bookingStatus = String(booking.status || "pending").toLowerCase(); if (successfulBookingStatuses.has(bookingStatus)) { statsMap[ownerId].confirmedBookings += 1; statsMap[ownerId].confirmedSpend += getConfirmedSpend(booking); } }
    // Declare data for use by the surrounding module or function.
    const data = customers.map((customer) => { const stats = statsMap[customer._id.toString()] || { totalBookings: 0, confirmedBookings: 0, confirmedSpend: 0 }; const legacy = customerRecords.find((record) => record.user?.toString() === customer._id.toString()); return { ...customer, customerType: legacy?.customerType || "individual", isActive: customer.status === "active", totalBookings: stats.totalBookings, confirmedBookings: stats.confirmedBookings, confirmedSpend: stats.confirmedSpend, totalSpent: stats.confirmedSpend }; });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, pagination: { total, page: currentPage, pages: Math.max(1, Math.ceil(total / pageSize)), limit: pageSize }, count: data.length, data, customers: data });
  } catch (error) { next(error); }
};

// Declare getCustomerProfile for use by the surrounding module or function.
export const getCustomerProfile = async (req, res, next) => { try { if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid customer ID." }); requireTenantId(); const customer = await User.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true }, $or: [{ role: "customer" }, { legacyRole: "customer" }] })).select("-password").lean(); if (!customer) return res.status(404).json({ success: false, message: "Customer not found." }); const legacyCustomer = await Customer.findOne(mergeTenantFilter({ user: customer._id })).select("_id customerType").lean(); const ownership = [{ user: customer._id }]; if (legacyCustomer?._id) ownership.push({ customer: legacyCustomer._id }); const bookings = await Booking.find(mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: ownership })).populate("tour", "title destination price").sort({ createdAt: -1 }).lean(); const [invoices, quotations, reviews, communications] = await Promise.all([Invoice.find(mergeTenantFilter(req, { customer: customer._id })).populate("tour", "title").sort({ createdAt: -1 }).lean(), legacyCustomer ? Quotation.find(mergeTenantFilter(req, { customer: legacyCustomer._id })).populate("tourPackage", "title").sort({ createdAt: -1 }).lean() : [], Review.find(mergeTenantFilter(req, { user: customer._id, isDeleted: { $ne: true } })).populate("tour", "title").sort({ createdAt: -1 }).lean(), Notification.find(mergeTenantFilter(req, { recipient: customer._id })).select("title message type read createdAt").sort({ createdAt: -1 }).limit(10).lean()]); const summary = bookings.reduce((acc, booking) => { acc.totalBookings += 1; const bookingStatus = String(booking.status || "pending").toLowerCase(); const paymentStatus = String(booking.paymentStatus || "pending").toLowerCase(); if (successfulBookingStatuses.has(bookingStatus)) { acc.confirmedBookings += 1; acc.confirmedSpend += getConfirmedSpend(booking); } if (bookingStatus === "confirmed" && ["paid", "completed"].includes(paymentStatus)) { const paidAmount = Number(booking.depositAmount || 0) || Number(booking.totalAmount || 0); const netPaid = Math.max(0, paidAmount - Number(booking.refundAmount || 0)); acc.totalSpent += netPaid; acc.totalPaid += netPaid; } return acc; }, { totalBookings: 0, confirmedBookings: 0, confirmedSpend: 0, totalSpent: 0, totalPaid: 0 }); return res.status(200).json({ success: true, data: { customer, summary, bookings, invoices, quotations, reviews, communications } }); } catch (error) { next(error); } };

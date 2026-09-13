import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// server/controllers/customerController.js

import mongoose from "mongoose";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import Role from "../models/Role.js";
import Invoice from "../models/Invoice.js";
import Quotation from "../models/Quotation.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const successfulBookingStatuses = new Set(["confirmed", "assigned", "ongoing", "completed"]);
const excludedPaymentStatuses = new Set(["failed", "cancelled", "refunded"]);

const getConfirmedSpend = (booking) => {
  const bookingStatus = String(booking.status || "pending").toLowerCase();
  const paymentStatus = String(booking.paymentStatus || "pending").toLowerCase();
  if (!successfulBookingStatuses.has(bookingStatus) || excludedPaymentStatuses.has(paymentStatus)) return 0;

  const bookingValue = Number(booking.totalAmount || 0);
  const deposit = Number(booking.depositAmount || 0);
  const baseAmount = deposit > 0 ? deposit : bookingValue;
  return Math.max(0, baseAmount - Number(booking.refundAmount || 0));
};

export const getCustomers = async (req, res, next) => {
  requireTenantId();
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const skip = (currentPage - 1) * pageSize;

    const nonCustomerRoleIds = await Role.find(
      mergeTenantFilter({ name: { $nin: ["customer", "Customer"] } })
    ).distinct("_id");

    const filter = mergeTenantFilter({
      isDeleted: { $ne: true },
      $and: [
        { $or: [{ role: "customer" }, { legacyRole: "customer" }] },
        { $or: [{ roleId: null }, { roleId: { $nin: nonCustomerRoleIds } }] },
      ],
    });

    const trimmedSearch = String(search).trim();
    if (trimmedSearch) {
      const regex = { $regex: trimmedSearch, $options: "i" };
      filter.$and = [
        { $or: [{ role: "customer" }, { legacyRole: "customer" }] },
        { $or: [{ name: regex }, { email: regex }, { phone: regex }] },
        { $or: [{ roleId: null }, { roleId: { $nin: nonCustomerRoleIds } }] },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select("name email phone role roleId legacyRole status createdAt")
        .populate("roleId", "name displayName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      User.countDocuments(filter),
    ]);

    const customerIds = customers.map((customer) => customer._id);
    const customerRecords = await Customer.find(
      mergeTenantFilter({ user: { $in: customerIds } })
    ).select("_id user customerType").lean();

    const legacyCustomerIds = customerRecords.map((customer) => customer._id);
    const legacyToUser = new Map(
      customerRecords.map((customer) => [customer._id.toString(), customer.user?.toString()])
    );

    const bookingStats = await Booking.find(
      mergeTenantFilter({
        isDeleted: { $ne: true },
        $or: [
          { user: { $in: customerIds } },
          { customer: { $in: legacyCustomerIds } },
        ],
      })
    ).select("user customer status totalAmount depositAmount refundAmount paymentStatus").lean();

    const statsMap = {};
    for (const booking of bookingStats) {
      const ownerId = booking.user?.toString() || legacyToUser.get(booking.customer?.toString());
      if (!ownerId) continue;

      if (!statsMap[ownerId]) {
        statsMap[ownerId] = { totalBookings: 0, confirmedBookings: 0, confirmedSpend: 0 };
      }

      statsMap[ownerId].totalBookings += 1;
      const bookingStatus = String(booking.status || "pending").toLowerCase();

      if (successfulBookingStatuses.has(bookingStatus)) {
        statsMap[ownerId].confirmedBookings += 1;
        statsMap[ownerId].confirmedSpend += getConfirmedSpend(booking);
      }
    }

    const data = customers.map((customer) => {
      const stats = statsMap[customer._id.toString()] || {
        totalBookings: 0,
        confirmedBookings: 0,
        confirmedSpend: 0,
      };
      const legacy = customerRecords.find(
        (record) => record.user?.toString() === customer._id.toString()
      );

      return {
        ...customer,
        customerType: legacy?.customerType || "individual",
        isActive: customer.status === "active",
        totalBookings: stats.totalBookings,
        confirmedBookings: stats.confirmedBookings,
        confirmedSpend: stats.confirmedSpend,
        totalSpent: stats.confirmedSpend,
      };
    });

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page: currentPage,
        pages: Math.max(1, Math.ceil(total / pageSize)),
        limit: pageSize,
      },
      count: data.length,
      data,
      customers: data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerProfile = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid customer ID." });
    }

    requireTenantId();
    const customer = await User.findOne(
      mergeTenantFilter({
        _id: req.params.id,
        isDeleted: { $ne: true },
        $or: [{ role: "customer" }, { legacyRole: "customer" }],
      })
    ).select("-password").lean();

    if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });

    const legacyCustomer = await Customer.findOne(
      mergeTenantFilter({ user: customer._id })
    ).select("_id customerType").lean();

    const ownership = [{ user: customer._id }];
    if (legacyCustomer?._id) ownership.push({ customer: legacyCustomer._id });

    const bookings = await Booking.find(
      mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: ownership })
    ).populate("tour", "title destination price").sort({ createdAt: -1 }).lean();

    const [invoices, quotations, reviews, communications] = await Promise.all([
      Invoice.find(mergeTenantFilter(req, { customer: customer._id })).populate("tour", "title").sort({ createdAt: -1 }).lean(),
      legacyCustomer ? Quotation.find(mergeTenantFilter(req, { customer: legacyCustomer._id })).populate("tourPackage", "title").sort({ createdAt: -1 }).lean() : [],
      Review.find(mergeTenantFilter(req, { user: customer._id, isDeleted: { $ne: true } })).populate("tour", "title").sort({ createdAt: -1 }).lean(),
      Notification.find(mergeTenantFilter(req, { recipient: customer._id })).select("title message type read createdAt").sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    const summary = bookings.reduce((acc, booking) => {
      acc.totalBookings += 1;
      const bookingStatus = String(booking.status || "pending").toLowerCase();
      const paymentStatus = String(booking.paymentStatus || "pending").toLowerCase();

      if (successfulBookingStatuses.has(bookingStatus)) {
        acc.confirmedBookings += 1;
        acc.confirmedSpend += getConfirmedSpend(booking);
      }

      if (bookingStatus === "confirmed" && ["paid", "completed"].includes(paymentStatus)) {
        const paidAmount = Number(booking.depositAmount || 0) || Number(booking.totalAmount || 0);
        const netPaid = Math.max(0, paidAmount - Number(booking.refundAmount || 0));
        acc.totalSpent += netPaid;
        acc.totalPaid += netPaid;
      }
      return acc;
    }, { totalBookings: 0, confirmedBookings: 0, confirmedSpend: 0, totalSpent: 0, totalPaid: 0 });

    return res.status(200).json({
      success: true,
      data: { customer, summary, bookings, invoices, quotations, reviews, communications },
    });
  } catch (error) {
    next(error);
  }
};

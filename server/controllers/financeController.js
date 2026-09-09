import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";

const PAYMENT_STATUSES = ["pending", "completed", "failed", "cancelled", "refunded"];

export const getFinanceStats = async (req, res, next) => {
  requireTenantId();
  try {
    const [revenueResult, completedPayments, pendingPayments, failedPayments, refundedPayments, refundedAmountResult, paidBookings, commissionResult] = await Promise.all([
      Payment.aggregate([
        { $match: mergeTenantFilter({ status: "completed" }) },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } },
      ]),
      Payment.countDocuments(mergeTenantFilter({ status: "completed" })),
      Payment.countDocuments(mergeTenantFilter({ status: "pending" })),
      Payment.countDocuments(mergeTenantFilter({ status: "failed" })),
      Payment.countDocuments(mergeTenantFilter({ status: "refunded" })),
      Payment.aggregate([
        { $match: mergeTenantFilter({ status: "refunded" }) },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } },
      ]),
      Booking.countDocuments(mergeTenantFilter({ paymentStatus: "paid" })),
      Commission.aggregate([
        { $match: mergeTenantFilter({}) },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } },
      ]),
    ]);
    const revenue = revenueResult[0]?.total || 0;
    const refundedAmount = refundedAmountResult[0]?.total || 0;
    return res.status(200).json({ success: true, data: { revenue, netRevenue: revenue - refundedAmount, refundedAmount, completedPayments, pendingPayments, failedPayments, refundedPayments, paidBookings, commission: commissionResult[0]?.total || 0 } });
  } catch (error) { next(error); }
};

export const getTransactions = async (req, res, next) => {
  requireTenantId();
  try {
    const { page = 1, limit = 20, status, search, startDate, endDate } = req.query;
    const currentPage = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * pageSize;
    const filter = mergeTenantFilter({});
    if (status && PAYMENT_STATUSES.includes(status)) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      const regex = { $regex: String(search).trim(), $options: "i" };
      const [matchingUsers, matchingBookings] = await Promise.all([
        User.find(mergeTenantFilter({ $or: [{ name: regex }, { email: regex }, { phone: regex }] })).select("_id").lean(),
        Booking.find(mergeTenantFilter({ bookingNumber: regex })).select("_id").lean(),
      ]);
      filter.$or = [
        { transactionId: regex }, { transactionReference: regex }, { mpesaReceiptNumber: regex },
        { customer: { $in: matchingUsers.map((user) => user._id) } },
        { booking: { $in: matchingBookings.map((booking) => booking._id) } },
      ];
    }
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("booking", "bookingNumber travelDate mpesaReceipt transactionId paymentStatus status")
        .populate("customer", "name email phone")
        .populate("user", "name email phone")
        .sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      Payment.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, count: payments.length, pagination: { total, page: currentPage, pages: Math.ceil(total / pageSize), limit: pageSize }, data: payments });
  } catch (error) { next(error); }
};

export const getReports = async (req, res, next) => {
  requireTenantId();
  try {
    const monthlyRevenue = await Payment.aggregate([
      { $match: mergeTenantFilter({ status: "completed" }) },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: { $ifNull: ["$amount", 0] } }, transactions: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    return res.status(200).json({ success: true, data: { monthlyRevenue } });
  } catch (error) { next(error); }
};

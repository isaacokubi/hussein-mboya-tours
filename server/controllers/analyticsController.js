import { requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import { getRevenueAnalytics, getBookingAnalytics, getPopularTours } from "../services/analyticsService.js";

const nonNegativeAmount = {
  $cond: [
    { $gt: [{ $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }, 0] },
    { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] },
    0,
  ],
};

export const getAnalytics = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req);
    const [revenue, bookings, popularTours, customers, bookingStatus, monthlyRevenue, vehicleStats] = await Promise.all([
      getRevenueAnalytics(req),
      getBookingAnalytics(req),
      getPopularTours(req),
      User.countDocuments({ ...filter, $or: [{ role: "customer" }, { legacyRole: "customer" }] }),
      Booking.aggregate([
        { $match: { ...filter, isDeleted: { $ne: true } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Payment.aggregate([
        { $match: { ...filter, status: "completed" } },
        { $group: { _id: { year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } }, month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } } }, revenue: { $sum: nonNegativeAmount } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Vehicle.aggregate([
        { $match: { ...filter, isDeleted: { $ne: true } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    return res.status(200).json({ success: true, data: { revenue, customers, bookings, bookingStatus, monthlyRevenue, popularTours, vehicleStats } });
  } catch (error) {
    next(error);
  }
};

export const dashboardAnalytics = async (req, res, next) => {
  try {
    requireTenantId();
    const [revenue, bookings, popularTours] = await Promise.all([getRevenueAnalytics(req), getBookingAnalytics(req), getPopularTours(req)]);
    return res.status(200).json({ success: true, data: { revenue, bookings, popularTours } });
  } catch (error) {
    next(error);
  }
};

export const revenueAnalytics = async (req, res, next) => {
  try {
    requireTenantId();
    const revenue = await getRevenueAnalytics(req);
    return res.status(200).json({ success: true, data: { revenue } });
  } catch (error) {
    next(error);
  }
};

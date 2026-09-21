import { requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Commission from "../models/Commission.js";
import { getRevenueAnalytics, getBookingAnalytics, getPopularTours } from "../services/analyticsService.js";
import { getPostedRevenueReport } from "../services/financeReportingService.js";

export const getAnalytics = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req);
    const [revenue, bookings, popularTours, customers, bookingStatus, monthlyRevenue, vehicleStats, commissions] = await Promise.all([
      getRevenueAnalytics(req),
      getBookingAnalytics(req),
      getPopularTours(req),
      User.countDocuments({ ...filter, $or: [{ role: "customer" }, { legacyRole: "customer" }] }),
      Booking.aggregate([
        { $match: { ...filter, isDeleted: { $ne: true } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      getPostedRevenueReport(),
      Vehicle.aggregate([
        { $match: { ...filter, isDeleted: { $ne: true } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Commission.aggregate([
        { $match: { ...filter, isDeleted: { $ne: true }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalCommission: { $sum: { $ifNull: ["$amount", 0] } } } },
      ]),
    ]);
    const reportedRevenue = Number(revenue?.totalRevenue || 0);
    const commissionCost = Number(commissions?.[0]?.totalCommission || 0);
    const profitability = { reportedRevenue, commissionCost, contributionMargin: Math.max(0, reportedRevenue - commissionCost), marginPercent: reportedRevenue ? Math.round(((reportedRevenue - commissionCost) / reportedRevenue) * 10000) / 100 : 0 };
    return res.status(200).json({ success: true, data: { revenue, customers, bookings, bookingStatus, monthlyRevenue: monthlyRevenue.monthly, popularTours, vehicleStats, profitability } });
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

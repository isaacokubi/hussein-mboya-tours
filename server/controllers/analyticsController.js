/**
 * Purpose: analytics Controller HTTP controller. Main declarations: getAnalytics, dashboardAnalytics, revenueAnalytics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ../services/analyticsService.js so this module can use its exported dependencies.
import { getRevenueAnalytics, getBookingAnalytics, getPopularTours } from "../services/analyticsService.js";
// Load ../services/financeReportingService.js so this module can use its exported dependencies.
import { getPostedRevenueReport } from "../services/financeReportingService.js";

// Declare getAnalytics for use by the surrounding module or function.
export const getAnalytics = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Declare [revenue, bookings, popularTours, customers, bookingStatus, monthlyRevenue, vehicleStats, commissions] for use by the surrounding module or function.
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
    // Declare reportedRevenue for use by the surrounding module or function.
    const reportedRevenue = Number(revenue?.totalRevenue || 0);
    // Declare commissionCost for use by the surrounding module or function.
    const commissionCost = Number(commissions?.[0]?.totalCommission || 0);
    // Declare profitability for use by the surrounding module or function.
    const profitability = { reportedRevenue, commissionCost, contributionMargin: Math.max(0, reportedRevenue - commissionCost), marginPercent: reportedRevenue ? Math.round(((reportedRevenue - commissionCost) / reportedRevenue) * 10000) / 100 : 0 };
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: { revenue, customers, bookings, bookingStatus, monthlyRevenue: monthlyRevenue.monthly, popularTours, vehicleStats, profitability } });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare dashboardAnalytics for use by the surrounding module or function.
export const dashboardAnalytics = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare [revenue, bookings, popularTours] for use by the surrounding module or function.
    const [revenue, bookings, popularTours] = await Promise.all([getRevenueAnalytics(req), getBookingAnalytics(req), getPopularTours(req)]);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: { revenue, bookings, popularTours } });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare revenueAnalytics for use by the surrounding module or function.
export const revenueAnalytics = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare revenue for use by the surrounding module or function.
    const revenue = await getRevenueAnalytics(req);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: { revenue } });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

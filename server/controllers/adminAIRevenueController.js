/**
 * Purpose: admin AIRevenue Controller HTTP controller. Main declarations: getAIRevenueAdvice.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../services/bookingRevenueService.js so this module can use its exported dependencies.
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";

// Declare getAIRevenueAdvice for use by the surrounding module or function.
export const getAIRevenueAdvice = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Declare bookingFilter for use by the surrounding module or function.
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    // Declare [totalBookings, revenue, tours, topTours] for use by the surrounding module or function.
    const [totalBookings, revenue, tours, topTours] = await Promise.all([
      Booking.countDocuments(bookingFilter),
      getBookingRevenueMetrics(req),
      Tour.countDocuments({ ...filter, isDeleted: { $ne: true } }),
      Booking.aggregate([
        { $match: { ...bookingFilter, tour: { $ne: null } } },
        { $group: { _id: "$tour", bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
        { $project: { _id: 1, bookings: 1, tour: { $arrayElemAt: ["$tour", 0] } } }
      ])
    ]);

    // Declare totalRevenue for use by the surrounding module or function.
    const totalRevenue = Number(revenue?.revenue || 0);
    // Declare recommendations for use by the surrounding module or function.
    const recommendations = [];
    // Check the condition (totalBookings < 20) and run the matching branch.
    if (totalBookings < 20) recommendations.push("Increase marketing campaigns because booking volume is currently low.");
    // Check the condition (totalRevenue > 0) and run the matching branch.
    if (totalRevenue > 0) recommendations.push("Create premium packages to increase average booking value.");
    // Check the condition (topTours.length) and run the matching branch.
    if (topTours.length) recommendations.push("Focus advertising budget on your highest performing tours.");
    // Check the condition (tours > 0) and run the matching branch.
    if (tours > 0) recommendations.push("Create seasonal promotions for destinations with lower demand.");
    // Check the condition (!recommendations.length) and run the matching branch.
    if (!recommendations.length) recommendations.push("Collect more booking performance data to generate stronger revenue recommendations.");

    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      data: {
        metrics: { totalBookings, totalRevenue, totalTours: tours },
        topTours,
        recommendations
      }
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

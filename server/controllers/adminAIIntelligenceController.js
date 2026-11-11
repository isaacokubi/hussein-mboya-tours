/**
 * Purpose: admin AIIntelligence Controller HTTP controller. Main declarations: getAIIntelligence.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../services/bookingRevenueService.js so this module can use its exported dependencies.
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";

// Declare getAIIntelligence for use by the surrounding module or function.
export const getAIIntelligence = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Declare bookingFilter for use by the surrounding module or function.
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    // Declare paymentFilter for use by the surrounding module or function.
    const paymentFilter = { ...filter };
    // Declare tourFilter for use by the surrounding module or function.
    const tourFilter = { ...filter, isDeleted: { $ne: true } };
    // Declare reviewFilter for use by the surrounding module or function.
    const reviewFilter = { ...filter };
    // Declare customerFilter for use by the surrounding module or function.
    const customerFilter = { ...filter, $or: [{ role: "customer" }, { legacyRole: "customer" }] };
    // Declare vehicleFilter for use by the surrounding module or function.
    const vehicleFilter = { ...filter, isDeleted: { $ne: true } };

    // Declare [ totalBookings, confirmedBookings, failedPayments, completedPayments, averageBooking, topTours, rating, totalTours, totalCustomers, totalVehicles ] for use by the surrounding module or function.
    const [
      totalBookings,
      confirmedBookings,
      failedPayments,
      completedPayments,
      averageBooking,
      topTours,
      rating,
      totalTours,
      totalCustomers,
      totalVehicles
    ] = await Promise.all([
      Booking.countDocuments(bookingFilter),
      Booking.countDocuments({ ...bookingFilter, status: { $in: ["confirmed", "completed"] } }),
      Payment.countDocuments({ ...paymentFilter, status: "failed" }),
      getBookingRevenueMetrics(req),
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: { _id: null, average: { $avg: "$totalAmount" } } }
      ]),
      Booking.aggregate([
        { $match: { ...bookingFilter, tour: { $ne: null } } },
        { $group: { _id: "$tour", bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 1 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } }
      ]),
      Review.aggregate([
        { $match: reviewFilter },
        { $group: { _id: null, average: { $avg: "$rating" } } }
      ]),
      Tour.countDocuments(tourFilter),
      User.countDocuments(customerFilter),
      Vehicle.countDocuments(vehicleFilter)
    ]);

    // Declare conversionRate for use by the surrounding module or function.
    const conversionRate = totalBookings
      ? Number(((confirmedBookings / totalBookings) * 100).toFixed(1))
      : 0;
    // Declare recommendations for use by the surrounding module or function.
    const recommendations = [];

    // Check the condition (failedPayments > 0) and run the matching branch.
    if (failedPayments > 0) recommendations.push(`${failedPayments} failed payment attempts detected. Follow up with customers.`);
    // Check the condition (totalBookings > 0 && conversionRate < 50) and run the matching branch.
    if (totalBookings > 0 && conversionRate < 50) recommendations.push("Booking conversion is below 50%. Review checkout and payment flow.");
    // Check the condition (rating[0]?.average != null && rating[0].average < 4) and run the matching branch.
    if (rating[0]?.average != null && rating[0].average < 4) recommendations.push("Customer satisfaction needs attention. Review recent feedback and service delivery.");

    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      data: {
        conversionRate,
        confirmedBookings,
        failedPayments,
        revenue: Number(completedPayments?.revenue || 0),
        averageBookingValue: averageBooking[0]?.average ?? 0,
        topTour: topTours[0]?.tour?.[0]?.title || null,
        customerRating: rating[0]?.average != null ? Number(rating[0].average.toFixed(1)) : 0,
        totalTours,
        totalCustomers,
        totalVehicles,
        totalBookings,
        recommendations
      }
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

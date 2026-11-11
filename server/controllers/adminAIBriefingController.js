/**
 * Purpose: admin AIBriefing Controller HTTP controller. Main declarations: getAIBriefing.
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
// Load ../services/bookingRevenueService.js so this module can use its exported dependencies.
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";

// Declare getAIBriefing for use by the surrounding module or function.
export const getAIBriefing = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Declare bookingFilter for use by the surrounding module or function.
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    // Declare [pendingBookings, confirmedBookings, paidBookings, completedPayments, reviews, totalTours] for use by the surrounding module or function.
    const [pendingBookings, confirmedBookings, paidBookings, completedPayments, reviews, totalTours] = await Promise.all([
      Booking.countDocuments({ ...bookingFilter, status: "pending" }),
      Booking.countDocuments({ ...bookingFilter, status: "confirmed" }),
      Booking.countDocuments({ ...bookingFilter, paymentStatus: "paid" }),
      getBookingRevenueMetrics(req),
      Review.aggregate([
        { $match: filter },
        { $group: { _id: null, average: { $avg: "$rating" } } }
      ]),
      Tour.countDocuments({ ...filter, isDeleted: { $ne: true } })
    ]);

    // Declare revenue for use by the surrounding module or function.
    const revenue = Number(completedPayments?.revenue || 0);
    // Declare rating for use by the surrounding module or function.
    const rating = reviews[0]?.average != null ? Number(reviews[0].average.toFixed(1)) : 0;
    // Declare recommendations for use by the surrounding module or function.
    const recommendations = [];

    // Check the condition (pendingBookings > 0) and run the matching branch.
    if (pendingBookings > 0) recommendations.push(`Follow up ${pendingBookings} pending booking(s).`);
    // Check the condition (rating > 0 && rating < 4) and run the matching branch.
    if (rating > 0 && rating < 4) recommendations.push("Review customer feedback and improve service quality.");
    // Check the condition (paidBookings > 10) and run the matching branch.
    if (paidBookings > 10) recommendations.push("Prepare additional transport resources for high demand.");
    // Check the condition (totalTours === 0) and run the matching branch.
    if (totalTours === 0) recommendations.push("Add active tours so customers have inventory to browse and book.");

    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      data: {
        summary: `Today's operations show ${pendingBookings} pending bookings, ${confirmedBookings} confirmed bookings, ${paidBookings} paid bookings, KES ${Number(revenue).toLocaleString()} revenue and customer rating ${rating}/5 across ${totalTours} tours.`,
        metrics: { pendingBookings, confirmedBookings, paidBookings, revenue, rating, totalTours },
        recommendations
      }
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

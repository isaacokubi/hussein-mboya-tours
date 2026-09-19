import { requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";

export const getAIBriefing = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req);
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
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

    const revenue = Number(completedPayments?.revenue || 0);
    const rating = reviews[0]?.average != null ? Number(reviews[0].average.toFixed(1)) : 0;
    const recommendations = [];

    if (pendingBookings > 0) recommendations.push(`Follow up ${pendingBookings} pending booking(s).`);
    if (rating > 0 && rating < 4) recommendations.push("Review customer feedback and improve service quality.");
    if (paidBookings > 10) recommendations.push("Prepare additional transport resources for high demand.");
    if (totalTours === 0) recommendations.push("Add active tours so customers have inventory to browse and book.");

    return res.json({
      success: true,
      data: {
        summary: `Today's operations show ${pendingBookings} pending bookings, ${confirmedBookings} confirmed bookings, ${paidBookings} paid bookings, KES ${Number(revenue).toLocaleString()} revenue and customer rating ${rating}/5 across ${totalTours} tours.`,
        metrics: { pendingBookings, confirmedBookings, paidBookings, revenue, rating, totalTours },
        recommendations
      }
    });
  } catch (error) {
    next(error);
  }
};

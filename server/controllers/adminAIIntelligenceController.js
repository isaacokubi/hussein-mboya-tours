import { requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";

export const getAIIntelligence = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req);
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    const paymentFilter = { ...filter };
    const tourFilter = { ...filter, isDeleted: { $ne: true } };
    const reviewFilter = { ...filter };
    const customerFilter = { ...filter, $or: [{ role: "customer" }, { legacyRole: "customer" }] };
    const vehicleFilter = { ...filter, isDeleted: { $ne: true } };

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

    const conversionRate = totalBookings
      ? Number(((confirmedBookings / totalBookings) * 100).toFixed(1))
      : 0;
    const recommendations = [];

    if (failedPayments > 0) recommendations.push(`${failedPayments} failed payment attempts detected. Follow up with customers.`);
    if (totalBookings > 0 && conversionRate < 50) recommendations.push("Booking conversion is below 50%. Review checkout and payment flow.");
    if (rating[0]?.average != null && rating[0].average < 4) recommendations.push("Customer satisfaction needs attention. Review recent feedback and service delivery.");

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
    next(error);
  }
};

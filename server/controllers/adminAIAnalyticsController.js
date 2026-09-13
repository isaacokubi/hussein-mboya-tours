import { requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";

export const getAIAnalytics = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req);
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    const paymentFilter = { ...filter, status: "completed" };
    const tourFilter = { ...filter, isDeleted: { $ne: true } };

    const [monthlyRevenue, bookingActivity, topTours, bookingStatus, totalTours, recentBookings] = await Promise.all([
      Payment.aggregate([
        { $match: paymentFilter },
        { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, revenue: { $sum: "$amount" } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: { _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, bookings: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        { $limit: 31 }
      ]),
      Booking.aggregate([
        { $match: { ...bookingFilter, tour: { $ne: null } } },
        { $group: { _id: "$tour", bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
        { $project: { _id: 1, bookings: 1, tour: { $arrayElemAt: ["$tour", 0] } } }
      ]),
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Tour.countDocuments(tourFilter),
      Booking.find(bookingFilter).sort({ createdAt: -1 }).limit(10).populate("tour")
    ]);

    return res.json({
      success: true,
      data: { monthlyRevenue, bookingActivity, topTours, bookingStatus, totalTours, recentBookings }
    });
  } catch (error) {
    next(error);
  }
};

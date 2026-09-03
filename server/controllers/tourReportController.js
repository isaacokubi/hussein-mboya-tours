import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

export const getTourReports = async (req, res, next) => {
  requireTenantId();
  try {
    const bookingFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    const paymentFilter = mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } });
    const tourFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    const tenantId = req.tenantId;

    const [totalBookings, revenueResult, bookingStatus, popularTours, monthlyRevenue, totalCustomers, totalTours, completedTours] = await Promise.all([
      Booking.countDocuments(bookingFilter),
      Payment.aggregate([{ $match: paymentFilter }, { $group: { _id: null, total: { $sum: { $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }] } } } }]),
      Booking.aggregate([{ $match: bookingFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Payment.aggregate([
        { $match: paymentFilter },
        { $lookup: { from: "bookings", localField: "booking", foreignField: "_id", as: "bookingDoc" } },
        { $unwind: "$bookingDoc" },
        { $match: { "bookingDoc.isDeleted": { $ne: true }, "bookingDoc.tenantId": tenantId } },
        { $lookup: { from: "tours", localField: "bookingDoc.tour", foreignField: "_id", as: "tour" } },
        { $unwind: "$tour" },
        { $match: { "tour.isDeleted": { $ne: true }, "tour.tenantId": tenantId } },
        { $group: { _id: "$tour._id", bookings: { $addToSet: "$bookingDoc._id" }, revenue: { $sum: { $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }] } } } },
        { $project: { bookings: { $size: "$bookings" }, revenue: 1 } },
        { $sort: { bookings: -1, revenue: -1 } },
        { $limit: 5 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
        { $unwind: "$tour" },
        { $project: { bookings: 1, revenue: 1, title: "$tour.title", slug: "$tour.slug", price: "$tour.price", image: "$tour.images" } },
      ]),
      Payment.aggregate([
        { $match: paymentFilter },
        { $group: { _id: { year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } }, month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } } }, revenue: { $sum: { $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }] } }, bookings: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      User.countDocuments(mergeTenantFilter(req, { $or: [{ role: "customer" }, { legacyRole: "customer" }] })),
      Tour.countDocuments(tourFilter),
      Tour.countDocuments(mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } })),
    ]);

    return res.status(200).json({ success: true, data: { totalBookings, totalRevenue: Number(revenueResult[0]?.total || 0), totalCustomers, totalTours, completedTours, bookingStatus, popularTours, monthlyRevenue } });
  } catch (error) { console.error("TOUR REPORT ERROR:", error); next(error); }
};

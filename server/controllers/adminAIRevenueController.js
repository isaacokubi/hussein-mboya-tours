import { requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";

export const getAIRevenueAdvice = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req);
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    const [totalBookings, revenue, tours, topTours] = await Promise.all([
      Booking.countDocuments(bookingFilter),
      Payment.aggregate([
        { $match: { ...filter, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
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

    const totalRevenue = revenue[0]?.total || 0;
    const recommendations = [];
    if (totalBookings < 20) recommendations.push("Increase marketing campaigns because booking volume is currently low.");
    if (totalRevenue > 0) recommendations.push("Create premium packages to increase average booking value.");
    if (topTours.length) recommendations.push("Focus advertising budget on your highest performing tours.");
    if (tours > 0) recommendations.push("Create seasonal promotions for destinations with lower demand.");
    if (!recommendations.length) recommendations.push("Collect more booking performance data to generate stronger revenue recommendations.");

    return res.json({
      success: true,
      data: {
        metrics: { totalBookings, totalRevenue, totalTours: tours },
        topTours,
        recommendations
      }
    });
  } catch (error) {
    next(error);
  }
};

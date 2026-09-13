import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";

const agentLookupStages = [
  { $lookup: { from: "agents", localField: "_id", foreignField: "_id", as: "agentProfile" } },
  { $unwind: { path: "$agentProfile", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "users", localField: "agentProfile.user", foreignField: "_id", as: "agentUser" } },
  { $unwind: { path: "$agentUser", preserveNullAndEmptyArrays: true } },
];

const agentNameExpression = {
  $let: {
    vars: {
      userName: { $ifNull: ["$agentUser.name", ""] },
      companyName: { $ifNull: ["$agentProfile.companyName", ""] },
      profileEmail: { $ifNull: ["$agentProfile.email", ""] },
      userEmail: { $ifNull: ["$agentUser.email", ""] },
    },
    in: {
      $cond: [
        { $ne: ["$$userName", ""] },
        "$$userName",
        {
          $cond: [
            { $ne: ["$$companyName", ""] },
            "$$companyName",
            {
              $cond: [
                { $ne: ["$$profileEmail", ""] },
                "$$profileEmail",
                { $ifNull: ["$$userEmail", "Unknown agent"] },
              ],
            },
          ],
        },
      ],
    },
  },
};

const populateAgent = (query) =>
  query.populate({
    path: "agent",
    select: "companyName email phone status isApproved user",
    populate: { path: "user", select: "name email phone status" },
  });

export const dailyBookingReport = async (req, res, next) => {
  try {
    requireTenantId();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let bookingQuery = Booking.find(
      mergeTenantFilter(req, { createdAt: { $gte: start, $lte: end } })
    )
      .populate("tour", "title")
      .sort({ createdAt: -1 });
    bookingQuery = populateAgent(bookingQuery);
    const bookings = await bookingQuery;

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

export const monthlyBookingReport = async (req, res, next) => {
  try {
    requireTenantId();
    const now = new Date();
    const yearValue = Number(req.query.year);
    const monthValue = Number(req.query.month);
    const year = Number.isInteger(yearValue) && yearValue >= 2000 ? yearValue : now.getFullYear();
    const month = Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12 ? monthValue : now.getMonth() + 1;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    let bookingQuery = Booking.find(
      mergeTenantFilter(req, { createdAt: { $gte: start, $lte: end } })
    )
      .populate("tour", "title")
      .sort({ createdAt: -1 });
    bookingQuery = populateAgent(bookingQuery);
    const bookings = await bookingQuery;

    res.json({ success: true, year, month, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

export const tourBookingReport = async (req, res, next) => {
  try {
    requireTenantId();
    const data = await Booking.aggregate([
      { $match: { tenantId: req.tenantId, isDeleted: { $ne: true } } },
      { $group: { _id: "$tour", totalBookings: { $sum: 1 }, revenue: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
      { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
      { $unwind: { path: "$tour", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          tourId: "$_id",
          title: { $ifNull: ["$tour.title", "Tour unavailable"] },
          totalBookings: 1,
          revenue: 1,
        },
      },
      { $sort: { totalBookings: -1, revenue: -1 } },
    ]);
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

export const agentBookingReport = async (req, res, next) => {
  try {
    requireTenantId();
    const data = await Booking.aggregate([
      { $match: { tenantId: req.tenantId, agent: { $ne: null }, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: "$agent",
          totalBookings: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$totalAmount", 0] } },
          commission: { $sum: { $ifNull: ["$commissionAmount", 0] } },
        },
      },
      ...agentLookupStages,
      {
        $project: {
          _id: 0,
          agentId: "$_id",
          name: agentNameExpression,
          email: {
            $ifNull: [
              "$agentUser.email",
              { $ifNull: ["$agentProfile.email", ""] },
            ],
          },
          phone: {
            $ifNull: [
              "$agentUser.phone",
              { $ifNull: ["$agentProfile.phone", ""] },
            ],
          },
          companyName: { $ifNull: ["$agentProfile.companyName", ""] },
          status: { $ifNull: ["$agentProfile.status", "unknown"] },
          isApproved: { $ifNull: ["$agentProfile.isApproved", false] },
          totalBookings: 1,
          revenue: 1,
          commission: 1,
        },
      },
      { $sort: { totalBookings: -1, revenue: -1, name: 1 } },
    ]);
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

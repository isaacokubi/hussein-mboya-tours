import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";

export const dailyBookingReport = async (req, res, next) => {
  try {
    requireTenantId();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find(
      mergeTenantFilter(req, { createdAt: { $gte: start, $lte: end } })
    )
      .populate("tour", "title")
      .populate("agent", "name")
      .sort({ createdAt: -1 });

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

    const bookings = await Booking.find(
      mergeTenantFilter(req, { createdAt: { $gte: start, $lte: end } })
    )
      .populate("tour", "title")
      .populate("agent", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, year, month, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

export const tourBookingReport = async (req, res, next) => {
  try {
    requireTenantId();
    const data = await Booking.aggregate([
      { $match: { tenantId: req.tenantId } },
      { $group: { _id: "$tour", totalBookings: { $sum: 1 }, revenue: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
      { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
      { $unwind: { path: "$tour", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, tourId: "$_id", title: { $ifNull: ["$tour.title", "Unknown tour"] }, totalBookings: 1, revenue: 1 } },
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
      { $match: { tenantId: req.tenantId, agent: { $ne: null } } },
      { $group: { _id: "$agent", totalBookings: { $sum: 1 }, revenue: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "agent" } },
      { $unwind: { path: "$agent", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, agentId: "$_id", name: { $ifNull: ["$agent.name", "Unknown agent"] }, email: { $ifNull: ["$agent.email", ""] }, totalBookings: 1, revenue: 1 } },
      { $sort: { totalBookings: -1, revenue: -1 } },
    ]);
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import TourCost from "../models/TourCost.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

/**
 * Read-only Safari Operations Copilot summary.
 * Uses only the active tenant's records and existing operator-entered costs;
 * it never invents prices, changes bookings, or initiates payments.
 */
export const getOperationsCopilotSummary = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const tourFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    const bookingFilter = mergeTenantFilter(req, {
      isDeleted: { $ne: true },
      status: { $nin: ["cancelled", "refunded"] },
    });
    const costFilter = { tenantId: new mongoose.Types.ObjectId(String(tenantId)), status: { $ne: "cancelled" } };

    const [tours, bookingTotals, costTotals] = await Promise.all([
      Tour.find(tourFilter)
        .select("title startDate date duration status assignedGuide assignedDriver assignedVehicle capacity")
        .sort({ startDate: 1, date: 1 }).limit(100).lean(),
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: {
          _id: "$tour",
          bookings: { $sum: 1 },
          guests: { $sum: { $ifNull: ["$numberOfGuests", { $ifNull: ["$guests", { $ifNull: ["$numberOfPeople", 1] }] }] } },
          bookedValue: { $sum: { $ifNull: ["$totalAmount", { $ifNull: ["$amount", 0] }] } },
          collectedValue: { $sum: { $ifNull: ["$amountPaid", 0] } },
        } },
      ]),
      TourCost.aggregate([
        { $match: costFilter },
        { $group: { _id: "$tour", estimatedCost: { $sum: "$totalCost" }, costItems: { $sum: 1 }, actualCost: { $sum: { $cond: [{ $eq: ["$status", "actual"] }, "$totalCost", 0] } } } },
      ]),
    ]);

    const bookingMap = new Map(bookingTotals.map((row) => [String(row._id), row]));
    const costMap = new Map(costTotals.map((row) => [String(row._id), row]));
    const trips = tours.map((tour) => {
      const booking = bookingMap.get(String(tour._id)) || {};
      const costs = costMap.get(String(tour._id)) || {};
      const revenue = Number(booking.bookedValue || 0);
      const estimatedCost = Number(costs.estimatedCost || 0);
      const actualCost = Number(costs.actualCost || 0);
      const hasActualCosts = Number(costs.costItems || 0) > 0 && actualCost > 0;
      return {
        id: String(tour._id),
        title: tour.title || "Untitled tour",
        startDate: tour.startDate || tour.date || null,
        status: tour.status || "draft",
        bookings: Number(booking.bookings || 0),
        guests: Number(booking.guests || 0),
        bookedValue: revenue,
        collectedValue: Number(booking.collectedValue || 0),
        estimatedCost,
        actualCost,
        estimatedMargin: revenue - estimatedCost,
        actualMargin: hasActualCosts ? revenue - actualCost : null,
        costItems: Number(costs.costItems || 0),
        assignment: {
          guideAssigned: Boolean(tour.assignedGuide),
          driverAssigned: Boolean(tour.assignedDriver),
          vehicleAssigned: Boolean(tour.assignedVehicle),
        },
        alerts: [
          ...(!tour.assignedGuide ? ["Guide not assigned"] : []),
          ...(!tour.assignedDriver ? ["Driver not assigned"] : []),
          ...(!tour.assignedVehicle ? ["Vehicle not assigned"] : []),
          ...(revenue > 0 && estimatedCost === 0 ? ["No tour costs entered; margin is incomplete"] : []),
          ...(Number(booking.collectedValue || 0) < revenue ? ["Booking balances may remain outstanding"] : []),
        ],
      };
    });

    const totalBookedValue = trips.reduce((sum, trip) => sum + trip.bookedValue, 0);
    const totalCollectedValue = trips.reduce((sum, trip) => sum + trip.collectedValue, 0);
    const totalEstimatedCost = trips.reduce((sum, trip) => sum + trip.estimatedCost, 0);
    return res.status(200).json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        currency: "KES",
        source: "tenant booking and tour-cost records",
        summary: {
          trips: trips.length,
          tripsNeedingAttention: trips.filter((trip) => trip.alerts.length).length,
          bookedValue: totalBookedValue,
          collectedValue: totalCollectedValue,
          outstandingValue: Math.max(0, totalBookedValue - totalCollectedValue),
          estimatedCost: totalEstimatedCost,
          estimatedMargin: totalBookedValue - totalEstimatedCost,
        },
        trips,
        disclaimer: "Figures are based on recorded bookings and costs. Missing cost records can make margins misleading; verify figures before making financial decisions.",
      },
    });
  } catch (error) {
    return next(error);
  }
};

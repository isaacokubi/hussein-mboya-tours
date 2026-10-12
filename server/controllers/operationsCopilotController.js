import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import TourCost from "../models/TourCost.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { buildTripOperations, buildPaymentFollowUp, toMoney } from "../services/operationsCopilotCalculations.js";

/**
 * Read-only Safari Operations Copilot summary.
 * The endpoint is behind the authenticated Tour Manager router and uses the
 * active tenant for every query. It never sends reminders or changes payments.
 */
export const getOperationsCopilotSummary = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    // Aggregation pipelines bypass Mongoose query casting and document middleware,
    // so explicitly cast tenantId to ObjectId for all aggregation $match stages.
    const tenantObjectId = new mongoose.Types.ObjectId(String(tenantId));
    const tourFilter = mergeTenantFilter({ isDeleted: { $ne: true } });
    const bookingFilter = {
      tenantId: tenantObjectId,
      isDeleted: { $ne: true },
      status: { $nin: ["cancelled", "refunded"] },
    };

    const [tours, bookingTotals, costTotals, bookingFinancialTotals, outstandingBookings] = await Promise.all([
      Tour.find(tourFilter)
        .select("title startDate date duration status assignedGuide assignedDriver assignedVehicle capacity")
        .sort({ startDate: 1, date: 1 })
        .limit(100)
        .lean(),
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: {
          _id: "$tour",
          bookings: { $sum: 1 },
          guests: { $sum: { $ifNull: ["$numberOfGuests", 1] } },
          bookedValue: { $sum: { $ifNull: ["$totalAmount", 0] } },
          collectedValue: { $sum: { $ifNull: ["$amountPaid", 0] } },
        } },
      ]),
      TourCost.aggregate([
        { $match: { tenantId: tenantObjectId, status: { $ne: "cancelled" } } },
        { $group: {
          _id: "$tour",
          estimatedCost: { $sum: { $cond: [{ $in: ["$status", ["estimated", "committed"]] }, "$totalCost", 0] } },
          actualCost: { $sum: { $cond: [{ $eq: ["$status", "actual"] }, "$totalCost", 0] } },
          costItems: { $sum: 1 },
          actualCostItems: { $sum: { $cond: [{ $eq: ["$status", "actual"] }, 1, 0] } },
        } },
      ]),
      Booking.find({
        ...bookingFilter,
        status: { $nin: ["cancelled", "refunded"] },
        $expr: { $gt: [{ $subtract: ["$totalAmount", { $ifNull: ["$amountPaid", 0] }] }, 0] },
      })
        .select("bookingNumber contact customerSnapshot travelDate totalAmount amountPaid paymentStatus status")
        .sort({ travelDate: 1 })
        .limit(100)
        .lean(),
    ]);

    const bookingMap = new Map(bookingTotals.map((row) => [String(row._id), row]));
    const costMap = new Map(costTotals.map((row) => [String(row._id), row]));
    const trips = tours.map((tour) => buildTripOperations(
      tour,
      bookingMap.get(String(tour._id)) || {},
      costMap.get(String(tour._id)) || {},
    ));
    const paymentFollowUps = outstandingBookings
      .map((booking) => buildPaymentFollowUp(booking))
      .filter(Boolean);
    const totalBookedValue = toMoney(trips.reduce((sum, trip) => sum + trip.bookedValue, 0));
    const totalCollectedValue = toMoney(trips.reduce((sum, trip) => sum + trip.collectedValue, 0));
    const totalEstimatedCost = toMoney(trips.reduce((sum, trip) => sum + trip.estimatedCost, 0));

    return res.status(200).json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        currency: "KES",
        source: "tenant booking and tour-cost records",
        summary: {
          trips: trips.length,\n          activeBookings: Number(financialTotals.activeBookings || 0),
          tripsNeedingAttention: trips.filter((trip) => trip.alerts.length).length,
          bookedValue: totalBookedValue,
          collectedValue: totalCollectedValue,
          outstandingValue: toMoney(Math.max(0, totalBookedValue - totalCollectedValue)),
          estimatedCost: totalEstimatedCost,
          estimatedMargin: toMoney(totalBookedValue - totalEstimatedCost),
          bookingsWithOutstandingBalances: paymentFollowUps.length,
          urgentPaymentFollowUps: paymentFollowUps.filter((item) => item.priority === "urgent").length,
        },
        trips,
        paymentFollowUps,
        disclaimer: "Figures are based on recorded bookings and costs. Missing cost records can make margins misleading; verify figures before making financial decisions. Payment follow-ups are suggestions only; no customer has been contacted.",
      },
    });
  } catch (error) {
    return next(error);
  }
};

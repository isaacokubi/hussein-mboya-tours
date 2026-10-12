import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import TourCost from "../models/TourCost.js";
import OperationalAsset from "../models/OperationalAsset.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { buildTripOperations, buildPaymentFollowUp, buildAssetAlerts, buildQuoteDraft, toMoney } from "../services/operationsCopilotCalculations.js";

/**
 * Read-only Safari Operations Copilot summary.
 * The authenticated Tour Manager router protects this endpoint and every
 * database query is scoped to the current tenant. It never sends messages or
 * changes booking/payment records.
 */
export const getOperationsCopilotSummary = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    // Aggregate pipelines bypass Mongoose casting and query middleware.
    const tenantObjectId = new mongoose.Types.ObjectId(String(tenantId));
    const tourFilter = mergeTenantFilter({ isDeleted: { $ne: true } });
    const bookingFilter = {
      tenantId: tenantObjectId,
      isDeleted: { $ne: true },
      status: { $nin: ["cancelled", "refunded"] },
    };

    const [tours, bookingTotals, costTotals, bookingFinancialTotals, outstandingBookings, operationalAssets] = await Promise.all([
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
      // Overall totals include bookings not yet linked to a tour.
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: {
          _id: null,
          bookedValue: { $sum: { $ifNull: ["$totalAmount", 0] } },
          collectedValue: { $sum: { $ifNull: ["$amountPaid", 0] } },
          activeBookings: { $sum: 1 },
        } },
      ]),
      Booking.find({
        ...bookingFilter,
        $expr: { $gt: [{ $subtract: ["$totalAmount", { $ifNull: ["$amountPaid", 0] }] }, 0] },
      })
        .select("bookingNumber contact customerSnapshot travelDate totalAmount amountPaid paymentStatus status")
        .sort({ travelDate: 1 })
        .limit(100)
        .lean(),
      OperationalAsset.find({
        tenantId: tenantObjectId,
        type: { $in: ["vehicle", "driver", "guide", "traveller_document", "incident"] },
        status: { $ne: "inactive" },
      })
        .select("type name status bookingId tourId metadata")
        .sort({ updatedAt: -1 })
        .limit(200)
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
    const financialTotals = bookingFinancialTotals[0] || {};
    const assetAlerts = operationalAssets
      .map((asset) => buildAssetAlerts(asset))
      .filter(Boolean);
    const totalBookedValue = toMoney(financialTotals.bookedValue);
    const totalCollectedValue = toMoney(financialTotals.collectedValue);
    const totalEstimatedCost = toMoney(trips.reduce((sum, trip) => sum + trip.estimatedCost, 0));

    return res.status(200).json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        currency: "KES",
        source: "tenant booking and tour-cost records",
        summary: {
          trips: trips.length,
          activeBookings: Number(financialTotals.activeBookings || 0),
          tripsNeedingAttention: trips.filter((trip) => trip.alerts.length).length,
          bookedValue: totalBookedValue,
          collectedValue: totalCollectedValue,
          outstandingValue: toMoney(Math.max(0, totalBookedValue - totalCollectedValue)),
          estimatedCost: totalEstimatedCost,
          estimatedMargin: toMoney(totalBookedValue - totalEstimatedCost),
          bookingsWithOutstandingBalances: paymentFollowUps.length,
          urgentPaymentFollowUps: paymentFollowUps.filter((item) => item.priority === "urgent").length,
          assetsNeedingAttention: assetAlerts.length,
          urgentAssetAlerts: assetAlerts.reduce((count, asset) => count + asset.alerts.filter((alert) => alert.severity === "urgent").length, 0),
        },
        trips,
        paymentFollowUps,
        assetAlerts,
        disclaimer: "Figures are based on recorded bookings and costs. Missing cost records can make margins misleading; verify figures before making financial decisions. Payment follow-ups are suggestions only; no customer has been contacted.",
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a preview-only quotation from catalogue pricing. This intentionally
 * does not save a quotation or create a booking; a manager reviews it first.
 */
export const createOperationsQuoteDraft = async (req, res, next) => {
  try {
    requireTenantId();
    const { tourId, travelerCount, discountPercent = 0, taxPercent = 0 } = req.body || {};
    if (!mongoose.isValidObjectId(tourId)) {
      return res.status(400).json({ success: false, message: "A valid tourId is required." });
    }
    const tour = await Tour.findOne(mergeTenantFilter({
      _id: tourId,
      isDeleted: { $ne: true },
    })).select("title destination price discountPrice inclusions exclusions itinerary cancellationPolicy").populate("destination", "name title").lean();
    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour was not found in this tenant." });
    }
    const quote = buildQuoteDraft(tour, travelerCount, discountPercent, taxPercent);
    return res.status(200).json({ success: true, data: quote });
  } catch (error) {
    if (/Travellers must|Discount must|Tax rate must|Tour has no valid price/.test(error.message)) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

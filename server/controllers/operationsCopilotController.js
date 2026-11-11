/**
 * Purpose: operations Copilot Controller HTTP controller. Main declarations: getOperationsCopilotSummary, createOperationsQuoteDraft.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/TourCost.js so this module can use its exported dependencies.
import TourCost from "../models/TourCost.js";
// Load ../models/OperationalAsset.js so this module can use its exported dependencies.
import OperationalAsset from "../models/OperationalAsset.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../services/operationsCopilotCalculations.js so this module can use its exported dependencies.
import { buildTripOperations, buildPaymentFollowUp, buildAssetAlerts, buildQuoteDraft, toMoney } from "../services/operationsCopilotCalculations.js";

/**
 * Read-only Safari Operations Copilot summary.
 * The authenticated Tour Manager router protects this endpoint and every
 * database query is scoped to the current tenant. It never sends messages or
 * changes booking/payment records.
 */
// Declare getOperationsCopilotSummary for use by the surrounding module or function.
export const getOperationsCopilotSummary = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Aggregate pipelines bypass Mongoose casting and query middleware.
    // Declare tenantObjectId for use by the surrounding module or function.
    const tenantObjectId = new mongoose.Types.ObjectId(String(tenantId));
    // Declare tourFilter for use by the surrounding module or function.
    const tourFilter = mergeTenantFilter({ isDeleted: { $ne: true } });
    // Declare bookingFilter for use by the surrounding module or function.
    const bookingFilter = {
      tenantId: tenantObjectId,
      isDeleted: { $ne: true },
      status: { $nin: ["cancelled", "refunded"] },
    };

    // Declare [tours, bookingTotals, costTotals, bookingFinancialTotals, outstandingBookings, operationalAssets] for use by the surrounding module or function.
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

    // Declare bookingMap for use by the surrounding module or function.
    const bookingMap = new Map(bookingTotals.map((row) => [String(row._id), row]));
    // Declare costMap for use by the surrounding module or function.
    const costMap = new Map(costTotals.map((row) => [String(row._id), row]));
    // Declare trips for use by the surrounding module or function.
    const trips = tours.map((tour) => buildTripOperations(
      tour,
      bookingMap.get(String(tour._id)) || {},
      costMap.get(String(tour._id)) || {},
    ));
    // Declare paymentFollowUps for use by the surrounding module or function.
    const paymentFollowUps = outstandingBookings
      .map((booking) => buildPaymentFollowUp(booking))
      .filter(Boolean);
    // Declare financialTotals for use by the surrounding module or function.
    const financialTotals = bookingFinancialTotals[0] || {};
    // Declare assetAlerts for use by the surrounding module or function.
    const assetAlerts = operationalAssets
      .map((asset) => buildAssetAlerts(asset))
      .filter(Boolean);
    // Declare totalBookedValue for use by the surrounding module or function.
    const totalBookedValue = toMoney(financialTotals.bookedValue);
    // Declare totalCollectedValue for use by the surrounding module or function.
    const totalCollectedValue = toMoney(financialTotals.collectedValue);
    // Declare totalEstimatedCost for use by the surrounding module or function.
    const totalEstimatedCost = toMoney(trips.reduce((sum, trip) => sum + trip.estimatedCost, 0));

    // Return the result of res.status(200).json() to the caller.
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
    // Return the result of next() to the caller.
    return next(error);
  }
};

/**
 * Create a preview-only quotation from catalogue pricing. This intentionally
 * does not save a quotation or create a booking; a manager reviews it first.
 */
// Declare createOperationsQuoteDraft for use by the surrounding module or function.
export const createOperationsQuoteDraft = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare { tourId, travelerCount, discountPercent = 0, taxPercent = 0 } for use by the surrounding module or function.
    const { tourId, travelerCount, discountPercent = 0, taxPercent = 0 } = req.body || {};
    // Check the condition (!mongoose.isValidObjectId(tourId)) and run the matching branch.
    if (!mongoose.isValidObjectId(tourId)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "A valid tourId is required." });
    }
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(mergeTenantFilter({
      _id: tourId,
      isDeleted: { $ne: true },
    })).select("title destination price discountPrice inclusions exclusions itinerary cancellationPolicy").populate("destination", "name title").lean();
    // Check the condition (!tour) and run the matching branch.
    if (!tour) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({ success: false, message: "Tour was not found in this tenant." });
    }
    // Declare quote for use by the surrounding module or function.
    const quote = buildQuoteDraft(tour, travelerCount, discountPercent, taxPercent);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: quote });
  } catch (error) {
    // Check the condition (/Travellers must|Discount must|Tax rate must|Tour has no valid price/.) and run the matching branch.
    if (/Travellers must|Discount must|Tax rate must|Tour has no valid price/.test(error.message)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: error.message });
    }
    // Return the result of next() to the caller.
    return next(error);
  }
};

import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";

/**
 * Canonical booking revenue for operational/admin reporting.
 *
 * Revenue is the value of bookings whose paymentStatus is paid, excluding
 * cancelled/refunded bookings and subtracting recorded booking refunds.
 * For legacy/manual paid bookings where totalAmount is missing or zero, the
 * completed/refunded Payment ledger is used as a fallback so old paid sales
 * cannot disappear from reporting.
 */
export const getBookingRevenueMetrics = async (req, extraFilter = {}) => {
  const tenantId = requireTenantId();
  const filter = mergeTenantFilter(req, {
    ...extraFilter,
    isDeleted: { $ne: true, ...(extraFilter.isDeleted || {}) },
    paymentStatus: { $in: ["paid", "completed", "success"] },
    status: { $nin: ["cancelled", "refunded"] },
  });

  const [result] = await Booking.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "payments",
        let: { bookingId: "$_id", tenant: "$tenantId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$booking", "$$bookingId"] },
                  { $eq: ["$tenantId", "$$tenant"] },
                  { $in: ["$status", ["completed", "refunded"]] },
                ],
              },
            },
          },
          {
            $project: {
              net: {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $ifNull: ["$amount", 0] },
                      { $ifNull: ["$refundedAmount", 0] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "paymentLedger",
      },
    },
    {
      $project: {
        bookingValue: { $max: [0, { $ifNull: ["$totalAmount", 0] }] },
        bookingRefund: { $max: [0, { $ifNull: ["$refundAmount", 0] }] },
        ledgerValue: { $sum: "$paymentLedger.net" },
      },
    },
    {
      $project: {
        value: {
          $cond: [
            { $gt: ["$bookingValue", 0] },
            { $max: [0, { $subtract: ["$bookingValue", "$bookingRefund"] }] },
            "$ledgerValue",
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$value" },
        paidBookings: { $sum: 1 },
      },
    },
  ]);

  const revenue = Math.round(Number(result?.revenue || 0) * 100) / 100;
  return {
    tenantId,
    revenue,
    paidBookings: Number(result?.paidBookings || 0),
    currency: "KES",
    basis: "paid_booking_value",
  };
};

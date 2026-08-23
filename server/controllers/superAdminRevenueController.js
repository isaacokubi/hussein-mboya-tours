import Payment from "../models/Payment.js";

const REVENUE_STATUSES = ["completed", "refunded"];
const money = (field) => ({ $convert: { input: field, to: "double", onError: 0, onNull: 0 } });

/**
 * Platform revenue is net cash received:
 * eligible successful payments minus refunds that have actually completed.
 * Booking totals are never used as a revenue fallback.
 */
export const getSuperAdminRevenue = async (req, res, next) => {
  try {
    const pipeline = [
      { $match: { status: { $in: REVENUE_STATUSES } } },
      {
        $project: {
          amount: money("$amount"),
          refundedAmount: money("$refundedAmount"),
          refundStatus: { $ifNull: ["$refundStatus", "none"] },
          currency: { $toUpper: { $ifNull: ["$currency", "KES"] } },
        },
      },
      {
        $project: {
          amount: 1,
          refundedAmount: { $cond: [{ $eq: ["$refundStatus", "completed"] }, "$refundedAmount", 0] },
          currency: 1,
        },
      },
      {
        $group: {
          _id: "$currency",
          gross: { $sum: "$amount" },
          refunds: { $sum: "$refundedAmount" },
          payments: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          currency: "$_id",
          gross: 1,
          refunds: 1,
          revenue: { $max: [0, { $subtract: ["$gross", "$refunds"] }] },
          payments: 1,
        },
      },
    ];

    const byCurrency = await Payment.aggregate(pipeline);
    const totals = byCurrency.reduce((acc, item) => ({
      gross: acc.gross + Number(item.gross || 0),
      refunds: acc.refunds + Number(item.refunds || 0),
      payments: acc.payments + Number(item.payments || 0),
    }), { gross: 0, refunds: 0, payments: 0 });

    return res.json({
      success: true,
      revenue: Math.max(0, totals.gross - totals.refunds),
      grossRevenue: totals.gross,
      refundedRevenue: totals.refunds,
      completedPayments: totals.payments,
      byCurrency,
    });
  } catch (error) {
    next(error);
  }
};

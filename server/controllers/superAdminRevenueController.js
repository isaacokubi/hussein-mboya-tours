import Payment from "../models/Payment.js";

/**
 * Platform revenue is the net cash received:
 * completed payments minus completed refunds.
 * Payment is the source of truth; booking totals are never used as a fallback.
 */
export const getSuperAdminRevenue = async (req, res, next) => {
  try {
    const [summary] = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $project: {
          amount: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } },
          refundedAmount: { $convert: { input: "$refundedAmount", to: "double", onError: 0, onNull: 0 } },
          currency: { $ifNull: ["$currency", "KES"] },
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
    ]);

    const totals = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          gross: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } },
          refunds: { $sum: { $convert: { input: "$refundedAmount", to: "double", onError: 0, onNull: 0 } } },
          payments: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          gross: 1,
          refunds: 1,
          payments: 1,
          revenue: { $max: [0, { $subtract: ["$gross", "$refunds"] }] },
        },
      },
    ]);

    return res.json({
      success: true,
      revenue: totals[0]?.revenue || 0,
      grossRevenue: totals[0]?.gross || 0,
      refundedRevenue: totals[0]?.refunds || 0,
      completedPayments: totals[0]?.payments || 0,
      byCurrency: summary || [],
    });
  } catch (error) {
    next(error);
  }
};

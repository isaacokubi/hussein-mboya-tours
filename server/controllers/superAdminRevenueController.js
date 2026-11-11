/**
 * Purpose: super Admin Revenue Controller HTTP controller. Main declarations: money, getSuperAdminRevenue.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Payment from "../models/Payment.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare REVENUE_STATUSES for use by the surrounding module or function.
const REVENUE_STATUSES = ["completed", "refunded"];
// Declare money for use by the surrounding module or function.
const money = (field) => ({ $convert: { input: field, to: "double", onError: 0, onNull: 0 } });

/**
 * Platform revenue is net cash received:
 * eligible successful payments minus refunds that have actually completed.
 * Booking totals are never used as a revenue fallback.
 *
 * This controller explicitly enters the platform bypass context so a stale
 * tenant context from the public middleware can never narrow the result.
 */
// Declare getSuperAdminRevenue for use by the surrounding module or function.
export const getSuperAdminRevenue = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    const result = await runWithTenant({ tenantId: null, tenant: null, bypass: true, role: "super_admin" }, async () => {
      // Declare byCurrency for use by the surrounding module or function.
      const byCurrency = await Payment.aggregate([
        { $match: { status: { $in: REVENUE_STATUSES } } },
        {
          $project: {
            status: 1,
            amount: money("$amount"),
            refundedAmount: money("$refundedAmount"),
            refundStatus: { $ifNull: ["$refundStatus", "none"] },
            currency: { $toUpper: { $ifNull: ["$currency", "KES"] } },
          },
        },
        {
          $project: {
            status: 1,
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
            completedPayments: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            refundedPayments: { $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            currency: "$_id",
            gross: 1,
            refunds: 1,
            revenue: { $max: [0, { $subtract: ["$gross", "$refunds"] }] },
            completedPayments: 1,
            refundedPayments: 1,
          },
        },
      ]);

      // Declare totals for use by the surrounding module or function.
      const totals = byCurrency.reduce((acc, item) => ({
        gross: acc.gross + Number(item.gross || 0),
        refunds: acc.refunds + Number(item.refunds || 0),
        completedPayments: acc.completedPayments + Number(item.completedPayments || 0),
        refundedPayments: acc.refundedPayments + Number(item.refundedPayments || 0),
      }), { gross: 0, refunds: 0, completedPayments: 0, refundedPayments: 0 });

      // Declare primary for use by the surrounding module or function.
      const primary = byCurrency.find((item) => item.currency === "KES") || byCurrency[0] || null;
      // Return the object assembled below to the caller.
      return {
        revenue: Number(primary?.revenue || 0),
        grossRevenue: Number(primary?.gross || 0),
        refundedRevenue: Number(primary?.refunds || 0),
        revenueCurrency: primary?.currency || "KES",
        completedPayments: totals.completedPayments,
        refundedPayments: totals.refundedPayments,
        byCurrency,
      };
    });

    // Return the result of res.json() to the caller.
    return res.json({ success: true, ...result });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

/**
 * Purpose: payment Analytics Service business-logic service. Main declarations: getPaymentStatistics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";

/*
|--------------------------------------------------------------------------
| PAYMENT STATISTICS
|--------------------------------------------------------------------------
|
| Returns payment statistics grouped by payment method.
|
*/

// Declare getPaymentStatistics for use by the surrounding module or function.
export const getPaymentStatistics = async () => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare statistics for use by the surrounding module or function.
  const statistics = await Payment.aggregate([
    {
      $match: {
        status: "completed",
      },
    },

    {
      $group: {
        _id: "$method",

        transactionCount: {
          $sum: 1,
        },

        totalAmount: {
          $sum: "$amount",
        },

        averageAmount: {
          $avg: "$amount",
        },
      },
    },

    {
      $project: {
        _id: 0,

        method: "$_id",

        transactionCount: 1,

        totalAmount: {
          $round: ["$totalAmount", 2],
        },

        averageAmount: {
          $round: ["$averageAmount", 2],
        },
      },
    },

    {
      $sort: {
        totalAmount: -1,
      },
    },
  ]);

  // Declare totals for use by the surrounding module or function.
  const totals = await Payment.aggregate([
    {
      $match: {
        status: "completed",
      },
    },

    {
      $group: {
        _id: null,

        totalTransactions: {
          $sum: 1,
        },

        totalRevenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  // Return the object assembled below to the caller.
  return {
    methods: statistics,

    summary: totals[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
    },
  };
};

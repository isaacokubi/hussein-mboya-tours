import Payment from "../models/Payment.js";

/*
|--------------------------------------------------------------------------
| PAYMENT STATISTICS
|--------------------------------------------------------------------------
|
| Returns payment statistics grouped by payment method.
|
*/

export const getPaymentStatistics = async () => {
  const statistics = await Payment.aggregate([
    {
      $match: {
        paymentStatus: "paid",
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

  const totals = await Payment.aggregate([
    {
      $match: {
        paymentStatus: "paid",
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

  return {
    methods: statistics,

    summary: totals[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
    },
  };
};
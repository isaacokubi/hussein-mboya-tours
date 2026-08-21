import { mergeTenantFilter } from "../tenancy/context.js";
// server/controllers/financeController.js

import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| PAYMENT STATUS
|--------------------------------------------------------------------------
*/

const PAYMENT_STATUSES = [
  "pending",
  "completed",
  "failed",
  "cancelled",
  "refunded",
];

/*
|--------------------------------------------------------------------------
| GET FINANCE DASHBOARD STATS
|--------------------------------------------------------------------------
*/

export const getFinanceStats = async (req, res, next) => {
  try {
    const [
      revenueResult,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      refundedAmountResult,
      paidBookings,
      commissionResult,
    ] = await Promise.all([
      Payment.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ["$amount", 0],
              },
            },
          },
        },
      ]),

      Payment.countDocuments({
        status: "completed",
      }),

      Payment.countDocuments({
        status: "pending",
      }),

      Payment.countDocuments({
        status: "failed",
      }),

      Payment.countDocuments({
        status: "refunded",
      }),

      Payment.aggregate([
        {
          $match:{
            status:"refunded"
          }
        },
        {
          $group:{
            _id:null,
            total:{
              $sum:{
                $ifNull:["$amount",0]
              }
            }
          }
        }
      ]),

      Booking.countDocuments({
        paymentStatus: "paid",
      }),

      Commission.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ["$amount", 0],
              },
            },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,

      data: {
        revenue: revenueResult[0]?.total || 0,

        netRevenue:
          (revenueResult[0]?.total || 0)
          -
          (refundedAmountResult[0]?.total || 0),

        refundedAmount:
          refundedAmountResult[0]?.total || 0,

        completedPayments,

        pendingPayments,

        failedPayments,

        refundedPayments,

        paidBookings,

        commission: commissionResult[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET TRANSACTIONS
|--------------------------------------------------------------------------
*/

export const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      startDate,
      endDate,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * pageSize;

    const filter = {};

    /*
    |--------------------------------------------------------------------------
    | STATUS FILTER
    |--------------------------------------------------------------------------
    */

    if (
      status &&
      PAYMENT_STATUSES.includes(status)
    ) {
      filter.status = status;
    }

    /*
    |--------------------------------------------------------------------------
    | DATE FILTER
    |--------------------------------------------------------------------------
    */

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    if (search) {
      const regex = {
        $regex: String(search).trim(),
        $options: "i",
      };

      const [matchingUsers, matchingBookings] = await Promise.all([
        User.find({
          $or: [
            { name: regex },
            { email: regex },
            { phone: regex },
          ],
        }).select("_id").lean(),

        Booking.find({
          $or: [
            { bookingNumber: regex },
          ],
        }).select("_id").lean(),
      ]);

      filter.$or = [
        { transactionId: regex },
        { transactionReference: regex },
        { mpesaReceiptNumber: regex },
        {
          customer: {
            $in: matchingUsers.map((user) => user._id),
          },
        },
        {
          booking: {
            $in: matchingBookings.map((booking) => booking._id),
          },
        },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY
    |--------------------------------------------------------------------------
    */

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate(
          "booking",
          "bookingNumber travelDate mpesaReceipt transactionId paymentStatus status"
        )
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "user",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      Payment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,

      count: payments.length,

      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },

      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| MONTHLY FINANCE REPORTS
|--------------------------------------------------------------------------
*/

export const getReports = async (req, res, next) => {
  try {
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },

            month: {
              $month: "$createdAt",
            },
          },

          revenue: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },

          transactions: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      data: {
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};
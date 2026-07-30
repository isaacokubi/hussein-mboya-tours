// controllers/financeController.js

import Payment from "../models/Payment.js";

import Booking from "../models/Booking.js";

import Commission from "../models/Commission.js";

/*
|--------------------------------------------------------------------------
| GET FINANCE STATISTICS
|--------------------------------------------------------------------------
|
| Admin Finance Dashboard
|
|--------------------------------------------------------------------------
*/

export const getFinanceStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const completedPayments = await Payment.countDocuments({
      status: "completed",
    });

    const pendingPayments = await Payment.countDocuments({
      status: "pending",
    });

    const failedPayments = await Payment.countDocuments({
      status: "failed",
    });

    const totalBookings = await Booking.countDocuments({
      paymentStatus: "paid",
    });

    const commissionData = await Commission.aggregate([
      {
        $group: {
          _id: null,

          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,

      data: {
        revenue: totalRevenue[0]?.total || 0,

        completedPayments,

        pendingPayments,

        failedPayments,

        paidBookings: totalBookings,

        commission: commissionData[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MPESA TRANSACTIONS
|--------------------------------------------------------------------------
|
| Admin Finance Dashboard
|
| Features:
|
| - View all payments
| - Filter by status
| - Search transactions
| - Search M-Pesa receipt
| - Search customer
| - Search booking number
|
|--------------------------------------------------------------------------
*/

export const getTransactions = async (req, res) => {
  try {
    const {
      status,

      search,
    } = req.query;

    const filter = {};

    // FILTER PAYMENT STATUS

    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)

      .populate(
        "booking",

        "bookingNumber tour travelDate",
      )

      .populate(
        "customer",

        "name email phone",
      )

      .populate(
        "user",

        "name email phone",
      )

      .sort({
        createdAt: -1,
      });

    let results = payments;

    // SEARCH FUNCTIONALITY

    if (search) {
      const keyword = search.toLowerCase();

      results = payments.filter(
        (payment) =>
          payment.transactionId?.toLowerCase().includes(keyword) ||
          payment.mpesaReceiptNumber?.toLowerCase().includes(keyword) ||
          payment.customer?.name?.toLowerCase().includes(keyword) ||
          payment.customer?.email?.toLowerCase().includes(keyword) ||
          payment.customer?.phone?.includes(search) ||
          payment.booking?.bookingNumber?.toLowerCase().includes(keyword),
      );
    }

    res.status(200).json({
      success: true,

      count: results.length,

      payments: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET FINANCE REPORTS
|--------------------------------------------------------------------------
|
| Monthly Revenue Analytics
|
|--------------------------------------------------------------------------
*/

export const getReports = async (req, res) => {
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
            month: {
              $month: "$createdAt",
            },

            year: {
              $year: "$createdAt",
            },
          },

          revenue: {
            $sum: "$amount",
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

    res.status(200).json({
      success: true,

      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

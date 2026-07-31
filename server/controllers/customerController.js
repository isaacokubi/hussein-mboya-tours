// server/controllers/customerController.js

import mongoose from "mongoose";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
|--------------------------------------------------------------------------
| GET ALL CUSTOMERS
|--------------------------------------------------------------------------
|
| GET /api/admin/customers
|--------------------------------------------------------------------------
*/

export const getCustomers = async (req, res, next) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * pageSize;

    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const filter = {
      role: "customer",
    };

    if (search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          email: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | GET CUSTOMERS
    |--------------------------------------------------------------------------
    */

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select(
          "name email phone customerType totalBookings totalSpent loyaltyPoints status createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      User.countDocuments(filter),
    ]);

    /*
    |--------------------------------------------------------------------------
    | BOOKING STATISTICS
    |--------------------------------------------------------------------------
    */

    const customerIds = customers.map((c) => c._id);

    const bookingStats = await Booking.aggregate([
      {
        $match: {
          customer: {
            $in: customerIds,
          },
        },
      },
      {
        $group: {
          _id: "$customer",

          totalBookings: {
            $sum: 1,
          },

          totalSpent: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },
        },
      },
    ]);

    const statsMap = {};

    bookingStats.forEach((item) => {
      statsMap[item._id.toString()] = item;
    });

    /*
    |--------------------------------------------------------------------------
    | RESPONSE DATA
    |--------------------------------------------------------------------------
    */

    const data = customers.map((customer) => {
      const stats =
        statsMap[customer._id.toString()] || {};

      return {
        ...customer,

        totalBookings:
          stats.totalBookings ??
          customer.totalBookings ??
          0,

        totalSpent:
          stats.totalSpent ??
          customer.totalSpent ??
          0,
      };
    });

    return res.status(200).json({
      success: true,

      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },

      count: data.length,

      data,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMER PROFILE
|--------------------------------------------------------------------------
|
| GET /api/admin/customers/:id
|--------------------------------------------------------------------------
*/

export const getCustomerProfile = async (
  req,
  res,
  next
) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const customer = await User.findById(req.params.id)
      .select("-password")
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const bookings = await Booking.find({
      customer: req.params.id,
    })
      .populate(
        "tour",
        "title destination price"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

    const summary = bookings.reduce(
      (acc, booking) => {
        acc.totalBookings += 1;
        acc.totalSpent += booking.amount || 0;

        if (booking.paymentStatus === "paid") {
          acc.totalPaid += booking.amount || 0;
        }

        return acc;
      },
      {
        totalBookings: 0,
        totalSpent: 0,
        totalPaid: 0,
      }
    );

    return res.status(200).json({
      success: true,

      data: {
        customer,
        summary,
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
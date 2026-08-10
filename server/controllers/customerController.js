// server/controllers/customerController.js

import mongoose from "mongoose";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
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
      $or: [
        { role: "customer" },
        { legacyRole: "customer" },
      ],
    };

    if (search.trim()) {
      filter.$and = [
        {
          $or: [
            { role: "customer" },
            { legacyRole: "customer" },
          ],
        },
        {
          $or: [
            { name: { $regex: search.trim(), $options: "i" } },
            { email: { $regex: search.trim(), $options: "i" } },
            { phone: { $regex: search.trim(), $options: "i" } },
          ],
        },
      ];
      delete filter.$or;
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

    // Current web bookings point to User. Older/agent bookings can point
    // through Customer.user, so resolve both ownership models.
    const customerRecords = await Customer.find({
      user: { $in: customerIds },
    })
      .select("_id user")
      .lean();

    const legacyCustomerIds = customerRecords.map((c) => c._id);

    const bookingStats = await Booking.find({
      $or: [
        { user: { $in: customerIds } },
        { customer: { $in: legacyCustomerIds } },
      ],
    })
      .select("user customer totalAmount depositAmount refundAmount paymentStatus")
      .lean();

    const legacyToUser = new Map(
      customerRecords.map((c) => [
        c._id.toString(),
        c.user?.toString(),
      ])
    );

    const statsMap = {};

    for (const booking of bookingStats) {
      const ownerId =
        booking.user?.toString() ||
        legacyToUser.get(booking.customer?.toString());

      if (!ownerId) continue;

      if (!statsMap[ownerId]) {
        statsMap[ownerId] = {
          totalBookings: 0,
          totalSpent: 0,
        };
      }

      statsMap[ownerId].totalBookings += 1;

      const paymentStatus = String(
        booking.paymentStatus || "pending"
      ).toLowerCase();

      const deposited = Number(booking.depositAmount || 0);
      const totalAmount = Number(booking.totalAmount || 0);

      const paidAmount =
        deposited > 0
          ? deposited
          : ["paid", "completed"].includes(paymentStatus)
            ? totalAmount
            : 0;

      statsMap[ownerId].totalSpent += Math.max(
        0,
        paidAmount - Number(booking.refundAmount || 0)
      );
    }

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

        const deposited = Number(booking.depositAmount || 0);
        const totalAmount = Number(booking.totalAmount || 0);
        const paymentStatus = String(
          booking.paymentStatus || "pending"
        ).toLowerCase();

        const paidAmount =
          deposited > 0
            ? deposited
            : ["paid", "completed"].includes(paymentStatus)
              ? totalAmount
              : 0;

        const netPaid = Math.max(
          0,
          paidAmount - Number(booking.refundAmount || 0)
        );

        acc.totalSpent += netPaid;
        acc.totalPaid += netPaid;

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
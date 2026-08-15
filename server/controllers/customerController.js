// server/controllers/customerController.js

import mongoose from "mongoose";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import Role from "../models/Role.js";

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
      limit = 10,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 10);
    const skip = (currentPage - 1) * pageSize;

    const nonCustomerRoleIds = await Role.find({
      name: { $nin: ["customer", "Customer"] },
    }).distinct("_id");

    const filter = {
      $and: [
        { $or: [{ role: "customer" }, { legacyRole: "customer" }] },
        { $or: [{ roleId: null }, { roleId: { $nin: nonCustomerRoleIds } }] },
      ],
    };

    if (String(search).trim()) {
      const regex = {
        $regex: String(search).trim(),
        $options: "i",
      };

      filter.$and = [
        {
          $or: [
            { role: "customer" },
            { legacyRole: "customer" },
          ],
        },
        {
          $or: [
            { name: regex },
            { email: regex },
            { phone: regex },
          ],
        },
      ];
      delete filter.$or;
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select("name email phone role roleId legacyRole status createdAt")
        .populate("roleId", "name displayName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      User.countDocuments(filter),
    ]);

    const customerIds = customers.map((c) => c._id);

    const customerRecords = await Customer.find({
      user: { $in: customerIds },
    })
      .select("_id user customerType")
      .lean();

    const legacyCustomerIds = customerRecords.map((c) => c._id);
    const legacyToUser = new Map(
      customerRecords.map((c) => [
        c._id.toString(),
        c.user?.toString(),
      ])
    );

    const bookingStats = await Booking.find({
      $or: [
        { user: { $in: customerIds } },
        { customer: { $in: legacyCustomerIds } },
      ],
    })
      .select(
        "user customer status totalAmount depositAmount refundAmount paymentStatus"
      )
      .lean();

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

      const bookingStatus = String(
        booking.status || "pending"
      ).toLowerCase();

      

const confirmedSpend = bookingStats
.filter(booking =>
 String(booking.status || "").toLowerCase() === "confirmed" &&
 ["paid","completed"]
 .includes(String(booking.paymentStatus || "").toLowerCase())
)
.reduce(
(sum,booking)=>
sum +
Number(
 booking.totalAmount ||
 booking.amount ||
 0
),
0
);


const paymentStatus = String(
        booking.paymentStatus || "pending"
      ).toLowerCase();

      const qualifies =
        bookingStatus === "confirmed" &&
        ["paid", "completed"].includes(paymentStatus);

      if (qualifies) {
        const amount =
          Number(booking.depositAmount || 0) ||
          Number(booking.totalAmount || 0);

        statsMap[ownerId].totalSpent += Math.max(
          0,
          amount - Number(booking.refundAmount || 0)
        );
      }
    }

    const data = customers.map((customer) => {
      const stats = statsMap[customer._id.toString()] || {
        totalBookings: 0,
        totalSpent: 0,
      };

      const legacy = customerRecords.find(
        (record) =>
          record.user?.toString() === customer._id.toString()
      );

      return {
        ...customer,
        customerType: legacy?.customerType || "individual",
        isActive: customer.status === "active",
        totalBookings: stats.totalBookings,
        totalSpent: stats.totalSpent,
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
      customers: data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerProfile = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      $or: [
        { role: "customer" },
        { legacyRole: "customer" },
      ],
    })
      .select("-password")
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const legacyCustomer = await Customer.findOne({
      user: customer._id,
    })
      .select("_id customerType")
      .lean();

    const ownership = [
      { user: customer._id },
    ];

    if (legacyCustomer?._id) {
      ownership.push({ customer: legacyCustomer._id });
    }

    const bookings = await Booking.find({
      $or: ownership,
    })
      .populate("tour", "title destination price")
      .sort({ createdAt: -1 })
      .lean();

    const summary = bookings.reduce(
      (acc, booking) => {
        acc.totalBookings += 1;

        const bookingStatus = String(
          booking.status || "pending"
        ).toLowerCase();

        const paymentStatus = String(
          booking.paymentStatus || "pending"
        ).toLowerCase();

        const qualifies =
          bookingStatus === "confirmed" &&
          ["paid", "completed"].includes(paymentStatus);

        if (qualifies) {
          const paidAmount =
            Number(booking.depositAmount || 0) ||
            Number(booking.totalAmount || 0);

          const netPaid = Math.max(
            0,
            paidAmount - Number(booking.refundAmount || 0)
          );

          acc.totalSpent += netPaid;
          acc.totalPaid += netPaid;
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

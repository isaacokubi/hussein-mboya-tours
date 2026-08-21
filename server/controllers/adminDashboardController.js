import {mergeTenantFilter} from "../tenancy/secureQuery.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Booking from "../models/Booking.js";
import Destination from "../models/Destination.js";
import Notification from "../models/Notification.js";
import Payment from "../models/Payment.js";
import Staff from "../models/Staff.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Agent from "../models/Agent.js";
import Role from "../models/Role.js";

const ACTIVE_PAYMENT_STATUS = "completed";
const NON_DELETED = { $ne: true };

export const getDashboard = async (req, res) => {
  try {

    const [
      customerRole,
      adminRole,
      agentRole,
      guideRole
    ] = await Promise.all([
      Role.findOne(mergeTenantFilter(req,{name:"customer"}),
      Role.findOne(mergeTenantFilter(req,{name:"admin"}),
      Role.findOne(mergeTenantFilter(req,{name:"agent"}),
      Role.findOne(mergeTenantFilter(req,{name:{$in:["guide","tour_guide"]}})
    ]);

    /*
    |--------------------------------------------------------------------------
    | COUNTS
    |--------------------------------------------------------------------------
    |
    | These are database counts, not cached/denormalized counters.
    | Soft-deleted tours/bookings/destinations are excluded.
    |
    |--------------------------------------------------------------------------
    */
    const [
      users,
      tours,
      bookings,
      destinations,
      customers,
      adminsCount,
      guidesCount,
      vehiclesCount,
      agentsCount,
      guideUsersCount,
      agentUsersCount,
    ] = await Promise.all([
      User.countDocuments({}),
      Tour.countDocuments({ isDeleted: NON_DELETED }),
      Booking.countDocuments({ isDeleted: NON_DELETED }),
      Destination.countDocuments({ isDeleted: NON_DELETED }),
      User.countDocuments({
        role:"customer"
      }),

      User.countDocuments({
        role:{
          $in:[
            "admin",
            "super_admin"
          ]
        }
      }),

      Staff.countDocuments({
        $or: [
          { position: { $in: ["guide", "tour_guide", "tourguide"] } },
          { role: { $in: ["guide", "tour_guide", "tourguide"] } },
        ],
        isDeleted: NON_DELETED,
        isActive: { $ne: false },
        status: { $ne: "inactive" },
      }),
      Vehicle.countDocuments({
        isDeleted: NON_DELETED,
        isActive: { $ne: false },
        status: { $nin: ["out_of_service", "retired", "inactive"] },
      }),
      User.countDocuments({
        role:"agent"
      }),
      User.countDocuments({
        role:{
          $in:[
            "guide",
            "tour_guide",
            "tourguide"
          ]
        }
      }),
      Agent.countDocuments({
        status:{
            $ne:"inactive"
        }
    }),
    ]);

    /*
    |--------------------------------------------------------------------------
    | ACTUAL CASH REVENUE
    |--------------------------------------------------------------------------
    |
    | Payment is the source of truth for money actually received.
    | Booking.totalAmount is the value of a booking, not necessarily cash
    | received, so it must not be used as a revenue fallback.
    |
    |--------------------------------------------------------------------------
    */
    const [
      paymentStats,
      revenueResult,
      monthlyRevenue,
      bookingStatus,
      popularTours,
      recentBookings,
      agentPerformance,
      guidePerformance,
      notifications,
    ] = await Promise.all([
      Payment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            amount: { $sum: {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $ifNull: ["$amount", 0] },
                      { $ifNull: ["$refundedAmount", 0] },
                    ],
                  },
                ],
              } },
          },
        },
      ]),

      Payment.aggregate([
        {
          $match: {
            status: ACTIVE_PAYMENT_STATUS,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $ifNull: ["$amount", 0] },
                      { $ifNull: ["$refundedAmount", 0] },
                    ],
                  },
                ],
              } },
          },
        },
      ]),

      Payment.aggregate([
        {
          $match: {
            status: ACTIVE_PAYMENT_STATUS,
          },
        },
        {
          $group: {
            _id: {
              year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } },
              month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } },
            },
            amount: { $sum: {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $ifNull: ["$amount", 0] },
                      { $ifNull: ["$refundedAmount", 0] },
                    ],
                  },
                ],
              } },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),

      Booking.aggregate([
        {
          $match: {
            isDeleted: NON_DELETED,
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      Booking.aggregate([
        {
          $match: {
            isDeleted: NON_DELETED,
            status: { $nin: ["cancelled", "refunded"] },
          },
        },
        {
          $group: {
            _id: "$tour",
            totalBookings: { $sum: 1 },
            bookingValue: {
              $sum: { $ifNull: ["$totalAmount", 0] },
            },
            guests: {
              $sum: { $ifNull: ["$numberOfGuests", 1] },
            },
          },
        },
        {
          $lookup: {
            from: "tours",
            localField: "_id",
            foreignField: "_id",
            as: "tour",
          },
        },
        { $unwind: "$tour" },
        {
          $match: {
            "tour.isDeleted": NON_DELETED,
          },
        },
        {
          $project: {
            _id: 1,
            title: "$tour.title",
            totalBookings: 1,
            bookingValue: 1,
            guests: 1,
          },
        },
        { $sort: { totalBookings: -1, bookingValue: -1 } },
        { $limit: 5 },
      ]),

      Booking.find(mergeTenantFilter(req,{
        isDeleted: NON_DELETED,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("tour", "title")
        .populate("customer", "name email phone")
        .populate("user", "name email phone")
        .lean(),

      Booking.aggregate([
        {
          $match: {
            isDeleted: NON_DELETED,
            agent: { $ne: null },
            status: { $nin: ["cancelled", "refunded"] },
          },
        },
        {
          $group: {
            _id: "$agent",
            bookings: { $sum: 1 },
            commission: {
              $sum: { $ifNull: ["$commissionAmount", 0] },
            },
          },
        },
        {
          $lookup: {
            from: "agents",
            localField: "_id",
            foreignField: "_id",
            as: "agentProfile",
          },
        },
        { $unwind: "$agentProfile" },
        {
          $lookup: {
            from: "users",
            localField: "agentProfile.user",
            foreignField: "_id",
            as: "agentUser",
          },
        },
        { $unwind: { path: "$agentUser", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: { $ifNull: ["$agentUser.name", "$agentProfile.companyName"] },
            email: { $ifNull: ["$agentUser.email", "$agentProfile.email"] },
            bookings: 1,
            commission: 1,
          },
        },
        { $sort: { bookings: -1 } },
      ]),

      Staff.aggregate([
        {
          $match: {
            position: "guide",
            isDeleted: NON_DELETED,
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "tours",
            let: { guideId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$assignedGuide", "$$guideId"],
                  },
                  isDeleted: NON_DELETED,
                },
              },
              { $count: "count" },
            ],
            as: "tourCount",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            availability: 1,
            assignedTours: {
              $ifNull: [
                { $arrayElemAt: ["$tourCount.count", 0] },
                0,
              ],
            },
          },
        },
        { $sort: { name: 1 } },
      ]),

      Notification.find(tenantFilter(req))
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const statsByStatus = Object.fromEntries(
      paymentStats.map((item) => [
        item._id || "unknown",
        {
          count: item.count || 0,
          amount: item.amount || 0,
        },
      ])
    );

    const paidPayments = statsByStatus.completed || {
      count: 0,
      amount: 0,
    };

    const pendingPayments = statsByStatus.pending || {
      count: 0,
      amount: 0,
    };

    const failedPayments = statsByStatus.failed || {
      count: 0,
      amount: 0,
    };

    const normalizedRecentBookings = recentBookings.map((booking) => ({
      ...booking,
      amount: booking.totalAmount || 0,
      paymentStatus: booking.paymentStatus || "pending",
    }));

    const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({
      month: `${item._id.month}/${item._id.year}`,
      amount: item.amount || 0,
    }));

    const revenue = revenueResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data: {
        users,
        customers,
        tours,
        bookings,
        destinations,

        revenue,

        monthlyRevenue: formattedMonthlyRevenue,

        paymentStats: {
          completed: paidPayments.count,
          completedAmount: paidPayments.amount,
          pending: pendingPayments.count,
          pendingAmount: pendingPayments.amount,
          failed: failedPayments.count,
          failedAmount: failedPayments.amount,
        },

        status: bookingStatus,
        statusData: bookingStatus,

        popularTours,

        recentBookings: normalizedRecentBookings,

        notifications,

        userStats: {
          customers,
          admins: adminsCount,
          agents: Math.max(agentsCount, agentUsersCount),
          guides: Math.max(guidesCount, guideUsersCount),
          vehicles: vehiclesCount,
        },

        agents: await Agent.find(mergeTenantFilter(req,{
          status: { $ne: "inactive" }
        })
        .select("companyName email phone status")
        .lean(),

        guides: await Staff.find(mergeTenantFilter(req,{
          $or: [
            {
              position: {
                $in: [
                  "guide",
                  "tour_guide",
                  "tourguide"
                ]
              }
            },
            {
              role: {
                $in: [
                  "guide",
                  "tour_guide",
                  "tourguide"
                ]
              }
            }
          ],
          isDeleted: false,
          isActive: true
        })
        .select("name email phone position role")
        .lean(),

        vehicles: await Vehicle.find(mergeTenantFilter(req,{
          isDeleted: { $ne: true },
          isActive: true
        })
        .select(
          "name registrationNumber model status"
        )
        .lean(),
        guidesCount: Math.max(guidesCount, guideUsersCount),
        agentsCount: Math.max(agentsCount, agentUsersCount),

        userStats: {
          customers,
          admins: adminsCount,
          agents: Math.max(agentsCount, agentUsersCount),
          guides: Math.max(guidesCount, guideUsersCount),
          vehicles: vehiclesCount,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load dashboard",
    });
  }
};

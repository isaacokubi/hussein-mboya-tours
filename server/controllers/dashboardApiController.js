import {mergeTenantFilter} from "../tenancy/secureQuery.js";
// server/controllers/agentDashboardController.js

import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";

/*
|--------------------------------------------------------------------------
| AGENT DASHBOARD
|--------------------------------------------------------------------------
|
| GET /api/agent/dashboard
|--------------------------------------------------------------------------
*/

export const getAgentDashboard = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Get Agent Profile
    |--------------------------------------------------------------------------
    */

    const agent = await Agent.findOne(mergeTenantFilter(req,{
      user: req.user._id,
    }).lean();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Dashboard Statistics
    |--------------------------------------------------------------------------
    */

    const [
      totalBookings,
      activeBookings,
      completedBookings,
      totalSales,
      totalCommission,
      pendingCommission,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments({
        agent: agent._id,
      }),

      Booking.countDocuments({
        agent: agent._id,
        status: "confirmed",
      }),

      Booking.countDocuments({
        agent: agent._id,
        status: "completed",
      }),

      Booking.aggregate([
        {
          $match: {
            agent: agent._id,
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ["$totalAmount", 0],
              },
            },
          },
        },
      ]),

      Commission.aggregate([
        {
          $match: {
            agent: agent._id,
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

      Commission.aggregate([
        {
          $match: {
            agent: agent._id,
            status: "pending",
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

      Booking.find(mergeTenantFilter(req,{
        agent: agent._id,
      })
        .populate("tour", "title destination")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),
    ]);

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      data: {
        agent: {
          id: agent._id,
          companyName: agent.companyName,
          commissionRate: agent.commissionRate,
          walletBalance: agent.walletBalance,
        },

        statistics: {
          totalBookings,

          activeBookings,

          completedBookings,

          totalSales: totalSales[0]?.total || 0,

          totalCommission:
            totalCommission[0]?.total || 0,

          pendingCommission:
            pendingCommission[0]?.total || 0,
        },

        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";

export const getAgentDashboard = async (req, res, next) => {
  try {
    /*
|--------------------------------------------------------------------------
| GET AGENT PROFILE
|--------------------------------------------------------------------------
*/

    const agent = await Agent.findOne({
      user: req.user._id,
    });

    if (!agent) {
      return res.status(404).json({
        message: "Agent profile not found",
      });
    }

    /*
|--------------------------------------------------------------------------
| BOOKING STATISTICS
|--------------------------------------------------------------------------
*/

    const bookings = await Booking.countDocuments({
      agent: agent._id,
    });

    const completedTours = await Booking.countDocuments({
      agent: agent._id,

      bookingStatus: "completed",
    });

    /*
|--------------------------------------------------------------------------
| TOTAL SALES
|--------------------------------------------------------------------------
*/

    const salesResult = await Booking.aggregate([
      {
        $match: {
          agent: agent._id,

          paymentStatus: "paid",
        },
      },

      {
        $group: {
          _id: null,

          totalSales: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalSales = salesResult[0]?.totalSales || 0;

    /*
|--------------------------------------------------------------------------
| COMMISSION
|--------------------------------------------------------------------------
*/

    const commissionResult = await Commission.aggregate([
      {
        $match: {
          agent: agent._id,
        },
      },

      {
        $group: {
          _id: null,

          totalCommission: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalCommission = commissionResult[0]?.totalCommission || 0;

    /*
|--------------------------------------------------------------------------
| RECENT BOOKINGS
|--------------------------------------------------------------------------
*/

    const recentBookings = await Booking.find({
      agent: agent._id,
    })

      .populate("tour", "name price")

      .sort({
        createdAt: -1,
      })

      .limit(5);

    res.json({
      success: true,

      data: {
        agent: {
          id: agent._id,

          companyName: agent.companyName,

          walletBalance: agent.walletBalance,

          commissionRate: agent.commissionRate,
        },

        statistics: {
          bookings,

          completedTours,

          totalSales,

          totalCommission,
        },

        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

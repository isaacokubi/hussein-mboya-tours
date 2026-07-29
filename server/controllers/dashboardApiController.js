import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";

export const getAgentDashboard = async (req, res) => {
  const agentId = req.user.agentId;

  const [
    totalBookings,
    activeBookings,
    completedBookings,
    totalCommission,
    pendingCommission,
  ] = await Promise.all([
    Booking.countDocuments({
      agent: agentId,
    }),

    Booking.countDocuments({
      agent: agentId,
      status: "confirmed",
    }),

    Booking.countDocuments({
      agent: agentId,
      status: "completed",
    }),

    Commission.aggregate([
      {
        $match: {
          agent: agentId,
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
    ]),

    Commission.aggregate([
      {
        $match: {
          agent: agentId,
          status: "pending",
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
    ]),
  ]);

  res.json({
    success: true,

    stats: {
      totalBookings,

      activeBookings,

      completedBookings,

      totalCommission: totalCommission[0]?.total || 0,

      pendingCommission: pendingCommission[0]?.total || 0,
    },
  });
};

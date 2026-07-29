import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";

export const dashboardStats = async (req, res) => {
  const users = await User.countDocuments();

  const tours = await Tour.countDocuments();

  const bookings = await Booking.countDocuments();

  const revenue = await Booking.aggregate([
    {
      $match: {
        paymentStatus: "paid",
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

  res.json({
    users,

    tours,

    bookings,

    revenue: revenue[0]?.total || 0,
  });
};

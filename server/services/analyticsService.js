import Booking from "../models/Booking.js";

/*
|--------------------------------------------------------------------------
| TOTAL REVENUE
|--------------------------------------------------------------------------
*/

export const getRevenueAnalytics = async () => {
  try {
    const [result] = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
          totalBookings: {
            $sum: 1,
          },
        },
      },
    ]);

    return (
      result || {
        totalRevenue: 0,
        totalBookings: 0,
      }
    );
  } catch (error) {
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| BOOKINGS PER MONTH
|--------------------------------------------------------------------------
*/

export const getBookingAnalytics = async () => {
  try {
    return await Booking.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },
          bookings: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
  } catch (error) {
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| MOST POPULAR TOURS
|--------------------------------------------------------------------------
*/

export const getPopularTours = async () => {
  try {
    return await Booking.aggregate([
      {
        $group: {
          _id: "$tour",
          totalBookings: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          totalBookings: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "tours",
          localField: "_id",
          foreignField: "_id",
          as: "tour",
        },
      },
      {
        $unwind: {
          path: "$tour",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          totalBookings: 1,
          "tour._id": 1,
          "tour.title": 1,
          "tour.slug": 1,
          "tour.price": 1,
          "tour.images": 1,
        },
      },
    ]);
  } catch (error) {
    throw error;
  }
};
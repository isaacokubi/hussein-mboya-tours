import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| TOUR MANAGER REPORTS
|--------------------------------------------------------------------------
*/

export const getTourReports = async (req, res, next) => {
    try {
        /*
        |--------------------------------------------------------------------------
        | BOOKINGS
        |--------------------------------------------------------------------------
        */

        const totalBookings = await Booking.countDocuments();

        /*
        |--------------------------------------------------------------------------
        | REVENUE
        |--------------------------------------------------------------------------
        */

        const revenueResult = await Booking.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$totalAmount",
                    },
                },
            },
        ]);

        const totalRevenue = revenueResult[0]?.total || 0;

        /*
        |--------------------------------------------------------------------------
        | BOOKING STATUS
        |--------------------------------------------------------------------------
        */

        const bookingStatus = await Booking.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);

        /*
        |--------------------------------------------------------------------------
        | POPULAR TOURS
        |--------------------------------------------------------------------------
        */

        const popularTours = await Booking.aggregate([
            {
                $group: {
                    _id: "$tour",
                    bookings: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    bookings: -1,
                },
            },
            {
                $limit: 5,
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
                $unwind: "$tour",
            },
            {
                $project: {
                    bookings: 1,
                    title: "$tour.title",
                    slug: "$tour.slug",
                    price: "$tour.price",
                    image: "$tour.images",
                },
            },
        ]);

        /*
        |--------------------------------------------------------------------------
        | MONTHLY REVENUE
        |--------------------------------------------------------------------------
        */

        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                },
            },
            {
                $group: {
                    _id: {
                        year: {
                            $year: "$createdAt",
                        },
                        month: {
                            $month: "$createdAt",
                        },
                    },
                    revenue: {
                        $sum: "$totalAmount",
                    },
                    bookings: {
                        $sum: 1,
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

        /*
        |--------------------------------------------------------------------------
        | CUSTOMERS
        |--------------------------------------------------------------------------
        */

        const totalCustomers = await User.countDocuments({
            role: "customer",
        });

        /*
        |--------------------------------------------------------------------------
        | TOURS
        |--------------------------------------------------------------------------
        */

        const totalTours = await Tour.countDocuments();

        const completedTours = await Tour.countDocuments({
            status: "completed",
        });

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({
            success: true,
            data: {
                totalBookings,
                totalRevenue,
                totalCustomers,
                totalTours,
                completedTours,
                bookingStatus,
                popularTours,
                monthlyRevenue,
            },
        });
    } catch (error) {
        console.error("TOUR REPORT ERROR:", error);
        next(error);
    }
};
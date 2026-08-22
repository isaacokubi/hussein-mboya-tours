import { mergeTenantFilter } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

/*
|--------------------------------------------------------------------------
| TOUR MANAGER REPORTS
|--------------------------------------------------------------------------
*/

export const getTourReports = async (req, res, next) => {
    try {
        const totalBookings = await Booking.countDocuments({ isDeleted: { $ne: true } });

        // Revenue is cash actually received, not booking value. Only completed
        // payments count, with refunded amounts deducted from the recognized revenue.
        const [revenueResult] = await Payment.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $max: [
                                0,
                                {
                                    $subtract: [
                                        { $ifNull: ["$amount", 0] },
                                        { $ifNull: ["$refundedAmount", 0] },
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
        ]);

        const totalRevenue = revenueResult?.total || 0;

        const bookingStatus = await Booking.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        // Popular tours are based on completed/paid bookings, not failed or
        // cancelled booking records. This keeps the analytics consistent with revenue.
        const popularTours = await Payment.aggregate([
            { $match: { status: "completed", booking: { $ne: null } } },
            {
                $lookup: {
                    from: "bookings",
                    localField: "booking",
                    foreignField: "_id",
                    as: "bookingDoc",
                },
            },
            { $unwind: "$bookingDoc" },
            { $match: { "bookingDoc.isDeleted": { $ne: true } } },
            {
                $group: {
                    _id: "$bookingDoc.tour",
                    bookings: { $addToSet: "$bookingDoc._id" },
                    revenue: {
                        $sum: {
                            $max: [
                                0,
                                {
                                    $subtract: [
                                        { $ifNull: ["$amount", 0] },
                                        { $ifNull: ["$refundedAmount", 0] },
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    bookings: { $size: "$bookings" },
                    revenue: 1,
                },
            },
            { $sort: { bookings: -1, revenue: -1 } },
            { $limit: 5 },
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
                $project: {
                    bookings: 1,
                    revenue: 1,
                    title: "$tour.title",
                    slug: "$tour.slug",
                    price: "$tour.price",
                    image: "$tour.images",
                },
            },
        ]);

        // Monthly revenue follows the same payment-led definition as total revenue.
        const monthlyRevenue = await Payment.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: {
                        year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } },
                        month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } },
                    },
                    revenue: {
                        $sum: {
                            $max: [
                                0,
                                {
                                    $subtract: [
                                        { $ifNull: ["$amount", 0] },
                                        { $ifNull: ["$refundedAmount", 0] },
                                    ],
                                },
                            ],
                        },
                    },
                    bookings: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        const totalCustomers = await User.countDocuments({
            $or: [{ role: "customer" }, { legacyRole: "customer" }],
        });

        const totalTours = await Tour.countDocuments({ isDeleted: { $ne: true } });

        const completedTours = await Tour.countDocuments({
            status: "completed",
            isDeleted: { $ne: true },
        });

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

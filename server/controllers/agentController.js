import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) =>
    mongoose.Types.ObjectId.isValid(id);/*
|--------------------------------------------------------------------------
| AGENT DASHBOARD
|--------------------------------------------------------------------------
*/

export const getAgentDashboard = async (req, res, next) => {
    try {

        /*
        |--------------------------------------------------------------------------
        | Find Agent
        |--------------------------------------------------------------------------
        */

        let agent = await Agent.findOne({
            user: req.user._id
        }).lean();

        if (!agent && req.user.email) {
            agent = await Agent.findOne({
                email: String(req.user.email).toLowerCase(),
            }).lean();

            if (agent) {
                await Agent.updateOne(
                    { _id: agent._id },
                    { $set: { user: req.user._id } }
                );
            }
        }

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: "Agent profile not found."
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Run Queries In Parallel
        |--------------------------------------------------------------------------
        */

        const [

            bookings,

            upcomingBookings,

            completedTours,

            salesResult,

            guestsResult,

            commissionResult,

            pendingBookings,

            cancelledBookings,

            recentBookings

        ] = await Promise.all([

            Booking.countDocuments({
                agent: agent._id
            }),

            Booking.countDocuments({
                agent: agent._id,
                status: { $in: ["confirmed", "assigned", "ongoing"] }
            }),

            Booking.countDocuments({
                agent: agent._id,
                status: "completed"
            }),

            Booking.aggregate([

                {
                    $match: {
                        agent: agent._id,
                        paymentStatus: { $in: ["paid", "completed"] }
                    }
                },

                {
                    $group: {
                        _id: null,
                        totalSales: {
                            $sum: "$totalAmount"
                        }
                    }
                }

            ]),

            Booking.aggregate([
                {
                    $match: {
                        agent: agent._id,
                        status: { $ne: "cancelled" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalGuests: {
                            $sum: { $ifNull: ["$numberOfGuests", 1] }
                        }
                    }
                }
            ]),

            Commission.aggregate([

                {
                    $match: {
                        agent: agent._id
                    }
                },

                {
                    $group: {
                        _id: null,
                        totalCommission: {
                            $sum: "$amount"
                        }
                    }
                }

            ]),

            Booking.countDocuments({
                agent: agent._id,
                status: "pending"
            }),

            Booking.countDocuments({
                agent: agent._id,
                status: "cancelled"
            }),

            Booking.find({
                agent: agent._id
            })
                .populate(
                    "tour",
                    "title name price duration"
                )
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .lean()

        ]);

        /*
        |--------------------------------------------------------------------------
        | Totals
        |--------------------------------------------------------------------------
        */

        const totalSales =
            salesResult[0]?.totalSales || 0;

        const totalCommission =
            commissionResult[0]?.totalCommission || 0;

        const totalGuests =
            guestsResult[0]?.totalGuests || 0;

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        res.status(200).json({

            success: true,

            data: {

                agent: {

                    id: agent._id,

                    companyName: agent.companyName,

                    walletBalance: agent.walletBalance,

                    commissionRate: agent.commissionRate,

                    status: agent.status,
                    isApproved: Boolean(agent.isApproved),
                    pendingApproval: !agent.isApproved

                },

                statistics: {

                    bookings,

                    upcomingBookings,

                    completedTours,

                    pendingBookings,

                    cancelledBookings,

                    totalSales,

                    totalCommission,

                    totalGuests

                },

                recentBookings

            }

        });

    } catch (error) {

        next(error);

    }
};

/*
|--------------------------------------------------------------------------
| CURRENT AGENT COMMISSIONS
|--------------------------------------------------------------------------
*/

export const getMyAgentCommission = async (req, res, next) => {
    try {
        const agent = await Agent.findOne({ user: req.user._id }).lean();

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: "Agent profile not found.",
            });
        }

        const commissions = await Commission.find({
            agent: agent._id,
        })
            .populate("booking")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: commissions,
        });
    } catch (error) {
        next(error);
    }
};

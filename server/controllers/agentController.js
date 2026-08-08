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

        const agent = await Agent.findOne({
            user: req.user._id
        }).lean();

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

            completedTours,

            salesResult,

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
                status: "completed"
            }),

            Booking.aggregate([

                {
                    $match: {
                        agent: agent._id,
                        paymentStatus: "paid"
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

                    status: agent.status

                },

                statistics: {

                    bookings,

                    completedTours,

                    pendingBookings,

                    cancelledBookings,

                    totalSales,

                    totalCommission

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

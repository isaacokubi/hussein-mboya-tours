import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import TourPackage from "../models/TourPackage.js";
import Customer from "../models/Customer.js";
import Agent from "../models/Agent.js";

import { createCommission } from "../services/commissionService.js";/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) =>
    mongoose.Types.ObjectId.isValid(id);

const BOOKING_STATUSES = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "refunded"
];/*
|--------------------------------------------------------------------------
| CREATE AGENT BOOKING
|--------------------------------------------------------------------------
*/

export const createBooking = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const agentProfile =
            await Agent.findOne({
                user: req.user._id
            }).session(session);

        if (!agentProfile) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Agent profile not found."
            });

        }

        const {
            customer,
            tour,
            travelDate,
            travelers
        } = req.body;

        if (!isValidId(customer) || !isValidId(tour)) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Invalid customer or tour."
            });

        }

        if (!Array.isArray(travelers) || travelers.length === 0) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "At least one traveler is required."
            });

        }

        const [tourPackage, customerData] =
            await Promise.all([

                TourPackage.findById(tour).session(session),

                Customer.findById(customer).session(session)

            ]);

        if (!tourPackage) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Tour package not found."
            });

        }

        if (!customerData) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });

        }

        const travelerCount = travelers.length;

        const totalAmount =
            Number(tourPackage.price) * travelerCount;

        const booking = await Booking.create([{

            agent: agentProfile._id,

            user: customerData.user || null,

            customerSnapshot: {

                name: customerData.name,

                email: customerData.email,

                phone: customerData.phone

            },

            bookingSource: "agent",

            contact: {

                name: customerData.name,

                email: customerData.email,

                phone: customerData.phone

            },

            tour: tourPackage._id,

            travelDate,

            travelers,

            travelerCount,

            subtotal: totalAmount,

            amount: totalAmount,

            commissionRate:
                agentProfile.commissionRate,

            status: "pending",

            paymentStatus: "pending"

        }], {
            session
        });

        await createCommission(
            booking[0],
            session
        );

        await session.commitTransaction();

        res.status(201).json({

            success: true,

            booking: booking[0]

        });

    } catch (error) {

        await session.abortTransaction();

        next(error);

    } finally {

        session.endSession();

    }
};/*
|--------------------------------------------------------------------------
| GET AGENT BOOKINGS
|--------------------------------------------------------------------------
*/

export const getAgentBookings = async (req, res, next) => {
    try {

        /*
        |--------------------------------------------------------------------------
        | Find Agent Profile
        |--------------------------------------------------------------------------
        */

        const agentProfile = await Agent.findOne({
            user: req.user._id
        });

        if (!agentProfile) {
            return res.status(404).json({
                success: false,
                message: "Agent profile not found."
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Number(req.query.limit) || 20,
            100
        );

        const skip = (page - 1) * limit;

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        const filter = {
            agent: agentProfile._id
        };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.paymentStatus) {
            filter.paymentStatus = req.query.paymentStatus;
        }

        /*
        |--------------------------------------------------------------------------
        | Search Customer
        |--------------------------------------------------------------------------
        */

        if (req.query.search) {

            filter.$or = [

                {
                    "customerSnapshot.name": {
                        $regex: req.query.search,
                        $options: "i"
                    }
                },

                {
                    "customerSnapshot.email": {
                        $regex: req.query.search,
                        $options: "i"
                    }
                }

            ];

        }

        /*
        |--------------------------------------------------------------------------
        | Fetch
        |--------------------------------------------------------------------------
        */

        const [bookings, total] =
            await Promise.all([

                Booking.find(filter)

                    .populate(
                        "tour",
                        "title price duration"
                    )

                    .populate(
                        "user",
                        "name email phone"
                    )

                    .sort({
                        createdAt: -1
                    })

                    .skip(skip)

                    .limit(limit)

                    .lean(),

                Booking.countDocuments(filter)

            ]);

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        res.status(200).json({

            success: true,

            page,

            limit,

            total,

            pages: Math.ceil(total / limit),

            count: bookings.length,

            bookings

        });

    } catch (error) {

        next(error);

    }
};/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/

export const updateBookingStatus = async (req, res, next) => {
    try {

        /*
        |--------------------------------------------------------------------------
        | Validate Booking ID
        |--------------------------------------------------------------------------
        */

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID."
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Status
        |--------------------------------------------------------------------------
        */

        const { status } = req.body;

        if (!BOOKING_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking status."
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Agent Profile
        |--------------------------------------------------------------------------
        */

        const agentProfile = await Agent.findOne({
            user: req.user._id
        });

        if (!agentProfile) {
            return res.status(404).json({
                success: false,
                message: "Agent profile not found."
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Find Booking
        |--------------------------------------------------------------------------
        */

        const booking =
            await Booking.findOne({

                _id: req.params.id,

                agent: agentProfile._id

            });

        if (!booking) {

            return res.status(404).json({

                success: false,

                message: "Booking not found."

            });

        }

        /*
        |--------------------------------------------------------------------------
        | Prevent Editing Completed Booking
        |--------------------------------------------------------------------------
        */

        if (
            booking.status === "completed"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Completed bookings cannot be modified."

            });

        }

        /*
        |--------------------------------------------------------------------------
        | Update
        |--------------------------------------------------------------------------
        */

        booking.status = status;

        await booking.save();

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        res.status(200).json({

            success: true,

            message:
                "Booking status updated successfully.",

            booking

        });

    } catch (error) {

        next(error);

    }
};
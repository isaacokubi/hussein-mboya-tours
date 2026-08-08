import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| TOUR MANAGER DASHBOARD
|--------------------------------------------------------------------------
*/

export const getTourManagerDashboard = async (req, res, next) => {
    try {
        const totalTours = await Tour.countDocuments();

        const upcomingTours = await Tour.find({
            startDate: { $gte: new Date() },
            status: {
                $in: ["active", "upcoming", "ongoing"],
            },
        })
            .populate("assignedGuide", "name email")
            .populate("assignedVehicle", "name registration type")
            .sort({ startDate: 1 })
            .limit(10)
            .lean();

        const totalCustomers = await User.countDocuments({
            role: "customer",
        });

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

        const revenue = revenueResult[0]?.total || 0;

        const formattedTours = upcomingTours.map((tour) => ({
            id: tour._id,
            name: tour.title,
            date: tour.startDate
                ? new Date(tour.startDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                  })
                : "No date",
            guests: tour.capacity || 0,
            guide: tour.assignedGuide?.name || "Not Assigned",
            vehicle:
                tour.assignedVehicle?.registration ||
                tour.assignedVehicle?.name ||
                "Not Assigned",
            status: tour.status,
        }));

        const recentBookings = await Booking.find()
            .populate("customer", "name email")
            .populate("tour", "title")
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();

        const formattedBookings = recentBookings.map((booking) => ({
            id: booking._id,
            customer:
                booking.customer?.name ||
                booking.customerSnapshot?.name ||
                "Unknown",
            tour: booking.tour?.title || "Unknown",
            guests: booking.numberOfGuests || 0,
            payment: booking.paymentStatus || "pending",
            amount: booking.totalAmount || 0,
        }));

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalTours,
                    upcomingTours: upcomingTours.length,
                    totalCustomers,
                    revenue,
                },
                upcomingTours: formattedTours,
                recentBookings: formattedBookings,
            },
        });
    } catch (error) {
        console.error("TOUR MANAGER DASHBOARD ERROR:", error);
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/

export const createTour = async (req, res, next) => {
    try {
        const tour = await Tour.create({
            ...req.body,
            createdBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Tour created successfully",
            data: tour,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET ALL TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async (req, res, next) => {
    try {
        const tours = await Tour.find()
            .populate("assignedGuide", "name email")
            .populate("assignedVehicle", "name registration type")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: tours.length,
            data: tours,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/

export const updateTour = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tour ID",
            });
        }

        const tour = await Tour.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: "Tour not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tour updated successfully",
            data: tour,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/

export const deleteTour = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tour ID",
            });
        }

        const tour = await Tour.findByIdAndDelete(req.params.id);

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: "Tour not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tour deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
import mongoose from "mongoose";

import Vehicle from "../models/Vehicle.js";
import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";

/*
|--------------------------------------------------------------------------
| CREATE VEHICLE
|--------------------------------------------------------------------------
*/

export const createVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.create({
            ...req.body,
            image: req.file?.path || "",
        });

        return res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: vehicle,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET ALL VEHICLES
|--------------------------------------------------------------------------
*/

export const getVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.find({})
            .populate("driver", "name phone email")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE VEHICLE
|--------------------------------------------------------------------------
*/

export const getVehicle = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid vehicle ID",
            });
        }

        const vehicle = await Vehicle.findById(req.params.id)
            .populate("driver", "name phone email")
            .lean();

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: vehicle,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| UPDATE VEHICLE
|--------------------------------------------------------------------------
*/

export const updateVehicle = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid vehicle ID",
            });
        }

        const updateData = {
            ...req.body,
        };

        if (req.file) {
            updateData.image = req.file.path;
        }

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: vehicle,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| DELETE VEHICLE (SOFT DELETE)
|--------------------------------------------------------------------------
*/

export const deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: true,
                status: "inactive",
            },
            { new: true }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| RESTORE VEHICLE
|--------------------------------------------------------------------------
*/

export const restoreVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: false,
                status: "available",
            },
            { new: true }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Vehicle restored successfully",
            data: vehicle,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| ASSIGN DRIVER
|--------------------------------------------------------------------------
*/

export const assignVehicleDriver = async (req, res, next) => {
    try {
        const { driver } = req.body;

        if (driver) {
            const driverExists = await Staff.findOne({
                _id: driver,
                position: "driver",
                isActive: true,
            });

            if (!driverExists) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid driver",
                });
            }

            await Staff.findByIdAndUpdate(driver, {
                availability: "busy",
            });
        }

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            {
                driver: driver || null,
            },
            {
                new: true,
            }
        ).populate("driver", "name phone");

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Driver assigned successfully",
            data: vehicle,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| REMOVE DRIVER
|--------------------------------------------------------------------------
*/

export const removeVehicleDriver = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        if (vehicle.driver) {
            await Staff.findByIdAndUpdate(vehicle.driver, {
                availability: "available",
            });
        }

        vehicle.driver = null;

        await vehicle.save();

        return res.status(200).json({
            success: true,
            message: "Driver removed successfully",
            data: vehicle,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| ASSIGN TOUR RESOURCES
|--------------------------------------------------------------------------
*/

export const assignTourResources = async (req, res, next) => {
    try {
        const {
            guideId,
            driverId,
            vehicleId,
            staffIds,
            startDate,
            endDate,
        } = req.body;

        const tour = await Tour.findById(req.params.id);

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: "Tour not found",
            });
        }

        if (guideId) {
            await Staff.findByIdAndUpdate(guideId, {
                availability: "busy",
            });
        }

        if (driverId) {
            await Staff.findByIdAndUpdate(driverId, {
                availability: "busy",
            });
        }

        if (staffIds?.length) {
            await Staff.updateMany(
                {
                    _id: {
                        $in: staffIds,
                    },
                },
                {
                    availability: "busy",
                }
            );
        }

        if (vehicleId) {
            await Vehicle.findByIdAndUpdate(vehicleId, {
                status: "assigned",
            });
        }

        tour.assignedGuide = guideId || tour.assignedGuide;
        tour.driver = driverId || tour.driver;
        tour.assignedVehicle = vehicleId || tour.assignedVehicle;

        tour.staff = staffIds || tour.staff;
        tour.startDate = startDate || tour.startDate;
        tour.endDate = endDate || tour.endDate;

        await tour.save();

        const updatedTour = await Tour.findById(tour._id)
            .populate("assignedGuide")
            .populate("driver")
            .populate("assignedVehicle")
            .populate("staff");

        return res.status(200).json({
            success: true,
            message: "Tour resources assigned successfully",
            data: updatedTour,
        });
    } catch (error) {
        next(error);
    }
};
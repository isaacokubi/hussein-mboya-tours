import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
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
  requireTenantId();
    try {
        const rawCapacity = req.body.capacity;
        const capacity = Number(rawCapacity);
        const year = req.body.year === undefined || req.body.year === "" ? undefined : Number(req.body.year);

        if (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capacity)) {
            return res.status(400).json({
                success: false,
                message: "Passenger capacity must be a whole number greater than 0.",
                field: "capacity",
            });
        }

        if (year !== undefined && (!Number.isFinite(year) || year < 1990 || year > new Date().getFullYear() + 1)) {
            return res.status(400).json({
                success: false,
                message: "Vehicle year is invalid.",
                field: "year",
            });
        }

        const payload = {
            ...req.body,
            capacity,
            ...(year !== undefined ? { year } : {}),
        };

        if (req.file) {
            payload.image = {
                url: req.file.path,
                publicId: req.file.filename || req.file.public_id || "",
            };
        }

        const vehicle = await Vehicle.create(payload);

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
        const vehicles = await Vehicle.find({
              isDeleted: { $ne: true }
          })
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

        const vehicle = await Vehicle.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
)
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

        if (updateData.capacity !== undefined) {
            const capacity = Number(updateData.capacity);
            if (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capacity)) {
                return res.status(400).json({
                    success: false,
                    message: "Passenger capacity must be a whole number greater than 0.",
                    field: "capacity",
                });
            }
            updateData.capacity = capacity;
        }

        if (updateData.year !== undefined && updateData.year !== "") {
            const year = Number(updateData.year);
            if (!Number.isFinite(year)) {
                return res.status(400).json({
                    success: false,
                    message: "Vehicle year is invalid.",
                    field: "year",
                });
            }
            updateData.year = year;
        }

        if (req.file) {
            updateData.image = {
                url: req.file.path,
                publicId: req.file.filename || req.file.public_id || "",
            };
        }

        const vehicle = await 
Vehicle.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),

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
        const vehicle = await 
Vehicle.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),

            {
                isDeleted: true,
                isActive: false,
                status: "out_of_service",
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
        const vehicle = await 
Vehicle.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),

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
        const driver = req.body.driverId || req.body.driver || null;

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

        const vehicle = await 
Vehicle.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),

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
        const vehicle = await Vehicle.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

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

        const tour = await Tour.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

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
        tour.assignedDriver = driverId || tour.assignedDriver;
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

/*
|--------------------------------------------------------------------------
| UPDATE VEHICLE STATUS
|--------------------------------------------------------------------------
*/

export const updateVehicleStatus = async (req, res, next) => {
  try {
    const allowedStatuses = [
      "available",
      "assigned",
      "maintenance",
      "out_of_service",
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid vehicle status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const vehicle = await 
Vehicle.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),

      { status },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle status updated successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

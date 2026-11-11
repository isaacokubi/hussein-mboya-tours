/**
 * Purpose: vehicle Controller HTTP controller. Main declarations: createVehicle, getVehicles, getVehicle, updateVehicle, deleteVehicle.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";

/*
|--------------------------------------------------------------------------
| CREATE VEHICLE
|--------------------------------------------------------------------------
*/

// Declare createVehicle for use by the surrounding module or function.
export const createVehicle = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Declare rawCapacity for use by the surrounding module or function.
        const rawCapacity = req.body.capacity;
        // Declare capacity for use by the surrounding module or function.
        const capacity = Number(rawCapacity);
        // Declare year for use by the surrounding module or function.
        const year = req.body.year === undefined || req.body.year === "" ? undefined : Number(req.body.year);

        // Check the condition (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capaci) and run the matching branch.
        if (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capacity)) {
            // Return the result of res.status(400).json() to the caller.
            return res.status(400).json({
                success: false,
                message: "Passenger capacity must be a whole number greater than 0.",
                field: "capacity",
            });
        }

        // Check the condition (year !== undefined && (!Number.isFinite(year) || year < 1990 || year >) and run the matching branch.
        if (year !== undefined && (!Number.isFinite(year) || year < 1990 || year > new Date().getFullYear() + 1)) {
            // Return the result of res.status(400).json() to the caller.
            return res.status(400).json({
                success: false,
                message: "Vehicle year is invalid.",
                field: "year",
            });
        }

        // Declare payload for use by the surrounding module or function.
        const payload = {
            ...req.body,
            capacity,
            ...(year !== undefined ? { year } : {}),
        };

        // Check the condition (req.file) and run the matching branch.
        if (req.file) {
            // Perform the side effect or state update expressed on the following line.
            payload.image = {
                url: req.file.path,
                publicId: req.file.filename || req.file.public_id || "",
            };
        }

        // Declare vehicle for use by the surrounding module or function.
        const vehicle = await Vehicle.create(payload);

        // Return the result of res.status(201).json() to the caller.
        return res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: vehicle,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET ALL VEHICLES
|--------------------------------------------------------------------------
*/

// Declare getVehicles for use by the surrounding module or function.
export const getVehicles = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Declare vehicles for use by the surrounding module or function.
        const vehicles = await Vehicle.find({
              isDeleted: { $ne: true }
          })
            .populate("driver", "name phone email")
            .sort({ createdAt: -1 })
            .lean();

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE VEHICLE
|--------------------------------------------------------------------------
*/

// Declare getVehicle for use by the surrounding module or function.
export const getVehicle = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            // Return the result of res.status(400).json() to the caller.
            return res.status(400).json({
                success: false,
                message: "Invalid vehicle ID",
            });
        }

        // Declare vehicle for use by the surrounding module or function.
        const vehicle = await Vehicle.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
)
            .populate("driver", "name phone email")
            .lean();

        // Check the condition (!vehicle) and run the matching branch.
        if (!vehicle) {
            // Return the result of res.status(404).json() to the caller.
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            data: vehicle,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| UPDATE VEHICLE
|--------------------------------------------------------------------------
*/

// Declare updateVehicle for use by the surrounding module or function.
export const updateVehicle = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            // Return the result of res.status(400).json() to the caller.
            return res.status(400).json({
                success: false,
                message: "Invalid vehicle ID",
            });
        }

        // Declare updateData for use by the surrounding module or function.
        const updateData = {
            ...req.body,
        };

        // Check the condition (updateData.capacity !== undefined) and run the matching branch.
        if (updateData.capacity !== undefined) {
            // Declare capacity for use by the surrounding module or function.
            const capacity = Number(updateData.capacity);
            // Check the condition (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capaci) and run the matching branch.
            if (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capacity)) {
                // Return the result of res.status(400).json() to the caller.
                return res.status(400).json({
                    success: false,
                    message: "Passenger capacity must be a whole number greater than 0.",
                    field: "capacity",
                });
            }
            // Perform the side effect or state update expressed on the following line.
            updateData.capacity = capacity;
        }

        // Check the condition (updateData.year !== undefined && updateData.year !== "") and run the matching branch.
        if (updateData.year !== undefined && updateData.year !== "") {
            // Declare year for use by the surrounding module or function.
            const year = Number(updateData.year);
            // Check the condition (!Number.isFinite(year)) and run the matching branch.
            if (!Number.isFinite(year)) {
                // Return the result of res.status(400).json() to the caller.
                return res.status(400).json({
                    success: false,
                    message: "Vehicle year is invalid.",
                    field: "year",
                });
            }
            // Perform the side effect or state update expressed on the following line.
            updateData.year = year;
        }

        // Check the condition (req.file) and run the matching branch.
        if (req.file) {
            // Perform the side effect or state update expressed on the following line.
            updateData.image = {
                url: req.file.path,
                publicId: req.file.filename || req.file.public_id || "",
            };
        }

        // Declare vehicle for use by the surrounding module or function.
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

        // Check the condition (!vehicle) and run the matching branch.
        if (!vehicle) {
            // Return the result of res.status(404).json() to the caller.
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: vehicle,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| DELETE VEHICLE (SOFT DELETE)
|--------------------------------------------------------------------------
*/

// Declare deleteVehicle for use by the surrounding module or function.
export const deleteVehicle = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Declare vehicle for use by the surrounding module or function.
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

        // Check the condition (!vehicle) and run the matching branch.
        if (!vehicle) {
            // Return the result of res.status(404).json() to the caller.
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully",
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| RESTORE VEHICLE
|--------------------------------------------------------------------------
*/

// Declare restoreVehicle for use by the surrounding module or function.
export const restoreVehicle = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Declare vehicle for use by the surrounding module or function.
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

        // Check the condition (!vehicle) and run the matching branch.
        if (!vehicle) {
            // Return the result of res.status(404).json() to the caller.
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            message: "Vehicle restored successfully",
            data: vehicle,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| ASSIGN DRIVER
|--------------------------------------------------------------------------
*/

// Declare assignVehicleDriver for use by the surrounding module or function.
export const assignVehicleDriver = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Declare driver for use by the surrounding module or function.
        const driver = req.body.driverId || req.body.driver || null;

        // Check the condition (driver) and run the matching branch.
        if (driver) {
            // Declare driverExists for use by the surrounding module or function.
            const driverExists = await Staff.findOne({
                _id: driver,
                position: "driver",
                isActive: true,
            });

            // Check the condition (!driverExists) and run the matching branch.
            if (!driverExists) {
                // Return the result of res.status(400).json() to the caller.
                return res.status(400).json({
                    success: false,
                    message: "Invalid driver",
                });
            }

            // Perform the side effect or state update expressed on the following line.
            await Staff.findByIdAndUpdate(driver, {
                availability: "busy",
            });
        }

        // Declare vehicle for use by the surrounding module or function.
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

        // Check the condition (!vehicle) and run the matching branch.
        if (!vehicle) {
            // Return the result of res.status(404).json() to the caller.
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            message: "Driver assigned successfully",
            data: vehicle,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| REMOVE DRIVER
|--------------------------------------------------------------------------
*/

// Declare removeVehicleDriver for use by the surrounding module or function.
export const removeVehicleDriver = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Declare vehicle for use by the surrounding module or function.
        const vehicle = await Vehicle.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

        // Check the condition (!vehicle) and run the matching branch.
        if (!vehicle) {
            // Return the result of res.status(404).json() to the caller.
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        // Check the condition (vehicle.driver) and run the matching branch.
        if (vehicle.driver) {
            // Perform the side effect or state update expressed on the following line.
            await Staff.findByIdAndUpdate(vehicle.driver, {
                availability: "available",
            });
        }

        // Perform the side effect or state update expressed on the following line.
        vehicle.driver = null;

        // Perform the side effect or state update expressed on the following line.
        await vehicle.save();

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            message: "Driver removed successfully",
            data: vehicle,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| ASSIGN TOUR RESOURCES
|--------------------------------------------------------------------------
*/

// Declare assignTourResources for use by the surrounding module or function.
export const assignTourResources = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        // Declare { guideId, driverId, vehicleId, staffIds, startDate, endDate, } for use by the surrounding module or function.
        const {
            guideId,
            driverId,
            vehicleId,
            staffIds,
            startDate,
            endDate,
        } = req.body;

        // Declare tour for use by the surrounding module or function.
        const tour = await Tour.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

        // Check the condition (!tour) and run the matching branch.
        if (!tour) {
            // Return the result of res.status(404).json() to the caller.
            return res.status(404).json({
                success: false,
                message: "Tour not found",
            });
        }

        // Check the condition (guideId) and run the matching branch.
        if (guideId) {
            // Perform the side effect or state update expressed on the following line.
            await Staff.findByIdAndUpdate(guideId, {
                availability: "busy",
            });
        }

        // Check the condition (driverId) and run the matching branch.
        if (driverId) {
            // Perform the side effect or state update expressed on the following line.
            await Staff.findByIdAndUpdate(driverId, {
                availability: "busy",
            });
        }

        // Check the condition (staffIds?.length) and run the matching branch.
        if (staffIds?.length) {
            // Perform the side effect or state update expressed on the following line.
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

        // Check the condition (vehicleId) and run the matching branch.
        if (vehicleId) {
            // Perform the side effect or state update expressed on the following line.
            await Vehicle.findByIdAndUpdate(vehicleId, {
                status: "assigned",
            });
        }

        // Perform the side effect or state update expressed on the following line.
        tour.assignedGuide = guideId || tour.assignedGuide;
        // Perform the side effect or state update expressed on the following line.
        tour.assignedDriver = driverId || tour.assignedDriver;
        // Perform the side effect or state update expressed on the following line.
        tour.assignedVehicle = vehicleId || tour.assignedVehicle;

        // Perform the side effect or state update expressed on the following line.
        tour.staff = staffIds || tour.staff;
        // Perform the side effect or state update expressed on the following line.
        tour.startDate = startDate || tour.startDate;
        // Perform the side effect or state update expressed on the following line.
        tour.endDate = endDate || tour.endDate;

        // Perform the side effect or state update expressed on the following line.
        await tour.save();

        // Declare updatedTour for use by the surrounding module or function.
        const updatedTour = await Tour.findById(tour._id)
            .populate("assignedGuide")
            .populate("driver")
            .populate("assignedVehicle")
            .populate("staff");

        // Return the result of res.status(200).json() to the caller.
        return res.status(200).json({
            success: true,
            message: "Tour resources assigned successfully",
            data: updatedTour,
        });
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| UPDATE VEHICLE STATUS
|--------------------------------------------------------------------------
*/

// Declare updateVehicleStatus for use by the surrounding module or function.
export const updateVehicleStatus = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare allowedStatuses for use by the surrounding module or function.
    const allowedStatuses = [
      "available",
      "assigned",
      "maintenance",
      "out_of_service",
    ];

    // Declare { status } for use by the surrounding module or function.
    const { status } = req.body;

    // Check the condition (!allowedStatuses.includes(status)) and run the matching branch.
    if (!allowedStatuses.includes(status)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: `Invalid vehicle status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    // Declare vehicle for use by the surrounding module or function.
    const vehicle = await
Vehicle.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),

      { status },
      { new: true, runValidators: true }
    );

    // Check the condition (!vehicle) and run the matching branch.
    if (!vehicle) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message: "Vehicle status updated successfully",
      data: vehicle,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

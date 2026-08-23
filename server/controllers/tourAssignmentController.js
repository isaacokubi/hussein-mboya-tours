import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";

import { getSystemSettings } from "../services/settingsService.js";
// server/controllers/tourAssignmentController.js

import mongoose from "mongoose";

import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Notification from "../models/Notification.js";
import { sendSMS } from "../services/smsService.js";
import { sendWhatsApp } from "../services/whatsappService.js";

/*
|--------------------------------------------------------------------------
| ASSIGN TOUR RESOURCES
|--------------------------------------------------------------------------
|
| Canonical endpoint:
|
| PUT /api/tour-assignments/:id/assign
|
| Assign / replace / remove:
| - Guide
| - Driver
| - Vehicle
|
| Canonical Tour fields:
| - assignedGuide
| - assignedDriver
| - assignedVehicle
|
|--------------------------------------------------------------------------
*/

export const assignTourResources = async (req, res, next) => {
  requireTenantId();

    const settings = await getSystemSettings();
    const companyName = settings.companyName || "Company";
  try {
    const { guideId, driverId, vehicleId } = req.body;
    const tourId = req.params.id;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE TOUR ID
    |--------------------------------------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD TOUR
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.findById(tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE REQUEST
    |--------------------------------------------------------------------------
    |
    | Important:
    |
    | undefined = keep existing assignment
    | null / ""   = remove assignment
    | valid ID    = assign resource
    |
    |--------------------------------------------------------------------------
    */

    const nextGuideId =
      guideId === undefined
        ? tour.assignedGuide
        : guideId || null;

    const nextDriverId =
      driverId === undefined
        ? tour.assignedDriver
        : driverId || null;

    const nextVehicleId =
      vehicleId === undefined
        ? tour.assignedVehicle
        : vehicleId || null;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE RESOURCE IDS
    |--------------------------------------------------------------------------
    */

    if (
      nextGuideId &&
      !mongoose.Types.ObjectId.isValid(nextGuideId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID",
      });
    }

    if (
      nextDriverId &&
      !mongoose.Types.ObjectId.isValid(nextDriverId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid driver ID",
      });
    }

    if (
      nextVehicleId &&
      !mongoose.Types.ObjectId.isValid(nextVehicleId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD NEW RESOURCES
    |--------------------------------------------------------------------------
    */

    const [guide, driver, vehicle] = await Promise.all([
      nextGuideId
        ? Staff.findOne({
            _id: nextGuideId,
            position: "guide",
            isActive: true,
            isDeleted: false,
          })
        : null,

      nextDriverId
        ? Staff.findOne({
            _id: nextDriverId,
            position: "driver",
            isActive: true,
            isDeleted: false,
          })
        : null,

      nextVehicleId
        ? Vehicle.findOne({
            _id: nextVehicleId,
            isActive: true,
          })
        : null,
    ]);

    /*
    |--------------------------------------------------------------------------
    | VALIDATE GUIDE
    |--------------------------------------------------------------------------
    */

    if (nextGuideId && !guide) {
      return res.status(400).json({
        success: false,
        message: "Guide not found or inactive",
      });
    }

    if (
      guide &&
      guide.availability !== "available" &&
      guide._id.toString() !==
        tour.assignedGuide?.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected guide is unavailable",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE DRIVER
    |--------------------------------------------------------------------------
    */

    if (nextDriverId && !driver) {
      return res.status(400).json({
        success: false,
        message: "Driver not found or inactive",
      });
    }

    if (
      driver &&
      driver.availability !== "available" &&
      driver._id.toString() !==
        tour.assignedDriver?.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected driver is unavailable",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE VEHICLE
    |--------------------------------------------------------------------------
    */

    if (nextVehicleId && !vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found or inactive",
      });
    }

    if (
      vehicle &&
      vehicle.status !== "available" &&
      vehicle._id.toString() !==
        tour.assignedVehicle?.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected vehicle is unavailable",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CAPTURE OLD RESOURCES
    |--------------------------------------------------------------------------
    */

    const oldGuideId = tour.assignedGuide
      ? tour.assignedGuide.toString()
      : null;

    const oldDriverId = tour.assignedDriver
      ? tour.assignedDriver.toString()
      : null;

    const oldVehicleId = tour.assignedVehicle
      ? tour.assignedVehicle.toString()
      : null;

    const newGuideId = nextGuideId
      ? nextGuideId.toString()
      : null;

    const newDriverId = nextDriverId
      ? nextDriverId.toString()
      : null;

    const newVehicleId = nextVehicleId
      ? nextVehicleId.toString()
      : null;

    /*
    |--------------------------------------------------------------------------
    | RELEASE OLD GUIDE
    |--------------------------------------------------------------------------
    */

    if (
      oldGuideId &&
      oldGuideId !== newGuideId
    ) {
      const oldGuide = await Staff.findById(
        oldGuideId
      );

      if (oldGuide) {
        oldGuide.assignedTours =
          oldGuide.assignedTours.filter(
            (id) =>
              id.toString() !== tour._id.toString()
          );

        /*
        | Only make the guide available when
        | they have no remaining assigned tours.
        */

        if (oldGuide.assignedTours.length === 0) {
          oldGuide.availability = "available";
        }

        await oldGuide.save();
      }
    }

    /*
    |--------------------------------------------------------------------------
    | RELEASE OLD DRIVER
    |--------------------------------------------------------------------------
    */

    if (
      oldDriverId &&
      oldDriverId !== newDriverId
    ) {
      const oldDriver = await Staff.findById(
        oldDriverId
      );

      if (oldDriver) {
        oldDriver.assignedTours =
          oldDriver.assignedTours.filter(
            (id) =>
              id.toString() !== tour._id.toString()
          );

        /*
        | Only make the driver available when
        | they have no remaining assigned tours.
        */

        if (oldDriver.assignedTours.length === 0) {
          oldDriver.availability = "available";
        }

        await oldDriver.save();
      }
    }

    /*
    |--------------------------------------------------------------------------
    | RELEASE OLD VEHICLE
    |--------------------------------------------------------------------------
    */

    if (
      oldVehicleId &&
      oldVehicleId !== newVehicleId
    ) {
      await Vehicle.findOneAndUpdate(
        {
          _id: oldVehicleId,
          assignedTour: tour._id,
        },
        {
          $set: {
            status: "available",
            assignedTour: null,
          },
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE TOUR
    |--------------------------------------------------------------------------
    */

    tour.assignedGuide = nextGuideId || null;
    tour.assignedDriver = nextDriverId || null;
    tour.assignedVehicle = nextVehicleId || null;

    const hasAssignment =
      Boolean(nextGuideId) ||
      Boolean(nextDriverId) ||
      Boolean(nextVehicleId);

    tour.assignmentStatus = hasAssignment
      ? "assigned"
      : "pending";

    await tour.save();

    /*
    |--------------------------------------------------------------------------
    | ASSIGN NEW GUIDE
    |--------------------------------------------------------------------------
    */

    if (guide) {
      await Staff.findByIdAndUpdate(
        guide._id,
        {
          $set: {
            availability: "busy",
          },
          $addToSet: {
            assignedTours: tour._id,
          },
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ASSIGN NEW DRIVER
    |--------------------------------------------------------------------------
    */

    if (driver) {
      await Staff.findByIdAndUpdate(
        driver._id,
        {
          $set: {
            availability: "busy",
          },
          $addToSet: {
            assignedTours: tour._id,
          },
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ASSIGN NEW VEHICLE
    |--------------------------------------------------------------------------
    */

    if (vehicle) {
      await Vehicle.findByIdAndUpdate(
        vehicle._id,
        {
          $set: {
            status: "assigned",
            assignedTour: tour._id,
          },
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | RETURN FULL UPDATED TOUR
    |--------------------------------------------------------------------------
    */

    const updatedTour = await Tour.findById(
      tour._id
    )
      .populate(
        "assignedGuide",
        "name phone email position availability assignedTours"
      )
      .populate(
        "assignedDriver",
        "name phone email position availability assignedTours"
      )
      .populate(
        "assignedVehicle",
        "name registrationNumber registration model type capacity status assignedTour"
      );

    /*
    |--------------------------------------------------------------------------
    | STAFF ASSIGNMENT NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    const assignmentMessage = (person, role) =>
      [
        `${companyName} assignment.`,
        `You have been assigned as ${role} for "${tour.title}".`,
        `Tour date: ${new Date(tour.date || tour.startDate).toLocaleDateString("en-KE")}.`,
        tour.location ? `Location: ${tour.location}.` : "",
        tour.meetingPoint ? `Meeting point: ${tour.meetingPoint}.` : "",
        `Tour ID: ${tour._id}.`,
      ].filter(Boolean).join(" ");

    /*
    |--------------------------------------------------------------------------
    | STAFF ASSIGNMENT NOTIFICATIONS
    |--------------------------------------------------------------------------
    |
    | Staff records created before the User <-> Staff link was introduced may
    | not have `staff.user`. Resolve the account by email as a compatibility
    | fallback so an assignment always produces an in-app notification.
    |
    |--------------------------------------------------------------------------
    */

    const notificationJobs = [];

    const resolveStaffUser = async (person) => {
      if (!person) return null;
      if (person.user) {
        const linked = await User.findById(person.user).select("_id email").lean();
        if (linked) return linked;
      }
      if (person.email) {
        const linked = await User.findOne({
          email: String(person.email).toLowerCase(),
        }).select("_id email").lean();
        if (linked) {
          await Staff.updateOne(
            { _id: person._id },
            { $set: { user: linked._id } }
          );
          return linked;
        }
      }
      return null;
    };

    if (guide && newGuideId !== oldGuideId) {
      const message = assignmentMessage(guide, "guide");
      const guideUser = await resolveStaffUser(guide);
      notificationJobs.push(
        guide.phone ? sendSMS(guide.phone, message) : Promise.resolve(),
        guide.phone ? sendWhatsApp({ to: guide.phone, message }) : Promise.resolve(),
        guideUser
          ? Notification.create({
              recipient: guideUser._id,
              user: guideUser._id,
              title: "New tour assignment",
              message,
              type: "assignment",
              priority: "high",
              relatedModel: "Tour",
              relatedId: tour._id,
              actionUrl: `/guide/dashboard`,
              metadata: {
                tourId: tour._id,
                assignmentRole: "guide",
              },
            })
          : Promise.resolve()
      );
    }

    if (driver && newDriverId !== oldDriverId) {
      const message = assignmentMessage(driver, "driver");
      const driverUser = await resolveStaffUser(driver);
      notificationJobs.push(
        driver.phone ? sendSMS(driver.phone, message) : Promise.resolve(),
        driver.phone ? sendWhatsApp({ to: driver.phone, message }) : Promise.resolve(),
        driverUser
          ? Notification.create({
              recipient: driverUser._id,
              user: driverUser._id,
              title: "New tour assignment",
              message,
              type: "assignment",
              priority: "high",
              relatedModel: "Tour",
              relatedId: tour._id,
              actionUrl: `/driver/dashboard`,
              metadata: {
                tourId: tour._id,
                assignmentRole: "driver",
              },
            })
          : Promise.resolve()
      );
    }

    await Promise.allSettled(notificationJobs);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      message: hasAssignment
        ? "Tour resources assigned successfully"
        : "Tour resources cleared successfully",
      data: updatedTour,
    });
  } catch (error) {
    console.error(
      "ASSIGN TOUR RESOURCES ERROR:",
      error
    );

    next(error);
  }
};

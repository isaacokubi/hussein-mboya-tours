import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { getSystemSettings } from "../services/settingsService.js";
import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Notification from "../models/Notification.js";
import { sendSMS } from "../services/smsService.js";
import { sendWhatsApp } from "../services/whatsappService.js";

const tenantResource = (req, filter = {}) => mergeTenantFilter(req, filter);

export const assignTourResources = async (req, res, next) => {
  requireTenantId();
  const settings = await getSystemSettings();
  const companyName = settings.companyName || "Company";
  try {
    const { guideId, driverId, vehicleId } = req.body;
    const tourId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(tourId)) return res.status(400).json({ success: false, message: "Invalid tour ID" });

    // Every resource lookup and mutation is tenant-scoped. This prevents a
    // resource from another company being assigned through a guessed ObjectId.
    const tour = await Tour.findOne(tenantResource(req, { _id: tourId }));
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

    const nextGuideId = guideId === undefined ? tour.assignedGuide : guideId || null;
    const nextDriverId = driverId === undefined ? tour.assignedDriver : driverId || null;
    const nextVehicleId = vehicleId === undefined ? tour.assignedVehicle : vehicleId || null;

    for (const [value, label] of [[nextGuideId, "guide"], [nextDriverId, "driver"], [nextVehicleId, "vehicle"]]) {
      if (value && !mongoose.Types.ObjectId.isValid(value)) return res.status(400).json({ success: false, message: `Invalid ${label} ID` });
    }

    const [guide, driver, vehicle] = await Promise.all([
      nextGuideId ? Staff.findOne(tenantResource(req, { _id: nextGuideId, position: "guide", isActive: true, isDeleted: false })) : null,
      nextDriverId ? Staff.findOne(tenantResource(req, { _id: nextDriverId, position: "driver", isActive: true, isDeleted: false })) : null,
      nextVehicleId ? Vehicle.findOne(tenantResource(req, { _id: nextVehicleId, isActive: true })) : null,
    ]);

    if (nextGuideId && !guide) return res.status(400).json({ success: false, message: "Guide not found or inactive" });
    if (guide && guide.availability !== "available" && guide._id.toString() !== tour.assignedGuide?.toString()) return res.status(400).json({ success: false, message: "Selected guide is unavailable" });
    if (nextDriverId && !driver) return res.status(400).json({ success: false, message: "Driver not found or inactive" });
    if (driver && driver.availability !== "available" && driver._id.toString() !== tour.assignedDriver?.toString()) return res.status(400).json({ success: false, message: "Selected driver is unavailable" });
    if (nextVehicleId && !vehicle) return res.status(400).json({ success: false, message: "Vehicle not found or inactive" });
    if (vehicle && vehicle.status !== "available" && vehicle._id.toString() !== tour.assignedVehicle?.toString()) return res.status(400).json({ success: false, message: "Selected vehicle is unavailable" });

    const oldGuideId = tour.assignedGuide?.toString() || null;
    const oldDriverId = tour.assignedDriver?.toString() || null;
    const oldVehicleId = tour.assignedVehicle?.toString() || null;
    const newGuideId = nextGuideId?.toString() || null;
    const newDriverId = nextDriverId?.toString() || null;
    const newVehicleId = nextVehicleId?.toString() || null;

    if (oldGuideId && oldGuideId !== newGuideId) {
      const oldGuide = await Staff.findOne(tenantResource(req, { _id: oldGuideId }));
      if (oldGuide) {
        oldGuide.assignedTours = oldGuide.assignedTours.filter((id) => id.toString() !== tour._id.toString());
        if (oldGuide.assignedTours.length === 0) oldGuide.availability = "available";
        await oldGuide.save();
      }
    }
    if (oldDriverId && oldDriverId !== newDriverId) {
      const oldDriver = await Staff.findOne(tenantResource(req, { _id: oldDriverId }));
      if (oldDriver) {
        oldDriver.assignedTours = oldDriver.assignedTours.filter((id) => id.toString() !== tour._id.toString());
        if (oldDriver.assignedTours.length === 0) oldDriver.availability = "available";
        await oldDriver.save();
      }
    }
    if (oldVehicleId && oldVehicleId !== newVehicleId) {
      await Vehicle.updateOne(tenantResource(req, { _id: oldVehicleId, assignedTour: tour._id }), { $set: { status: "available", assignedTour: null } });
    }

    tour.assignedGuide = nextGuideId || null;
    tour.assignedDriver = nextDriverId || null;
    tour.assignedVehicle = nextVehicleId || null;
    tour.assignmentStatus = nextGuideId || nextDriverId || nextVehicleId ? "assigned" : "pending";
    await tour.save();

    if (guide) await Staff.updateOne(tenantResource(req, { _id: guide._id }), { $set: { availability: "busy" }, $addToSet: { assignedTours: tour._id, ...(guide.user ? {} : {}) } });
    if (driver) await Staff.updateOne(tenantResource(req, { _id: driver._id }), { $set: { availability: "busy" }, $addToSet: { assignedTours: tour._id } });
    if (vehicle) await Vehicle.updateOne(tenantResource(req, { _id: vehicle._id }), { $set: { status: "assigned", assignedTour: tour._id } });

    const updatedTour = await Tour.findOne(tenantResource(req, { _id: tour._id }))
      .populate("assignedGuide", "name phone email position availability assignedTours user")
      .populate("assignedDriver", "name phone email position availability assignedTours user")
      .populate("assignedVehicle", "name registrationNumber registration model type capacity status assignedTour");

    const assignmentMessage = (person, role) => [
      `${companyName} assignment.`,
      `You have been assigned as ${role} for "${tour.title}".`,
      `Tour date: ${new Date(tour.date || tour.startDate).toLocaleDateString("en-KE")}.`,
      tour.location ? `Location: ${tour.location}.` : "",
      tour.meetingPoint ? `Meeting point: ${tour.meetingPoint}.` : "",
      `Tour ID: ${tour._id}.`,
    ].filter(Boolean).join(" ");

    const notificationJobs = [];
    const resolveStaffUser = async (person) => {
      if (!person) return null;
      if (person.user) {
        const linked = await User.findOne(tenantResource(req, { _id: person.user })).select("_id email").lean();
        if (linked) return linked;
      }
      if (person.email) {
        const linked = await User.findOne({ email: String(person.email).toLowerCase() }).select("_id email").lean();
        if (linked) {
          await Staff.updateOne(tenantResource(req, { _id: person._id }), { $set: { user: linked._id } });
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
        guideUser ? Notification.create({ recipient: guideUser._id, user: guideUser._id, title: "New tour assignment", message, type: "assignment", priority: "high", relatedModel: "Tour", relatedId: tour._id, actionUrl: "/guide/dashboard", metadata: { tourId: tour._id, assignmentRole: "guide" } }) : Promise.resolve(),
      );
    }
    if (driver && newDriverId !== oldDriverId) {
      const message = assignmentMessage(driver, "driver");
      const driverUser = await resolveStaffUser(driver);
      notificationJobs.push(
        driver.phone ? sendSMS(driver.phone, message) : Promise.resolve(),
        driver.phone ? sendWhatsApp({ to: driver.phone, message }) : Promise.resolve(),
        driverUser ? Notification.create({ recipient: driverUser._id, user: driverUser._id, title: "New tour assignment", message, type: "assignment", priority: "high", relatedModel: "Tour", relatedId: tour._id, actionUrl: "/driver/dashboard", metadata: { tourId: tour._id, assignmentRole: "driver" } }) : Promise.resolve(),
      );
    }
    await Promise.allSettled(notificationJobs);

    return res.status(200).json({ success: true, message: tour.assignmentStatus === "assigned" ? "Tour resources assigned successfully" : "Tour resources cleared successfully", data: updatedTour });
  } catch (error) {
    console.error("ASSIGN TOUR RESOURCES ERROR:", error);
    next(error);
  }
};

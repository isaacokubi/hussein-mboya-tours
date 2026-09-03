import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { releaseTourResources } from "../services/tourResourceLifecycleService.js";

const bookingGuests = (booking) => Number(booking.numberOfGuests || booking.guests || booking.numberOfPeople || 1);

export const completeTour = async (req, res, next) => {
  requireTenantId();
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid tour ID."), { status: 400 });
      const tour = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } })).session(session);
      if (!tour) throw Object.assign(new Error("Tour not found."), { status: 404 });
      if (tour.status === "completed") {
        result = { success: true, message: "Tour is already completed.", data: tour };
        return;
      }
      tour.status = "completed";
      tour.completedAt = new Date();
      await releaseTourResources(tour, session);
      result = { success: true, message: "Tour completed and assigned resources released.", data: tour };
    });
    return res.status(200).json(result);
  } catch (error) { return next(error); }
  finally { await session.endSession(); }
};

export const cancelTour = async (req, res, next) => {
  requireTenantId();
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid tour ID."), { status: 400 });
      const tour = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } })).session(session);
      if (!tour) throw Object.assign(new Error("Tour not found."), { status: 404 });
      if (tour.status === "completed") throw Object.assign(new Error("A completed tour cannot be cancelled."), { status: 409 });
      tour.status = "cancelled";
      tour.cancelledAt = new Date();
      tour.cancellationReason = String(req.body?.reason || "Cancelled by tour manager");
      await releaseTourResources(tour, session);
      result = { success: true, message: "Tour cancelled and assigned resources released.", data: tour };
    });
    return res.status(200).json(result);
  } catch (error) { return next(error); }
  finally { await session.endSession(); }
};

export const completeBookingAndMaybeRelease = async (req, res, next) => {
  requireTenantId();
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid booking ID."), { status: 400 });
      const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);
      if (!booking) throw Object.assign(new Error("Booking not found."), { status: 404 });
      if (["cancelled", "refunded"].includes(booking.status)) throw Object.assign(new Error(`A ${booking.status} booking cannot be completed.`), { status: 400 });
      if (booking.status !== "completed") {
        if (booking.paymentStatus !== "paid") throw Object.assign(new Error("Only paid bookings can be marked as completed."), { status: 400 });
        booking.status = "completed";
        booking.completedAt = new Date();
        await booking.save({ session });
      }

      if (booking.tour) {
        const remaining = await Booking.countDocuments(mergeTenantFilter({
          tour: booking.tour,
          _id: { $ne: booking._id },
          isDeleted: { $ne: true },
          status: { $nin: ["cancelled", "refunded", "completed"] },
        })).session(session);
        if (remaining === 0) {
          const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour, isDeleted: { $ne: true } })).session(session);
          if (tour) {
            tour.status = "completed";
            tour.completedAt = new Date();
            await releaseTourResources(tour, session);
          }
        }
      }

      const updated = await Booking.findOne(mergeTenantFilter({ _id: booking._id }))
        .populate("user", "name email phone")
        .populate("customer", "name email phone")
        .populate("tour", "title")
        .populate("assignedGuide", "name email phone")
        .populate("assignedDriver", "name email phone")
        .populate("assignedVehicle", "name registrationNumber")
        .session(session)
        .lean();
      result = { success: true, message: "Booking marked as completed.", data: updated, booking: updated };
    });
    return res.status(200).json(result);
  } catch (error) { return next(error); }
  finally { await session.endSession(); }
};

export const cancelBookingAndUpdateCapacity = async (req, res, next) => {
  requireTenantId();
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid booking ID."), { status: 400 });
      const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);
      if (!booking) throw Object.assign(new Error("Booking not found."), { status: 404 });
      if (["cancelled", "refunded", "completed"].includes(booking.status)) throw Object.assign(new Error(`A ${booking.status} booking cannot be cancelled.`), { status: 400 });

      booking.status = "cancelled";
      booking.cancelledAt = new Date();
      booking.cancelledBy = req.user._id;
      booking.cancellationReason = String(req.body?.reason || "Cancelled by tour manager");
      await booking.save({ session });

      if (booking.tour) {
        const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour, isDeleted: { $ne: true } })).session(session);
        if (tour) {
          tour.availabilitySettings ||= {};
          const current = Number(tour.availabilitySettings.bookedSlots || 0);
          tour.availabilitySettings.bookedSlots = Math.max(0, current - bookingGuests(booking));
          await tour.save({ session });
        }
      }
      result = { success: true, message: "Booking cancelled and tour capacity updated.", data: booking, booking };
    });
    return res.status(200).json(result);
  } catch (error) { return next(error); }
  finally { await session.endSession(); }
};

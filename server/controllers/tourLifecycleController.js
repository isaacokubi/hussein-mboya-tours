/**
 * Purpose: tour Lifecycle Controller HTTP controller. Main declarations: bookingGuests, completeTour, cancelTour, completeBookingAndMaybeRelease, cancelBookingAndUpdateCapacity.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../services/tourResourceLifecycleService.js so this module can use its exported dependencies.
import { releaseTourResources } from "../services/tourResourceLifecycleService.js";
// Load ../services/tourCancellationService.js so this module can use its exported dependencies.
import { cancelTourAndBookings } from "../services/tourCancellationService.js";

// Declare bookingGuests for use by the surrounding module or function.
const bookingGuests = (booking) => Number(booking.numberOfGuests || booking.guests || booking.numberOfPeople || 1);

// Declare completeTour for use by the surrounding module or function.
export const completeTour = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    let result;
    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid tour ID."), { status: 400 });
      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } })).session(session);
      // Check the condition (!tour) and run the matching branch.
      if (!tour) throw Object.assign(new Error("Tour not found."), { status: 404 });
      // Check the condition (tour.status === "completed") and run the matching branch.
      if (tour.status === "completed") {
        // Perform the side effect or state update expressed on the following line.
        result = { success: true, message: "Tour is already completed.", data: tour };
        // Return the result to the caller.
        return;
      }
      // Perform the side effect or state update expressed on the following line.
      tour.status = "completed";
      // Perform the side effect or state update expressed on the following line.
      tour.completedAt = new Date();
      // Perform the side effect or state update expressed on the following line.
      await releaseTourResources(tour, session);
      // Perform the side effect or state update expressed on the following line.
      result = { success: true, message: "Tour completed and assigned resources released.", data: tour };
    });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json(result);
  } catch (error) { return next(error); }
  finally { await session.endSession(); }
};

// Declare cancelTour for use by the surrounding module or function.
export const cancelTour = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    const result = await cancelTourAndBookings({
      tourId: req.params.id,
      reason: req.body?.reason || "Cancelled by tour manager",
      deleted: false,
      userId: req.user?._id || null,
    });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Tour cancelled, bookings reconciled and resources released.", data: result.tour, bookingsAffected: result.bookingsAffected });
  } catch (error) { return next(error); }
};

// Declare completeBookingAndMaybeRelease for use by the surrounding module or function.
export const completeBookingAndMaybeRelease = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    let result;
    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid booking ID."), { status: 400 });
      // Declare booking for use by the surrounding module or function.
      const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);
      // Check the condition (!booking) and run the matching branch.
      if (!booking) throw Object.assign(new Error("Booking not found."), { status: 404 });
      // Check the condition (["cancelled", "refunded"].includes(booking.status)) and run the matching branch.
      if (["cancelled", "refunded"].includes(booking.status)) throw Object.assign(new Error(`A ${booking.status} booking cannot be completed.`), { status: 400 });
      // Check the condition (booking.status !== "completed") and run the matching branch.
      if (booking.status !== "completed") {
        // Check the condition (booking.paymentStatus !== "paid") and run the matching branch.
        if (booking.paymentStatus !== "paid") throw Object.assign(new Error("Only paid bookings can be marked as completed."), { status: 400 });
        // Perform the side effect or state update expressed on the following line.
        booking.status = "completed";
        // Perform the side effect or state update expressed on the following line.
        booking.completedAt = new Date();
        // Perform the side effect or state update expressed on the following line.
        await booking.save({ session });
      }

      // Check the condition (booking.tour) and run the matching branch.
      if (booking.tour) {
        // Declare remaining for use by the surrounding module or function.
        const remaining = await Booking.countDocuments(mergeTenantFilter({
          tour: booking.tour,
          _id: { $ne: booking._id },
          isDeleted: { $ne: true },
          status: { $nin: ["cancelled", "refunded", "completed"] },
        })).session(session);
        // Check the condition (remaining === 0) and run the matching branch.
        if (remaining === 0) {
          // Declare tour for use by the surrounding module or function.
          const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour, isDeleted: { $ne: true } })).session(session);
          // Check the condition (tour) and run the matching branch.
          if (tour) {
            // Perform the side effect or state update expressed on the following line.
            tour.status = "completed";
            // Perform the side effect or state update expressed on the following line.
            tour.completedAt = new Date();
            // Perform the side effect or state update expressed on the following line.
            await releaseTourResources(tour, session);
          }
        }
      }

      // Declare updated for use by the surrounding module or function.
      const updated = await Booking.findOne(mergeTenantFilter({ _id: booking._id }))
        .populate("user", "name email phone")
        .populate("customer", "name email phone")
        .populate("tour", "title")
        .populate("assignedGuide", "name email phone")
        .populate("assignedDriver", "name email phone")
        .populate("assignedVehicle", "name registrationNumber")
        .session(session)
        .lean();
      // Perform the side effect or state update expressed on the following line.
      result = { success: true, message: "Booking marked as completed.", data: updated, booking: updated };
    });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json(result);
  } catch (error) { return next(error); }
  finally { await session.endSession(); }
};

// Declare cancelBookingAndUpdateCapacity for use by the surrounding module or function.
export const cancelBookingAndUpdateCapacity = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    let result;
    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid booking ID."), { status: 400 });
      // Declare booking for use by the surrounding module or function.
      const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);
      // Check the condition (!booking) and run the matching branch.
      if (!booking) throw Object.assign(new Error("Booking not found."), { status: 404 });
      // Check the condition (["cancelled", "refunded", "completed"].includes(booking.status)) and run the matching branch.
      if (["cancelled", "refunded", "completed"].includes(booking.status)) throw Object.assign(new Error(`A ${booking.status} booking cannot be cancelled.`), { status: 400 });

      // Perform the side effect or state update expressed on the following line.
      booking.status = "cancelled";
      // Perform the side effect or state update expressed on the following line.
      booking.cancelledAt = new Date();
      // Perform the side effect or state update expressed on the following line.
      booking.cancelledBy = req.user._id;
      // Perform the side effect or state update expressed on the following line.
      booking.cancellationReason = String(req.body?.reason || "Cancelled by tour manager");
      // Perform the side effect or state update expressed on the following line.
      await booking.save({ session });

      // Check the condition (booking.tour) and run the matching branch.
      if (booking.tour) {
        // Declare tour for use by the surrounding module or function.
        const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour, isDeleted: { $ne: true } })).session(session);
        // Check the condition (tour) and run the matching branch.
        if (tour) {
          // Perform the side effect or state update expressed on the following line.
          tour.availabilitySettings ||= {};
          // Declare current for use by the surrounding module or function.
          const current = Number(tour.availabilitySettings.bookedSlots || 0);
          // Perform the side effect or state update expressed on the following line.
          tour.availabilitySettings.bookedSlots = Math.max(0, current - bookingGuests(booking));
          // Perform the side effect or state update expressed on the following line.
          await tour.save({ session });
        }
      }
      // Perform the side effect or state update expressed on the following line.
      result = { success: true, message: "Booking cancelled and tour capacity updated.", data: booking, booking };
    });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json(result);
  } catch (error) { return next(error); }
  finally { await session.endSession(); }
};

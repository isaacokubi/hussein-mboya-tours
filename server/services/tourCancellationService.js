/**
 * Purpose: tour Cancellation Service business-logic service. Main declarations: dayIndex, releaseBookingCapacity, cancelTourAndBookings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ./tourResourceLifecycleService.js so this module can use its exported dependencies.
import { releaseTourResources } from "./tourResourceLifecycleService.js";

// Declare dayIndex for use by the surrounding module or function.
const dayIndex = (tour, date) => {
  // Declare target for use by the surrounding module or function.
  const target = new Date(date); target.setHours(0,0,0,0);
  // Return the result of (tour.availability || []).findIndex() to the caller.
  return (tour.availability || []).findIndex((item) => {
    // Declare d for use by the surrounding module or function.
    const d = new Date(item.date); d.setHours(0,0,0,0);
    // Return the expression shown below to the caller.
    return d.getTime() === target.getTime();
  });
};

// Declare releaseBookingCapacity for use by the surrounding module or function.
const releaseBookingCapacity = async (tour, booking, session) => {
  // Declare guests for use by the surrounding module or function.
  const guests = Math.max(1, Number(booking.numberOfGuests || 1));
  // Declare index for use by the surrounding module or function.
  const index = dayIndex(tour, booking.travelDate);
  // Check the condition (index >= 0) and run the matching branch.
  if (index >= 0) {
    // Perform the side effect or state update expressed on the following line.
    tour.availability[index].bookedSlots = Math.max(0, Number(tour.availability[index].bookedSlots || 0) - guests);
  } else {
    // Perform the side effect or state update expressed on the following line.
    tour.availabilitySettings ||= {};
    // Perform the side effect or state update expressed on the following line.
    tour.availabilitySettings.bookedSlots = Math.max(0, Number(tour.availabilitySettings.bookedSlots || 0) - guests);
  }
};

// Declare cancelTourAndBookings for use by the surrounding module or function.
export const cancelTourAndBookings = async ({ tourId, reason = "Tour cancelled", deleted = false, userId = null }) => {
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
      // Check the condition (!mongoose.Types.ObjectId.isValid(tourId)) and run the matching branch.
      if (!mongoose.Types.ObjectId.isValid(tourId)) throw Object.assign(new Error("Invalid tour ID."), { status: 400 });
      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findOne(mergeTenantFilter({ _id: tourId, isDeleted: { $ne: true } })).session(session);
      // Check the condition (!tour) and run the matching branch.
      if (!tour) throw Object.assign(new Error("Tour not found."), { status: 404 });
      // Check the condition (tour.status === "completed") and run the matching branch.
      if (tour.status === "completed") throw Object.assign(new Error("A completed tour cannot be cancelled."), { status: 409 });

      // Declare bookings for use by the surrounding module or function.
      const bookings = await Booking.find(mergeTenantFilter({
        tour: tour._id,
        isDeleted: { $ne: true },
        status: { $nin: ["cancelled", "refunded", "completed"] },
      })).session(session);

      // Repeat the enclosed work for each required iteration.
      for (const booking of bookings) {
        // Perform the side effect or state update expressed on the following line.
        await releaseBookingCapacity(tour, booking, session);
        // Perform the side effect or state update expressed on the following line.
        booking.status = "cancelled";
        // Perform the side effect or state update expressed on the following line.
        booking.cancelledAt = booking.cancelledAt || new Date();
        // Perform the side effect or state update expressed on the following line.
        booking.cancelledBy = userId || null;
        // Perform the side effect or state update expressed on the following line.
        booking.cancellationReason = String(reason || "Tour cancelled");
        // Check the condition (Number(booking.amountPaid || 0) > 0) and run the matching branch.
        if (Number(booking.amountPaid || 0) > 0) {
          // Perform the side effect or state update expressed on the following line.
          booking.refundStatus = booking.refundStatus === "completed" ? "completed" : "requested";
          // Perform the side effect or state update expressed on the following line.
          booking.refundReason = String(reason || "Tour cancelled");
          // Perform the side effect or state update expressed on the following line.
          booking.refundAmount = Math.max(0, Number(booking.amountPaid || 0) - Number(booking.refundAmount || 0));
        } else {
          // Perform the side effect or state update expressed on the following line.
          booking.paymentStatus = "cancelled";
        }
        // Perform the side effect or state update expressed on the following line.
        await booking.save({ session });
      }

      // Perform the side effect or state update expressed on the following line.
      tour.status = "cancelled";
      // Perform the side effect or state update expressed on the following line.
      tour.available = false;
      // Perform the side effect or state update expressed on the following line.
      tour.published = false;
      // Perform the side effect or state update expressed on the following line.
      tour.assignmentStatus = "cancelled";
      // Perform the side effect or state update expressed on the following line.
      tour.cancellationReason = String(reason || "Tour cancelled");
      // Perform the side effect or state update expressed on the following line.
      tour.cancelledAt = new Date();
      // Check the condition (deleted) and run the matching branch.
      if (deleted) {
        // Perform the side effect or state update expressed on the following line.
        tour.isDeleted = true;
        // Perform the side effect or state update expressed on the following line.
        tour.deletedAt = new Date();
        // Perform the side effect or state update expressed on the following line.
        tour.deletedBy = userId || null;
      }
      // Perform the side effect or state update expressed on the following line.
      await releaseTourResources(tour, session);
      // Perform the side effect or state update expressed on the following line.
      await tour.save({ session });

      // Check the condition (bookings.length) and run the matching branch.
      if (bookings.length) {
        // Declare recipients for use by the surrounding module or function.
        const recipients = [...new Set(bookings.map((b) => b.user).filter(Boolean).map(String))];
        // Check the condition (recipients.length) and run the matching branch.
        if (recipients.length) {
          // Perform the side effect or state update expressed on the following line.
          await Notification.insertMany(recipients.map((recipient) => ({
            recipient,
            user: recipient,
            title: deleted ? "Tour Cancelled" : "Tour Cancelled",
            message: `Tour "${tour.title}" has been cancelled. Booking ${bookings.find((b) => String(b.user) === String(recipient))?.bookingNumber || ""} requires attention regarding refund processing where applicable.`,
            type: "booking",
            relatedModel: "Booking",
            actionUrl: "/bookings",
          })), { session });
        }
      }

      // Perform the side effect or state update expressed on the following line.
      result = { tour, bookingsAffected: bookings.length };
    });
    // Return the value of result to the caller.
    return result;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await session.endSession();
  }
};

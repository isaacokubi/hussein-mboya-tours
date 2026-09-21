import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { releaseTourResources } from "./tourResourceLifecycleService.js";

const dayIndex = (tour, date) => {
  const target = new Date(date); target.setHours(0,0,0,0);
  return (tour.availability || []).findIndex((item) => {
    const d = new Date(item.date); d.setHours(0,0,0,0);
    return d.getTime() === target.getTime();
  });
};

const releaseBookingCapacity = async (tour, booking, session) => {
  const guests = Math.max(1, Number(booking.numberOfGuests || 1));
  const index = dayIndex(tour, booking.travelDate);
  if (index >= 0) {
    tour.availability[index].bookedSlots = Math.max(0, Number(tour.availability[index].bookedSlots || 0) - guests);
  } else {
    tour.availabilitySettings ||= {};
    tour.availabilitySettings.bookedSlots = Math.max(0, Number(tour.availabilitySettings.bookedSlots || 0) - guests);
  }
};

export const cancelTourAndBookings = async ({ tourId, reason = "Tour cancelled", deleted = false, userId = null }) => {
  requireTenantId();
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      if (!mongoose.Types.ObjectId.isValid(tourId)) throw Object.assign(new Error("Invalid tour ID."), { status: 400 });
      const tour = await Tour.findOne(mergeTenantFilter({ _id: tourId, isDeleted: { $ne: true } })).session(session);
      if (!tour) throw Object.assign(new Error("Tour not found."), { status: 404 });
      if (tour.status === "completed") throw Object.assign(new Error("A completed tour cannot be cancelled."), { status: 409 });

      const bookings = await Booking.find(mergeTenantFilter({
        tour: tour._id,
        isDeleted: { $ne: true },
        status: { $nin: ["cancelled", "refunded", "completed"] },
      })).session(session);

      for (const booking of bookings) {
        await releaseBookingCapacity(tour, booking, session);
        booking.status = "cancelled";
        booking.cancelledAt = booking.cancelledAt || new Date();
        booking.cancelledBy = userId || null;
        booking.cancellationReason = String(reason || "Tour cancelled");
        if (Number(booking.amountPaid || 0) > 0) {
          booking.refundStatus = booking.refundStatus === "completed" ? "completed" : "requested";
          booking.refundReason = String(reason || "Tour cancelled");
          booking.refundAmount = Math.max(0, Number(booking.amountPaid || 0) - Number(booking.refundAmount || 0));
        } else {
          booking.paymentStatus = "cancelled";
        }
        await booking.save({ session });
      }

      tour.status = "cancelled";
      tour.available = false;
      tour.published = false;
      tour.assignmentStatus = "cancelled";
      tour.cancellationReason = String(reason || "Tour cancelled");
      tour.cancelledAt = new Date();
      if (deleted) {
        tour.isDeleted = true;
        tour.deletedAt = new Date();
        tour.deletedBy = userId || null;
      }
      await releaseTourResources(tour, session);
      await tour.save({ session });

      if (bookings.length) {
        const recipients = [...new Set(bookings.map((b) => b.user).filter(Boolean).map(String))];
        if (recipients.length) {
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

      result = { tour, bookingsAffected: bookings.length };
    });
    return result;
  } finally {
    await session.endSession();
  }
};

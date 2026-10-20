/**
 * Booking creation coordination. This service centralizes the database work
 * needed to create a booking safely and consistently, including tenant-owned
 * records and concurrency-sensitive operations. Keep writes recoverable and
 * avoid trusting client-calculated prices or capacity.
 */

import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { reserveSlots } from "./inventoryService.js";
import { requireTenantId } from "../tenancy/context.js";

export const createBookingAtomically = async ({ tourId, travelers, travelDate, bookingData }) => {
  requireTenantId();
  const session = await mongoose.startSession();
  try {
    let booking;
    await session.withTransaction(async () => {
      if (tourId) await reserveSlots(tourId, travelers, travelDate, session);
      const created = await Booking.create([bookingData], { session });
      booking = created[0];
    });
    return booking;
  } finally {
    await session.endSession();
  }
};

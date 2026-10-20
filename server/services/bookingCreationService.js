/**
 * Booking creation coordination. This service centralizes the database work
 * needed to create a booking safely and consistently, including tenant-owned
 * records and concurrency-sensitive operations. Keep writes recoverable and
 * avoid trusting client-calculated prices or capacity.
 */

// Import Mongoose to create a database transaction session.
import mongoose from "mongoose";
// Import the booking model used to persist the new booking.
import Booking from "../models/Booking.js";
// Import the inventory service that reserves capacity safely.
import { reserveSlots } from "./inventoryService.js";
// Require the active tenant before creating tenant-owned records.
import { requireTenantId } from "../tenancy/context.js";

// Create a booking and reserve tour capacity within one database transaction.
export const createBookingAtomically = async ({ tourId, travelers, travelDate, bookingData }) => {
  // Refuse to create a booking without an active tenant context.
  requireTenantId();
  // Open a MongoDB session so related writes can commit or roll back together.
  const session = await mongoose.startSession();
  try {
    // Keep a reference to the booking created inside the transaction callback.
    let booking;
    // Run all capacity and booking writes as one transaction.
    await session.withTransaction(async () => {
      // Reserve slots first when this booking is associated with a specific tour.
      if (tourId) await reserveSlots(tourId, travelers, travelDate, session);
      // Insert the booking using the same transaction session.
      const created = await Booking.create([bookingData], { session });
      // Save the first created document for return after the transaction commits.
      booking = created[0];
    });
    // Return the persisted booking after the transaction completes successfully.
    return booking;
  } finally {
    // Always close the session, whether the transaction succeeds or throws.
    await session.endSession();
  }
};

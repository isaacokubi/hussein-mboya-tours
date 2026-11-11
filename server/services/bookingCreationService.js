/**
 * Purpose: booking Creation Service business-logic service. Main declarations: createBookingAtomically.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ./inventoryService.js so this module can use its exported dependencies.
import { reserveSlots } from "./inventoryService.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";

// Declare createBookingAtomically for use by the surrounding module or function.
export const createBookingAtomically = async ({ tourId, travelers, travelDate, bookingData }) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare booking for use by the surrounding module or function.
    let booking;
    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Check the condition (tourId) and run the matching branch.
      if (tourId) await reserveSlots(tourId, travelers, travelDate, session);
      // Declare created for use by the surrounding module or function.
      const created = await Booking.create([bookingData], { session });
      // Perform the side effect or state update expressed on the following line.
      booking = created[0];
    });
    // Return the value of booking to the caller.
    return booking;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await session.endSession();
  }
};

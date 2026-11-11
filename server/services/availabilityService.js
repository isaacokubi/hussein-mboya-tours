/**
 * Purpose: availability Service business-logic service. Main declarations: checkAvailability, reserveSlots, releaseSlots.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

/*
|--------------------------------------------------------------------------
| CHECK TOUR AVAILABILITY
|--------------------------------------------------------------------------
|
| Returns:
| {
|   available: Boolean,
|   totalSlots: Number,
|   bookedSlots: Number,
|   remainingSlots: Number,
|   requestedSlots: Number,
|   tour: Object
| }
|
*/

// Declare checkAvailability for use by the surrounding module or function.
export const checkAvailability = async (
  tourId,
  numberOfTravelers = 1
) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Validate travelers
  // Check the condition (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) and run the matching branch.
  if (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Invalid number of travelers.");
  }

  // Find tour
  // Declare tour for use by the surrounding module or function.
  const tour = await Tour.findOne(
    mergeTenantFilter({
      _id: tourId,
    })
  );

  // Check the condition (!tour) and run the matching branch.
  if (!tour) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Tour not found.");
  }

  // Ensure availability settings exist
  // Declare availability for use by the surrounding module or function.
  const availability = tour.availabilitySettings || {};

  // Declare totalSlots for use by the surrounding module or function.
  const totalSlots = availability.totalSlots ?? 0;
  // Declare bookedSlots for use by the surrounding module or function.
  const bookedSlots = availability.bookedSlots ?? 0;

  // Prevent negative values
  // Declare remainingSlots for use by the surrounding module or function.
  const remainingSlots = Math.max(totalSlots - bookedSlots, 0);

  // Return the object assembled below to the caller.
  return {
    available: remainingSlots >= numberOfTravelers,

    totalSlots,

    bookedSlots,

    remainingSlots,

    requestedSlots: numberOfTravelers,

    tour,
  };
};

/*
|--------------------------------------------------------------------------
| RESERVE TOUR SLOTS (Atomic)
|--------------------------------------------------------------------------
|
| Prevents overbooking by updating bookedSlots only if
| enough slots are available.
|
*/

// Declare reserveSlots for use by the surrounding module or function.
export const reserveSlots = async (
  tourId,
  numberOfTravelers = 1
) => {
  // Check the condition (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) and run the matching branch.
  if (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Invalid number of travelers.");
  }

  // Declare tour for use by the surrounding module or function.
  const tour = await Tour.findOneAndUpdate(
    mergeTenantFilter({
      _id: tourId,

      $expr: {
        $gte: [
          {
            $subtract: [
              "$availabilitySettings.totalSlots",
              "$availabilitySettings.bookedSlots",
            ],
          },
          numberOfTravelers,
        ],
      },
    }),
    {
      $inc: {
        "availabilitySettings.bookedSlots": numberOfTravelers,
      },
    },
    {
      new: true,
    }
  );

  // Check the condition (!tour) and run the matching branch.
  if (!tour) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(
      "Not enough available slots for this tour."
    );
  }

  // Return the value of tour to the caller.
  return tour;
};

/*
|--------------------------------------------------------------------------
| RELEASE TOUR SLOTS
|--------------------------------------------------------------------------
|
| Used when:
| - Booking cancelled
| - Payment fails
| - Booking refunded
|
*/

// Declare releaseSlots for use by the surrounding module or function.
export const releaseSlots = async (
  tourId,
  numberOfTravelers = 1
) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

  // Check the condition (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) and run the matching branch.
  if (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Invalid number of travelers.");
  }

  // Declare tour for use by the surrounding module or function.
  const tour = await Tour.findOne(
    mergeTenantFilter({
      _id: tourId,
    })
  );

  // Check the condition (!tour) and run the matching branch.
  if (!tour) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Tour not found.");
  }

  // Perform the side effect or state update expressed on the following line.
  tour.availabilitySettings.bookedSlots = Math.max(
    0,
    tour.availabilitySettings.bookedSlots - numberOfTravelers
  );

  // Perform the side effect or state update expressed on the following line.
  await tour.save();

  // Return the value of tour to the caller.
  return tour;
};

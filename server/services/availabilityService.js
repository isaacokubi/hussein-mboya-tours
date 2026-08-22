import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
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

export const checkAvailability = async (
  tourId,
  numberOfTravelers = 1
) => {
  requireTenantId();
  // Validate travelers
  if (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) {
    throw new Error("Invalid number of travelers.");
  }

  // Find tour
  const tour = await Tour.findById(tourId);

  if (!tour) {
    throw new Error("Tour not found.");
  }

  // Ensure availability settings exist
  const availability = tour.availabilitySettings || {};

  const totalSlots = availability.totalSlots ?? 0;
  const bookedSlots = availability.bookedSlots ?? 0;

  // Prevent negative values
  const remainingSlots = Math.max(totalSlots - bookedSlots, 0);

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

export const reserveSlots = async (
  tourId,
  numberOfTravelers = 1
) => {
  if (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) {
    throw new Error("Invalid number of travelers.");
  }

  const tour = await Tour.findOneAndUpdate(
    {
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
    },
    {
      $inc: {
        "availabilitySettings.bookedSlots": numberOfTravelers,
      },
    },
    {
      new: true,
    }
  );

  if (!tour) {
    throw new Error(
      "Not enough available slots for this tour."
    );
  }

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

export const releaseSlots = async (
  tourId,
  numberOfTravelers = 1
) => {
  if (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) {
    throw new Error("Invalid number of travelers.");
  }

  const tour = await Tour.findById(tourId);

  if (!tour) {
    throw new Error("Tour not found.");
  }

  tour.availabilitySettings.bookedSlots = Math.max(
    0,
    tour.availabilitySettings.bookedSlots - numberOfTravelers
  );

  await tour.save();

  return tour;
};
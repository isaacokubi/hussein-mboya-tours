import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Tour from "../models/Tour.js";

/*
 * Capacity is maintained on Tour.availabilitySettings and updated atomically
 * so two simultaneous bookings cannot oversell the same tour.
 */

export const validateTourCapacity = async (tourId, requestedGuests) => {
  requireTenantId();
  if (!Number.isInteger(requestedGuests) || requestedGuests <= 0) {
    throw new Error("Invalid traveler count.");
  }

  const tour = await Tour.findById(tourId).lean();
  if (!tour) throw new Error("Tour not found.");

  const totalSlots = Number(
    tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0
  );
  const bookedSlots = Number(
    tour.availabilitySettings?.bookedSlots ?? 0
  );

  return requestedGuests <= Math.max(totalSlots - bookedSlots, 0);
};

export const reserveSlots = async (tourId, travelers) => {
  if (!Number.isInteger(travelers) || travelers <= 0) {
    throw new Error("Invalid traveler count.");
  }

  const tour = await Tour.findOneAndUpdate(
    {
      _id: tourId,
      $expr: {
        $lte: [
          {
            $add: [
              { $ifNull: ["$availabilitySettings.bookedSlots", 0] },
              travelers,
            ],
          },
          { $ifNull: ["$availabilitySettings.totalSlots", "$capacity"] },
        ],
      },
    },
    {
      $inc: {
        "availabilitySettings.bookedSlots": travelers,
      },
    },
    { new: true }
  );

  if (!tour) {
    const exists = await Tour.exists({ _id: tourId });
    if (!exists) throw new Error("Tour not found.");
    throw new Error("Not enough available tour slots.");
  }

  return tour;
};

export const releaseSlots = async (tourId, travelers) => {
  if (!Number.isInteger(travelers) || travelers <= 0) {
    throw new Error("Invalid traveler count.");
  }

  const tour = await Tour.findByIdAndUpdate(
    tourId,
    {
      $inc: {
        "availabilitySettings.bookedSlots": -travelers,
      },
    },
    { new: true }
  );

  if (!tour) throw new Error("Tour not found.");

  if (tour.availabilitySettings.bookedSlots < 0) {
    tour.availabilitySettings.bookedSlots = 0;
    await tour.save();
  }

  return tour;
};

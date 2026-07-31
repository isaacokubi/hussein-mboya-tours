import Tour from "../models/Tour.js";

/*
|--------------------------------------------------------------------------
| VALIDATE TOUR CAPACITY
|--------------------------------------------------------------------------
|
| Checks whether a booking can be accommodated.
|
*/

export const validateTourCapacity = async (
  tourId,
  requestedGuests
) => {
  if (
    !Number.isInteger(requestedGuests) ||
    requestedGuests <= 0
  ) {
    throw new Error("Invalid traveler count.");
  }

  const tour = await Tour.findById(tourId);

  if (!tour) {
    throw new Error("Tour not found.");
  }

  const totalSlots =
    tour.availabilitySettings?.totalSlots || 0;

  const bookedSlots =
    tour.availabilitySettings?.bookedSlots || 0;

  const remainingSlots =
    totalSlots - bookedSlots;

  return requestedGuests <= remainingSlots;
};

/*
|--------------------------------------------------------------------------
| RESERVE TOUR SLOTS
|--------------------------------------------------------------------------
*/

export const reserveSlots = async (
  tourId,
  travelers
) => {
  if (travelers <= 0) {
    throw new Error("Invalid traveler count.");
  }

  const tour = await Tour.findById(tourId);

  if (!tour) {
    throw new Error("Tour not found.");
  }

  const totalSlots =
    tour.availabilitySettings.totalSlots;

  const bookedSlots =
    tour.availabilitySettings.bookedSlots;

  if (bookedSlots + travelers > totalSlots) {
    throw new Error(
      "Not enough available tour slots."
    );
  }

  tour.availabilitySettings.bookedSlots += travelers;

  await tour.save();

  return tour;
};

/*
|--------------------------------------------------------------------------
| RELEASE TOUR SLOTS
|--------------------------------------------------------------------------
*/

export const releaseSlots = async (
  tourId,
  travelers
) => {
  if (travelers <= 0) {
    throw new Error("Invalid traveler count.");
  }

  const tour = await Tour.findById(tourId);

  if (!tour) {
    throw new Error("Tour not found.");
  }

  tour.availabilitySettings.bookedSlots = Math.max(
    0,
    tour.availabilitySettings.bookedSlots - travelers
  );

  await tour.save();

  return tour;
};
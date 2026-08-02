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
    throw new Error(
      "Invalid traveler count."
    );
  }


  const tour =
    await Tour.findById(tourId);



  if (!tour) {
    throw new Error(
      "Tour not found."
    );
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
|
| Increases booked slots after successful booking.
|
| Uses updateOne() instead of save()
| to avoid validating the entire Tour document.
|
*/

export const reserveSlots = async (
  tourId,
  travelers
) => {


  if (
    !Number.isInteger(travelers) ||
    travelers <= 0
  ) {
    throw new Error(
      "Invalid traveler count."
    );
  }



  const tour =
    await Tour.findById(tourId);



  if (!tour) {
    throw new Error(
      "Tour not found."
    );
  }



  const totalSlots =
    tour.availabilitySettings?.totalSlots || 0;



  const bookedSlots =
    tour.availabilitySettings?.bookedSlots || 0;



  if (
    bookedSlots + travelers > totalSlots
  ) {

    throw new Error(
      "Not enough available tour slots."
    );

  }



  await Tour.updateOne(

    {
      _id: tourId
    },

    {

      $inc: {

        "availabilitySettings.bookedSlots":
          travelers

      }

    }

  );



  return await Tour.findById(tourId);

};




/*
|--------------------------------------------------------------------------
| RELEASE TOUR SLOTS
|--------------------------------------------------------------------------
|
| Decreases booked slots when:
| - booking cancelled
| - payment failed
| - booking removed
|
*/

export const releaseSlots = async (
  tourId,
  travelers
) => {


  if (
    !Number.isInteger(travelers) ||
    travelers <= 0
  ) {

    throw new Error(
      "Invalid traveler count."
    );

  }



  const tour =
    await Tour.findById(tourId);



  if (!tour) {

    throw new Error(
      "Tour not found."
    );

  }



  const bookedSlots =
    tour.availabilitySettings?.bookedSlots || 0;



  const newBookedSlots =
    Math.max(
      0,
      bookedSlots - travelers
    );



  await Tour.updateOne(

    {
      _id: tourId
    },

    {

      $set: {

        "availabilitySettings.bookedSlots":
          newBookedSlots

      }

    }

  );



  return await Tour.findById(tourId);

};
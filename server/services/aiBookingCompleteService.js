import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";


const generateBookingNumber = () => {

  return (
    "AI-" +
    Date.now()
  );

};


export const completeAIBooking = async ({
  tourId,
  travelDate,
  travellers,
  name,
  email,
  phone,
  user = null
}) => {


  const tour =
    await Tour.findById(tourId);


  if (!tour) {

    throw new Error(
      "Tour not found"
    );

  }


  const guests =
    Number(travellers) || 1;


  const amount =
    (tour.price || 0) * guests;


  const booking =
    await Booking.create({

      bookingNumber:
        generateBookingNumber(),


      user:
        user?._id || null,


      tour:
        tour._id,


      travelDate,


      numberOfGuests:
        guests,


      travelers: [
        {
          name
        }
      ],


      contact: {

        name,

        email,

        phone

      },


      bookingSource:
        "api",


      status:
        "pending",


      paymentStatus:
        "pending",


      subtotal:
        amount,


      totalAmount:
        amount,


      balanceAmount:
        amount

    });


  return booking;

};

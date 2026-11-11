/**
 * Purpose: ai Booking Complete Service business-logic service. Main declarations: generateBookingNumber, completeAIBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Declare generateBookingNumber for use by the surrounding module or function.
const generateBookingNumber = () => {
  // Return the expression shown below to the caller.
  return "AI-" + Date.now();
};

// Declare completeAIBooking for use by the surrounding module or function.
export const completeAIBooking = async ({
  tourId,
  travelDate,
  travellers,
  name,
  email,
  phone,
  user = null,
}) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();

  // Declare tour for use by the surrounding module or function.
  const tour = await Tour.findOne(
    mergeTenantFilter({
      _id: tourId,
    })
  );

  // Check the condition (!tour) and run the matching branch.
  if (!tour) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Tour not found");
  }

  // Declare guests for use by the surrounding module or function.
  const guests = Number(travellers) || 1;
  // Declare amount for use by the surrounding module or function.
  const amount = (tour.price || 0) * guests;

  // Declare booking for use by the surrounding module or function.
  const booking = await Booking.create({
    tenantId,
    bookingNumber: generateBookingNumber(),
    user: user?._id || null,
    tour: tour._id,
    travelDate,
    numberOfGuests: guests,
    travelers: [{ name }],
    contact: {
      name,
      email,
      phone,
    },
    bookingSource: "api",
    status: "pending",
    paymentStatus: "pending",
    subtotal: amount,
    totalAmount: amount,
    balanceAmount: amount,
  });

  // Return the value of booking to the caller.
  return booking;
};

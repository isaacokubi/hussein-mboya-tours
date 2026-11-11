/**
 * Purpose: agent Booking Api client application module. Main declarations: createAgentBooking, getAgentBookings, getAgentBooking, updateBookingStatus, cancelAgentBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/services/agentBookingService.js

// Load ./axios so this module can use its exported dependencies.
import api from "./axios";

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

// Declare createAgentBooking for use by the surrounding module or function.
export const createAgentBooking = async (bookingData) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(
    "/agents/bookings",
    bookingData
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| GET BOOKINGS
|--------------------------------------------------------------------------
*/

// Declare getAgentBookings for use by the surrounding module or function.
export const getAgentBookings = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/agents/bookings",
    {
      params,
    }
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

// Declare getAgentBooking for use by the surrounding module or function.
export const getAgentBooking = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    `/agents/bookings/${id}`
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/

// Declare updateBookingStatus for use by the surrounding module or function.
export const updateBookingStatus = async (
  id,
  status
) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.patch(
    `/agents/bookings/${id}/status`,
    {
      status,
    }
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

// Declare cancelAgentBooking for use by the surrounding module or function.
export const cancelAgentBooking = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(
    `/agents/bookings/${id}`
  );

  // Return the value of data to the caller.
  return data;
};

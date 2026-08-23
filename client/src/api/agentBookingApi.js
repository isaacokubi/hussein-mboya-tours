// client/src/services/agentBookingService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

export const createAgentBooking = async (bookingData) => {
  const { data } = await api.post(
    "/agents/bookings",
    bookingData
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| GET BOOKINGS
|--------------------------------------------------------------------------
*/

export const getAgentBookings = async (params = {}) => {
  const { data } = await api.get(
    "/agents/bookings",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

export const getAgentBooking = async (id) => {
  const { data } = await api.get(
    `/agents/bookings/${id}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/

export const updateBookingStatus = async (
  id,
  status
) => {
  const { data } = await api.patch(
    `/agents/bookings/${id}/status`,
    {
      status,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

export const cancelAgentBooking = async (id) => {
  const { data } = await api.delete(
    `/agents/bookings/${id}`
  );

  return data;
};

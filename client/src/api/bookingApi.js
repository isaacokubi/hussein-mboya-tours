// client/src/api/bookingApi.js

import api from "./axios";


/*
|--------------------------------------------------------------------------
| GET BOOKINGS
| General booking list (supports query parameters)
|--------------------------------------------------------------------------
*/

export const getBookings = async (params = {}) => {

  const { data } = await api.get(
    "/bookings",
    {
      params,
    }
  );

  return data;

};





/*
|--------------------------------------------------------------------------
| GET MY BOOKINGS
|--------------------------------------------------------------------------
*/

export const getMyBookings = async (params = {}) => {

  const { data } = await api.get(
    "/bookings/my-bookings",
    {
      params,
    }
  );

  return data;

};





/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

export const createBooking = async (data) => {

  const response = await api.post(
    "/bookings",
    data
  );

  return response.data;

};





/*
|--------------------------------------------------------------------------
| INITIATE MPESA PAYMENT
|--------------------------------------------------------------------------
*/

export const initiatePayment = async (data) => {

  const response = await api.post(
    "/payments/mpesa",
    data
  );

  return response.data;

};





/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

export const getBooking = async (id) => {

  const { data } = await api.get(
    `/bookings/${id}`
  );

  return data;

};





/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

export const cancelBooking = async (id) => {

  const { data } = await api.put(
    `/bookings/cancel/${id}`,
    {}
  );

  return data;

};





/*
|--------------------------------------------------------------------------
| ADMIN GET BOOKINGS
|--------------------------------------------------------------------------
*/

export const getAdminBookings = async (params = {}) => {

  const { data } = await api.get(
    "/bookings/admin",
    {
      params,
    }
  );

  return data;

};





/*
|--------------------------------------------------------------------------
| ADMIN UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/

export const updateBookingStatus = async (
  id,
  status
) => {

  const { data } = await api.put(
    `/bookings/${id}/status`,
    {
      status,
    }
  );

  return data;

};
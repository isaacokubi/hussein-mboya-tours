import api from "./axios";

/*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

export const getBookings = async (params = {}) => {
  const { data } = await api.get(
    "/admin/bookings",
    {
      params,
    }
  );

  return data;
};

export const getBooking = async (id) => {
  const { data } = await api.get(
    `/admin/bookings/${id}`
  );

  return data;
};

export const updateBooking = async (
  id,
  payload
) => {
  const { data } = await api.put(
    `/admin/bookings/${id}`,
    payload
  );

  return data;
};

export const deleteBooking = async (id) => {
  const { data } = await api.delete(
    `/admin/bookings/${id}`
  );

  return data;
};
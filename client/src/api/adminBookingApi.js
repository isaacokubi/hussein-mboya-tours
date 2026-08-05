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

export const updateBookingStatus = async (
  id,
  status
) => {
  const { data } = await api.put(
    `/admin/bookings/${id}/status`,
    {
      status
    }
  );

  return data;
};

export const assignBookingResources = async (
  id,
  payload
) => {
  const { data } = await api.put(
    `/admin/bookings/${id}/assign`,
    payload
  );

  return data;
};

export const updateBookingPayment = async (
  id,
  payload
) => {
  const { data } = await api.put(
    `/admin/bookings/${id}/payment`,
    payload
  );

  return data;
};

export const getBookingDetails = async(id)=>{

const {data}=await api.get(
`/admin/bookings/${id}`
);

return data;

};


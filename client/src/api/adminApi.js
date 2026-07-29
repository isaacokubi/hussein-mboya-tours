import api from "./axios";


export const getDashboard = async () => {

  const response = await api.get(
    "/admin/dashboard"
  );


  return response.data;

};



export const getAdminBookings = async () => {

  const response = await api.get(
    "/admin/bookings"
  );


  return response.data;

};



export const updateBooking = async (
  id,
  status
) => {

  const response = await api.put(
    `/admin/bookings/${id}`,
    {
      status,
    }
  );


  return response.data;

};
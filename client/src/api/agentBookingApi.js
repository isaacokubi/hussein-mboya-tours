import api from "./axios";


export const createAgentBooking =
(data)=>

api.post(
"/agent/bookings",
data
);



export const getAgentBookings =
()=>


api.get(
"/agent/bookings"
);



export const updateBookingStatus =
(id,status)=>

api.patch(

`/agent/bookings/${id}/status`,

{
status
}

);
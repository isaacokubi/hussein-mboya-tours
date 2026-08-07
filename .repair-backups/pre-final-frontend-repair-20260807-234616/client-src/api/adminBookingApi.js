import api from "./axios";

/*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

export const getBookings = async () => {
  const { data } = await api.get(
    "/admin/bookings"
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



export const getBookingTimeline = async(id)=>{
  const {data}=await api.get(
    `/admin/bookings/${id}/timeline`
  );

  return data;
};


export const downloadInvoice = async(id)=>{
  const response=await api.get(
    `/admin/bookings/${id}/invoice`,
    {
      responseType:"blob"
    }
  );

  return response;
};



/*
|--------------------------------------------------------------------------
| BOOKING REPORTING
|--------------------------------------------------------------------------
*/

export const exportBookings = async(type="csv")=>{

  const response = await api.get(
    `/admin/bookings/export?type=${type}`,
    {
      responseType:"blob"
    }
  );

  return response;

};



/*
|--------------------------------------------------------------------------
| CUSTOMER COMMUNICATION
|--------------------------------------------------------------------------
*/


export const sendBookingNotification = async(
 id,
 payload
)=>{

 const {data}=await api.post(
   `/admin/bookings/${id}/notify`,
   payload
 );

 return data;

};





export const refundBooking = async(
id,
payload={}
)=>{
const {data}=await api.put(
`/admin/bookings/${id}/refund`,
payload
);

return data;
};




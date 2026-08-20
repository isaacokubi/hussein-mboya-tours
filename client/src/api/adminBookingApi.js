import api from "./axios";

/*
|--------------------------------------------------------------------------
| CUSTOMER DISPLAY NORMALIZATION
|--------------------------------------------------------------------------
|
| Bookings can identify a customer through several supported fields:
| - populated Customer document
| - authenticated User document
| - customerSnapshot saved with the booking
| - contact snapshot saved with the booking
|
| Keep a consistent customer object for every dashboard so deleted/unlinked
| customer references do not turn into "Unknown" when the booking still has
| the customer's historical contact information.
|--------------------------------------------------------------------------
*/

const normalizeBookingCustomer = (booking) => {
  if (!booking || typeof booking !== "object") return booking;

  const customer =
    booking.customer && typeof booking.customer === "object"
      ? booking.customer
      : null;

  const user =
    booking.user && typeof booking.user === "object"
      ? booking.user
      : null;

  const snapshot =
    booking.customerSnapshot && typeof booking.customerSnapshot === "object"
      ? booking.customerSnapshot
      : null;

  const contact =
    booking.contact && typeof booking.contact === "object"
      ? booking.contact
      : null;

  const firstName =
    user?.firstName ||
    customer?.firstName ||
    "";

  const lastName =
    user?.lastName ||
    customer?.lastName ||
    "";

  const composedName = `${firstName} ${lastName}`.trim();

  const name =
    customer?.name ||
    snapshot?.name ||
    contact?.name ||
    user?.name ||
    composedName ||
    "";

  const email =
    customer?.email ||
    snapshot?.email ||
    contact?.email ||
    user?.email ||
    "";

  const phone =
    customer?.phone ||
    snapshot?.phone ||
    contact?.phone ||
    user?.phone ||
    "";

  const normalizedCustomer =
    customer || user || snapshot || contact || null;

  return {
    ...booking,

    // Preserve the original populated references when available.
    customer: normalizedCustomer
      ? {
          ...normalizedCustomer,
          name: normalizedCustomer.name || name,
          email: normalizedCustomer.email || email,
          phone: normalizedCustomer.phone || phone,
        }
      : booking.customer,

    // Compatibility aliases for older dashboard components.
    _customer: {
      ...(customer || {}),
      name,
      email,
      phone,
    },

    _customerSnapshot: {
      ...(snapshot || {}),
      name,
      email,
      phone,
    },

    customerDisplayName: name,
    customerDisplayEmail: email,
    customerDisplayPhone: phone,
  };
};

const normalizeBookingResponse = (response) => {
  if (!response || typeof response !== "object") return response;

  if (Array.isArray(response)) {
    return response.map(normalizeBookingCustomer);
  }

  if (Array.isArray(response.data)) {
    return {
      ...response,
      data: response.data.map(normalizeBookingCustomer),
    };
  }

  if (Array.isArray(response.bookings)) {
    return {
      ...response,
      bookings: response.bookings.map(normalizeBookingCustomer),
    };
  }

  if (response.data && typeof response.data === "object") {
    return {
      ...response,
      data: normalizeBookingCustomer(response.data),
    };
  }

  return response;
};

/*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

export const getBookings = async (params = {}) => {
  const response = await api.get("/admin/bookings", {
    params,
  });

  return normalizeBookingResponse(response.data);
};

export const getBooking = async (id) => {
  const { data } = await api.get(
    `/admin/bookings/${id}`
  );

  return normalizeBookingResponse(data);
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

  return normalizeBookingResponse(data);
};

export const assignBookingResources = async (
  id,
  payload
) => {
  const { data } = await api.put(
    `/admin/bookings/${id}/assign`,
    payload
  );

  return normalizeBookingResponse(data);
};

export const updateBookingPayment = async (
  id,
  payload
) => {
  const { data } = await api.put(
    `/admin/bookings/${id}/payment`,
    payload
  );

  return normalizeBookingResponse(data);
};

export const getBookingDetails = async(id)=>{

const {data}=await api.get(
`/admin/bookings/${id}`
);

return normalizeBookingResponse(data);

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




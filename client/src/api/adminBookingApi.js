/**
 * Purpose: admin Booking Api client application module. Main declarations: getActiveTenantId, bookingBelongsToActiveTenant, normalizeBookingCustomer, normalizeBookingList, normalizeBookingResponse.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getActiveTenantId for use by the surrounding module or function.
const getActiveTenantId = () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare raw for use by the surrounding module or function.
    const raw = localStorage.getItem("user");
    // Check the condition (!raw) and run the matching branch.
    if (!raw) return "";
    // Declare user for use by the surrounding module or function.
    const user = JSON.parse(raw);
    // Return the result of String(user?.tenantId || user?.tenant?._id || user?.organizationId || "").trim() to the caller.
    return String(user?.tenantId || user?.tenant?._id || user?.organizationId || "").trim();
  } catch {
    // Return a configured text value to the caller.
    return "";
  }
};

// Declare bookingBelongsToActiveTenant for use by the surrounding module or function.
const bookingBelongsToActiveTenant = (booking) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = getActiveTenantId();
  // Check the condition (!tenantId) and run the matching branch.
  if (!tenantId) return true;
  // Declare bookingTenantId for use by the surrounding module or function.
  const bookingTenantId = booking?.tenantId || booking?.tenant?._id;
  // Return the expression shown below to the caller.
  return bookingTenantId ? String(bookingTenantId) === tenantId : false;
};

/*
|--------------------------------------------------------------------------
| CUSTOMER DISPLAY NORMALIZATION + TENANT SAFETY
|--------------------------------------------------------------------------
|
| The API is responsible for authoritative tenant isolation. This client
| applies a second, fail-closed tenant check before an admin booking can
| enter the UI. A booking without an explicit tenantId is not displayed when
| an authenticated tenantId is available.
|--------------------------------------------------------------------------
*/

// Declare normalizeBookingCustomer for use by the surrounding module or function.
const normalizeBookingCustomer = (booking) => {
  // Check the condition (!booking || typeof booking !== "object") and run the matching branch.
  if (!booking || typeof booking !== "object") return booking;
  // Check the condition (!bookingBelongsToActiveTenant(booking)) and run the matching branch.
  if (!bookingBelongsToActiveTenant(booking)) return null;

  // Declare customer for use by the surrounding module or function.
  const customer = booking.customer && typeof booking.customer === "object" ? booking.customer : null;
  // Declare user for use by the surrounding module or function.
  const user = booking.user && typeof booking.user === "object" ? booking.user : null;
  // Declare snapshot for use by the surrounding module or function.
  const snapshot = booking.customerSnapshot && typeof booking.customerSnapshot === "object" ? booking.customerSnapshot : null;
  // Declare contact for use by the surrounding module or function.
  const contact = booking.contact && typeof booking.contact === "object" ? booking.contact : null;

  // Declare firstName for use by the surrounding module or function.
  const firstName = user?.firstName || customer?.firstName || "";
  // Declare lastName for use by the surrounding module or function.
  const lastName = user?.lastName || customer?.lastName || "";
  // Declare composedName for use by the surrounding module or function.
  const composedName = `${firstName} ${lastName}`.trim();
  // Declare name for use by the surrounding module or function.
  const name = customer?.name || snapshot?.name || contact?.name || user?.name || composedName || "";
  // Declare email for use by the surrounding module or function.
  const email = customer?.email || snapshot?.email || contact?.email || user?.email || "";
  // Declare phone for use by the surrounding module or function.
  const phone = customer?.phone || snapshot?.phone || contact?.phone || user?.phone || "";
  // Declare normalizedCustomer for use by the surrounding module or function.
  const normalizedCustomer = customer || user || snapshot || contact || null;

  // Return the object assembled below to the caller.
  return {
    ...booking,
    customer: normalizedCustomer
      ? {
          ...normalizedCustomer,
          name: normalizedCustomer.name || name,
          email: normalizedCustomer.email || email,
          phone: normalizedCustomer.phone || phone,
        }
      : booking.customer,
    _customer: { ...(customer || {}), name, email, phone },
    _customerSnapshot: { ...(snapshot || {}), name, email, phone },
    customerDisplayName: name,
    customerDisplayEmail: email,
    customerDisplayPhone: phone,
  };
};

// Declare normalizeBookingList for use by the surrounding module or function.
const normalizeBookingList = (bookings) =>
  bookings.map(normalizeBookingCustomer).filter(Boolean);

// Declare normalizeBookingResponse for use by the surrounding module or function.
const normalizeBookingResponse = (response) => {
  // Check the condition (!response || typeof response !== "object") and run the matching branch.
  if (!response || typeof response !== "object") return response;
  // Check the condition (Array.isArray(response)) and run the matching branch.
  if (Array.isArray(response)) return normalizeBookingList(response);
  // Check the condition (Array.isArray(response.data)) and run the matching branch.
  if (Array.isArray(response.data)) return { ...response, data: normalizeBookingList(response.data) };
  // Check the condition (Array.isArray(response.bookings)) and run the matching branch.
  if (Array.isArray(response.bookings)) return { ...response, bookings: normalizeBookingList(response.bookings) };
  // Check the condition (response.data && typeof response.data === "object") and run the matching branch.
  if (response.data && typeof response.data === "object") {
    // Declare normalized for use by the surrounding module or function.
    const normalized = normalizeBookingCustomer(response.data);
    // Return the object assembled below to the caller.
    return { ...response, data: normalized };
  }
  // Return the value of response to the caller.
  return response;
};

// Declare getBookings for use by the surrounding module or function.
export const getBookings = async (params = {}) => {
  // Declare response for use by the surrounding module or function.
  const response = await api.get("/admin/bookings", { params });
  // Return the result of normalizeBookingResponse() to the caller.
  return normalizeBookingResponse(response.data);
};

// Declare getBooking for use by the surrounding module or function.
export const getBooking = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/admin/bookings/${id}`);
  // Return the result of normalizeBookingResponse() to the caller.
  return normalizeBookingResponse(data);
};

// Declare updateBookingStatus for use by the surrounding module or function.
export const updateBookingStatus = async (id, status) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/admin/bookings/${id}/status`, { status });
  // Return the result of normalizeBookingResponse() to the caller.
  return normalizeBookingResponse(data);
};

// Declare assignBookingResources for use by the surrounding module or function.
export const assignBookingResources = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/admin/bookings/${id}/assign`, payload);
  // Return the result of normalizeBookingResponse() to the caller.
  return normalizeBookingResponse(data);
};

// Declare updateBookingPayment for use by the surrounding module or function.
export const updateBookingPayment = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/admin/bookings/${id}/payment`, payload);
  // Return the result of normalizeBookingResponse() to the caller.
  return normalizeBookingResponse(data);
};

// Declare getBookingDetails for use by the surrounding module or function.
export const getBookingDetails = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/admin/bookings/${id}`);
  // Return the result of normalizeBookingResponse() to the caller.
  return normalizeBookingResponse(data);
};

// Declare getBookingTimeline for use by the surrounding module or function.
export const getBookingTimeline = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/admin/bookings/${id}/timeline`);
  // Return the value of data to the caller.
  return data;
};

// Declare downloadInvoice for use by the surrounding module or function.
export const downloadInvoice = async (id) => {
  // Return the result of api.get() to the caller.
  return api.get(`/admin/bookings/${id}/invoice`, { responseType: "blob" });
};

// Declare exportBookings for use by the surrounding module or function.
export const exportBookings = async (type = "csv") => {
  // Return the result of api.get() to the caller.
  return api.get(`/admin/bookings/export?type=${type}`, { responseType: "blob" });
};

// Declare sendBookingNotification for use by the surrounding module or function.
export const sendBookingNotification = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(`/admin/bookings/${id}/notify`, payload);
  // Return the value of data to the caller.
  return data;
};

// Declare refundBooking for use by the surrounding module or function.
export const refundBooking = async (id, payload = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/admin/bookings/${id}/refund`, payload);
  // Return the value of data to the caller.
  return data;
};

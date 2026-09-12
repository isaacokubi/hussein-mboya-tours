import api from "./axios";

const getActiveTenantId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const user = JSON.parse(raw);
    return String(user?.tenantId || user?.tenant?._id || user?.organizationId || "").trim();
  } catch {
    return "";
  }
};

const bookingBelongsToActiveTenant = (booking) => {
  const tenantId = getActiveTenantId();
  if (!tenantId) return true;
  const bookingTenantId = booking?.tenantId || booking?.tenant?._id;
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

const normalizeBookingCustomer = (booking) => {
  if (!booking || typeof booking !== "object") return booking;
  if (!bookingBelongsToActiveTenant(booking)) return null;

  const customer = booking.customer && typeof booking.customer === "object" ? booking.customer : null;
  const user = booking.user && typeof booking.user === "object" ? booking.user : null;
  const snapshot = booking.customerSnapshot && typeof booking.customerSnapshot === "object" ? booking.customerSnapshot : null;
  const contact = booking.contact && typeof booking.contact === "object" ? booking.contact : null;

  const firstName = user?.firstName || customer?.firstName || "";
  const lastName = user?.lastName || customer?.lastName || "";
  const composedName = `${firstName} ${lastName}`.trim();
  const name = customer?.name || snapshot?.name || contact?.name || user?.name || composedName || "";
  const email = customer?.email || snapshot?.email || contact?.email || user?.email || "";
  const phone = customer?.phone || snapshot?.phone || contact?.phone || user?.phone || "";
  const normalizedCustomer = customer || user || snapshot || contact || null;

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

const normalizeBookingList = (bookings) =>
  bookings.map(normalizeBookingCustomer).filter(Boolean);

const normalizeBookingResponse = (response) => {
  if (!response || typeof response !== "object") return response;
  if (Array.isArray(response)) return normalizeBookingList(response);
  if (Array.isArray(response.data)) return { ...response, data: normalizeBookingList(response.data) };
  if (Array.isArray(response.bookings)) return { ...response, bookings: normalizeBookingList(response.bookings) };
  if (response.data && typeof response.data === "object") {
    const normalized = normalizeBookingCustomer(response.data);
    return { ...response, data: normalized };
  }
  return response;
};

export const getBookings = async (params = {}) => {
  const response = await api.get("/admin/bookings", { params });
  return normalizeBookingResponse(response.data);
};

export const getBooking = async (id) => {
  const { data } = await api.get(`/admin/bookings/${id}`);
  return normalizeBookingResponse(data);
};

export const updateBookingStatus = async (id, status) => {
  const { data } = await api.put(`/admin/bookings/${id}/status`, { status });
  return normalizeBookingResponse(data);
};

export const assignBookingResources = async (id, payload) => {
  const { data } = await api.put(`/admin/bookings/${id}/assign`, payload);
  return normalizeBookingResponse(data);
};

export const updateBookingPayment = async (id, payload) => {
  const { data } = await api.put(`/admin/bookings/${id}/payment`, payload);
  return normalizeBookingResponse(data);
};

export const getBookingDetails = async (id) => {
  const { data } = await api.get(`/admin/bookings/${id}`);
  return normalizeBookingResponse(data);
};

export const getBookingTimeline = async (id) => {
  const { data } = await api.get(`/admin/bookings/${id}/timeline`);
  return data;
};

export const downloadInvoice = async (id) => {
  return api.get(`/admin/bookings/${id}/invoice`, { responseType: "blob" });
};

export const exportBookings = async (type = "csv") => {
  return api.get(`/admin/bookings/export?type=${type}`, { responseType: "blob" });
};

export const sendBookingNotification = async (id, payload) => {
  const { data } = await api.post(`/admin/bookings/${id}/notify`, payload);
  return data;
};

export const refundBooking = async (id, payload = {}) => {
  const { data } = await api.put(`/admin/bookings/${id}/refund`, payload);
  return data;
};

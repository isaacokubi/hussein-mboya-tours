# Client API module: `client/src/api/adminBookingApi.js`

**Source:** [client/src/api/adminBookingApi.js](../../../../client/src/api/adminBookingApi.js)

## Responsibility

This module is the client-side transport boundary for the admin booking feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getBookings` (source line 83)

`async (params = {}) => {`

Calls: `GET /admin/bookings`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getBooking` (source line 88)

`async (id) => {`

Calls: `GET /admin/bookings/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateBookingStatus` (source line 93)

`async (id, status) => {`

Calls: `PUT /admin/bookings/${…}/status`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `assignBookingResources` (source line 98)

`async (id, payload) => {`

Calls: `PUT /admin/bookings/${…}/assign`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateBookingPayment` (source line 103)

`async (id, payload) => {`

Calls: `PUT /admin/bookings/${…}/payment`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getBookingDetails` (source line 108)

`async (id) => {`

Calls: `GET /admin/bookings/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getBookingTimeline` (source line 113)

`async (id) => {`

Calls: `GET /admin/bookings/${…}/timeline`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `downloadInvoice` (source line 118)

`async (id) => {`

Calls: `GET /admin/bookings/${…}/invoice`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `exportBookings` (source line 122)

`async (type = "csv") => {`

Calls: `GET /admin/bookings/export?type=${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `sendBookingNotification` (source line 126)

`async (id, payload) => {`

Calls: `POST /admin/bookings/${…}/notify`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `refundBooking` (source line 131)

`async (id, payload = {}) => {`

Calls: `PUT /admin/bookings/${…}/refund`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/agentBookingApi.js`](../../../../client/src/api/agentBookingApi.js)
- [`client/src/api/bookingApi.js`](../../../../client/src/api/bookingApi.js)
- [`client/src/api/tourManagerApi.js`](../../../../client/src/api/tourManagerApi.js)
- [`client/src/pages/BookingDetails.jsx`](../../../../client/src/pages/BookingDetails.jsx)
- [`client/src/pages/PaymentStatus.jsx`](../../../../client/src/pages/PaymentStatus.jsx)
- [`client/src/pages/admin/BookingManagement.jsx`](../../../../client/src/pages/admin/BookingManagement.jsx)
- [`client/src/pages/admin/ManageBookings.jsx`](../../../../client/src/pages/admin/ManageBookings.jsx)
- [`client/src/pages/tourManager/TourManagerBookings.jsx`](../../../../client/src/pages/tourManager/TourManagerBookings.jsx)
- [`client/src/pages/tourManager/TourManagerCopilot.jsx`](../../../../client/src/pages/tourManager/TourManagerCopilot.jsx)
- [`client/src/pages/tourManager/TourManagerTours.jsx`](../../../../client/src/pages/tourManager/TourManagerTours.jsx)
- [`client/src/services/tourManagerService.js`](../../../../client/src/services/tourManagerService.js)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
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
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.

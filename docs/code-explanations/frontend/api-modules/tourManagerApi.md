# Client API module: `client/src/api/tourManagerApi.js`

**Source:** [client/src/api/tourManagerApi.js](../../../../client/src/api/tourManagerApi.js)

## Responsibility

This module is the client-side transport boundary for the tour manager feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `createOperationsQuoteDraft` (source line 3)

`async (payload) => {`

Calls: `POST /tourmanager/copilot/quote-draft`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getOperationsCopilotSummary` (source line 8)

`async () => {`

Calls: `GET /tourmanager/copilot/summary`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDashboardStats` (source line 13)

`async () => {`

Calls: `GET /tourmanager/dashboard`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTours` (source line 18)

`async (params = {}) => {`

Calls: `GET /tourmanager/tours`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createTour` (source line 23)

`async (tourData) => {`

Calls: `POST /tourmanager/tours`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateTour` (source line 28)

`async (id, tourData) => {`

Calls: `PUT /tourmanager/tours/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteTour` (source line 33)

`async (id) => {`

Calls: `DELETE /tourmanager/tours/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `assignGuide` (source line 38)

`async (tourId, guideId) => {`

Calls: `POST /tourmanager/assign-guide`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createItinerary` (source line 43)

`async (itineraryData) => {`

Calls: `POST /tourmanager/itineraries`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getItineraries` (source line 48)

`async (params = {}) => {`

Calls: `GET /tourmanager/itineraries`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getItinerary` (source line 53)

`async (id) => {`

Calls: `GET /tourmanager/itineraries/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateItinerary` (source line 58)

`async (id, itineraryData) => {`

Calls: `PUT /tourmanager/itineraries/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteItinerary` (source line 63)

`async (id) => {`

Calls: `DELETE /tourmanager/itineraries/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getBookings` (source line 68)

`async (params = {}) => {`

Calls: `GET /tourmanager/bookings`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `sendBookingNotification` (source line 73)

`async (id, channel, type = "payment_reminder") => {`

Calls: `POST /tourmanager/bookings/${…}/notify`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `completeBooking` (source line 78)

`async (id) => {`

Calls: `PATCH /tourmanager/bookings/${…}/complete`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `cancelBooking` (source line 83)

`async (id, reason = "Cancelled by tour manager") => {`

Calls: `PATCH /tourmanager/bookings/${…}/cancel`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getCustomers` (source line 88)

`async (params = {}) => {`

Calls: `GET /tourmanager/customers`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getGuides` (source line 93)

`async () => {`

Calls: `GET /tourmanager/guides`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getReports` (source line 98)

`async (params = {}) => {`

Calls: `GET /tourmanager/reports`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getTourAvailability` (source line 103)

`async (id) => {`

Calls: `GET /tourmanager/tours/${…}/availability`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateTourAvailability` (source line 108)

`async (id, payload) => {`

Calls: `PUT /tourmanager/tours/${…}/availability`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteManagerTour` (source line 114)

`deleteTour`

No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getManagerTours` (source line 115)

`getTours`

No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createManagerTour` (source line 116)

`createTour`

No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateManagerTour` (source line 117)

`updateTour`

No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getCalendarReminders` (source line 119)

`async (params = {}) => {`

Calls: `GET /tourmanager/calendar/reminders`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createCalendarReminder` (source line 124)

`async (reminder) => {`

Calls: `POST /tourmanager/calendar/reminders`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteCalendarReminder` (source line 129)

`async (id) => {`

Calls: `DELETE /tourmanager/calendar/reminders/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/adminBookingApi.js`](../../../../client/src/api/adminBookingApi.js)
- [`client/src/api/adminTourApi.js`](../../../../client/src/api/adminTourApi.js)
- [`client/src/api/bookingApi.js`](../../../../client/src/api/bookingApi.js)
- [`client/src/api/customerApi.js`](../../../../client/src/api/customerApi.js)
- [`client/src/api/financeApi.js`](../../../../client/src/api/financeApi.js)
- [`client/src/api/tourApi.js`](../../../../client/src/api/tourApi.js)
- [`client/src/api/tourAssignmentApi.js`](../../../../client/src/api/tourAssignmentApi.js)
- [`client/src/pages/MyBookings.jsx`](../../../../client/src/pages/MyBookings.jsx)
- [`client/src/pages/Tours.jsx`](../../../../client/src/pages/Tours.jsx)
- [`client/src/pages/admin/BookingManagement.jsx`](../../../../client/src/pages/admin/BookingManagement.jsx)
- [`client/src/pages/admin/CustomTourRequests.jsx`](../../../../client/src/pages/admin/CustomTourRequests.jsx)
- [`client/src/pages/admin/Guides.jsx`](../../../../client/src/pages/admin/Guides.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const createOperationsQuoteDraft = async (payload) => {
  const { data } = await api.post("/tourmanager/copilot/quote-draft", payload);
  return data;
};

export const getOperationsCopilotSummary = async () => {
  const { data } = await api.get("/tourmanager/copilot/summary");
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get("/tourmanager/dashboard");
  return data;
};

export const getTours = async (params = {}) => {
  const { data } = await api.get("/tourmanager/tours", { params });
  return data;
};

export const createTour = async (tourData) => {
  const { data } = await api.post("/tourmanager/tours", tourData);
  return data;
};

export const updateTour = async (id, tourData) => {
  const { data } = await api.put(`/tourmanager/tours/${id}`, tourData);
  return data;
};

export const deleteTour = async (id) => {
  const { data } = await api.delete(`/tourmanager/tours/${id}`);
  return data;
};

export const assignGuide = async (tourId, guideId) => {
  const { data } = await api.post("/tourmanager/assign-guide", { tourId, guideId });
  return data;
};

export const createItinerary = async (itineraryData) => {
  const { data } = await api.post("/tourmanager/itineraries", itineraryData);
  return data;
};

export const getItineraries = async (params = {}) => {
  const { data } = await api.get("/tourmanager/itineraries", { params });
  return data;
};

export const getItinerary = async (id) => {
  const { data } = await api.get(`/tourmanager/itineraries/${id}`);
  return data;
};

export const updateItinerary = async (id, itineraryData) => {
  const { data } = await api.put(`/tourmanager/itineraries/${id}`, itineraryData);
  return data;
};

export const deleteItinerary = async (id) => {
  const { data } = await api.delete(`/tourmanager/itineraries/${id}`);
  return data;
};

export const getBookings = async (params = {}) => {
  const { data } = await api.get("/tourmanager/bookings", { params });
  return data;
};

export const sendBookingNotification = async (id, channel, type = "payment_reminder") => {
  const { data } = await api.post(`/tourmanager/bookings/${id}/notify`, { type, channel });
  return data;
};

export const completeBooking = async (id) => {
  const { data } = await api.patch(`/tourmanager/bookings/${id}/complete`);
  return data;
};

export const cancelBooking = async (id, reason = "Cancelled by tour manager") => {
  const { data } = await api.patch(`/tourmanager/bookings/${id}/cancel`, { reason });
  return data;
};

export const getCustomers = async (params = {}) => {
  const { data } = await api.get("/tourmanager/customers", { params });
  return data;
};

export const getGuides = async () => {
  const { data } = await api.get("/tourmanager/guides");
  return data;
};

export const getReports = async (params = {}) => {
  const { data } = await api.get("/tourmanager/reports", { params });
  return data;
};

export const getTourAvailability = async (id) => {
  const { data } = await api.get(`/tourmanager/tours/${id}/availability`);
  return data;
};

export const updateTourAvailability = async (id, payload) => {
  const { data } = await api.put(`/tourmanager/tours/${id}/availability`, payload);
  return data;
};

// Backward-compatible aliases used by existing Manager components.
export const deleteManagerTour = deleteTour;
export const getManagerTours = getTours;
export const createManagerTour = createTour;
export const updateManagerTour = updateTour;

export const getCalendarReminders = async (params = {}) => {
  const { data } = await api.get("/tourmanager/calendar/reminders", { params });
  return data;
};

export const createCalendarReminder = async (reminder) => {
  const { data } = await api.post("/tourmanager/calendar/reminders", reminder);
  return data;
};

export const deleteCalendarReminder = async (id) => {
  const { data } = await api.delete(`/tourmanager/calendar/reminders/${id}`);
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.

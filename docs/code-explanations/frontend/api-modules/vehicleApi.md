# Client API module: `client/src/api/vehicleApi.js`

**Source:** [client/src/api/vehicleApi.js](../../../../client/src/api/vehicleApi.js)

## Responsibility

This module is the client-side transport boundary for the vehicle feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getVehicles` (source line 15)

`async () => {`

Calls: `GET /vehicles`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getVehicleById` (source line 27)

`async (id) => {`

Calls: `GET /vehicles/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createVehicle` (source line 48)

`async (data) => {`

Calls: `POST /vehicles`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Supports multipart form payload handling for uploads.
### `updateVehicle` (source line 68)

`async (id, data) => {`

Calls: `PUT /vehicles/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Supports multipart form payload handling for uploads.
### `deleteVehicle` (source line 88)

`async (id) => {`

Calls: `DELETE /vehicles/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDrivers` (source line 107)

`async () => {`

Calls: `GET /staff/drivers`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `assignDriver` (source line 119)

`async (`

Calls: `PUT /vehicles/${…}/assign-driver`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `removeDriver` (source line 140)

`async (vehicleId) => {`

Calls: `PUT /vehicles/${…}/remove-driver`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateVehicleStatus` (source line 161)

`async (`

Calls: `PUT /vehicles/${…}/status`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/adminTourApi.js`](../../../../client/src/api/adminTourApi.js)
- [`client/src/api/tourApi.js`](../../../../client/src/api/tourApi.js)
- [`client/src/api/tourAssignmentApi.js`](../../../../client/src/api/tourAssignmentApi.js)
- [`client/src/components/admin/AddVehicleModal.jsx`](../../../../client/src/components/admin/AddVehicleModal.jsx)
- [`client/src/hooks/useVehicles.js`](../../../../client/src/hooks/useVehicles.js)
- [`client/src/pages/admin/BookingManagement.jsx`](../../../../client/src/pages/admin/BookingManagement.jsx)
- [`client/src/pages/admin/CustomTourRequests.jsx`](../../../../client/src/pages/admin/CustomTourRequests.jsx)
- [`client/src/pages/admin/Vehicles.jsx`](../../../../client/src/pages/admin/Vehicles.jsx)
- [`client/src/pages/tourManager/AssignVehicle.jsx`](../../../../client/src/pages/tourManager/AssignVehicle.jsx)
- [`client/src/pages/tourManager/CreateTour.jsx`](../../../../client/src/pages/tourManager/CreateTour.jsx)
- [`client/src/pages/tourManager/EditTour.jsx`](../../../../client/src/pages/tourManager/EditTour.jsx)
- [`client/src/pages/tourManager/TourAssignments.jsx`](../../../../client/src/pages/tourManager/TourAssignments.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";


/*
|--------------------------------------------------------------------------
| VEHICLE MANAGEMENT
|--------------------------------------------------------------------------
*/


// ============================================================
// GET ALL VEHICLES
// ============================================================

export const getVehicles = async () => {
  const { data } = await api.get("/vehicles");
  return data;
};




// ============================================================
// GET SINGLE VEHICLE
// ============================================================

export const getVehicleById = async (id) => {
  const { data } = await api.get(`/vehicles/${id}`);
  return data;
};




// ============================================================
// CREATE VEHICLE
// ============================================================
//
// Sends:
// - vehicle details
// - image file
//
// Backend:
// upload.single("image")
//
// ============================================================

export const createVehicle = async (data) => {
  const response = await api.post(
    "/vehicles",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};




// ============================================================
// UPDATE VEHICLE
// ============================================================

export const updateVehicle = async (id, data) => {
  const response = await api.put(
    `/vehicles/${id}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};




// ============================================================
// DELETE VEHICLE
// ============================================================

export const deleteVehicle = async (id) => {
  const { data } = await api.delete(`/vehicles/${id}`);
  return data;
};




/*
|--------------------------------------------------------------------------
| DRIVER MANAGEMENT
|--------------------------------------------------------------------------
*/


// ============================================================
// GET ALL DRIVERS
// ============================================================

export const getDrivers = async () => {
  const { data } = await api.get("/staff/drivers");
  return data;
};




// ============================================================
// ASSIGN DRIVER TO VEHICLE
// ============================================================

export const assignDriver = async (
  vehicleId,
  driverId
) => {
  const { data } = await api.put(
    `/vehicles/${vehicleId}/assign-driver`,
    {
      driverId,
      driver: driverId,
    }
  );
  return data;
};




// ============================================================
// REMOVE DRIVER FROM VEHICLE
// ============================================================

export const removeDriver = async (vehicleId) => {
  const { data } = await api.put(
    `/vehicles/${vehicleId}/remove-driver`
  );
  return data;
};




/*
|--------------------------------------------------------------------------
| VEHICLE STATUS
|--------------------------------------------------------------------------
*/


// ============================================================
// UPDATE VEHICLE STATUS
// ============================================================

export const updateVehicleStatus = async (
  id,
  status
) => {
  const { data } = await api.put(
    `/vehicles/${id}/status`,
    { status }
  );
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.

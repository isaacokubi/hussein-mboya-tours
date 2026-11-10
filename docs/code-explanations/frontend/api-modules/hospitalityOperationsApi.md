# Client API module: `client/src/api/hospitalityOperationsApi.js`

**Source:** [client/src/api/hospitalityOperationsApi.js](../../../../client/src/api/hospitalityOperationsApi.js)

## Responsibility

This module is the client-side transport boundary for the hospitality operations feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getHospitalityDashboard` (source line 3)

`()=>api.get("/admin/hospitality-operations/dashboard").then(unwrap)`

Calls: `GET /admin/hospitality-operations/dashboard`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getHotelCalendar` (source line 4)

`(params={})=>api.get("/admin/hospitality-operations/hotels/calendar",{params}).then(unwrap)`

Calls: `GET /admin/hospitality-operations/hotels/calendar`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getHotelPerformance` (source line 5)

`(params={})=>api.get("/admin/hospitality-operations/hotels/performance",{params}).then(unwrap)`

Calls: `GET /admin/hospitality-operations/hotels/performance`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `amendHotelBooking` (source line 6)

`(id,payload)=>api.patch(`/admin/hospitality-operations/hotels/bookings/${id}/amend`,payload).then(unwrap)`

Calls: `PATCH /admin/hospitality-operations/hotels/bookings/${…}/amend`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `cancelHotelBooking` (source line 7)

`(id,payload={})=>api.patch(`/admin/hospitality-operations/hotels/bookings/${id}/cancel`,payload).then(unwrap)`

Calls: `PATCH /admin/hospitality-operations/hotels/bookings/${…}/cancel`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `blockRooms` (source line 8)

`payload=>api.post("/admin/hospitality-operations/hotels/room-blocks",payload).then(unwrap)`

Calls: `POST /admin/hospitality-operations/hotels/room-blocks`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `releaseRoomBlock` (source line 9)

`id=>api.patch(`/admin/hospitality-operations/hotels/room-blocks/${id}/release`).then(unwrap)`

Calls: `PATCH /admin/hospitality-operations/hotels/room-blocks/${…}/release`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getRatePlans` (source line 10)

`(params={})=>api.get("/admin/hospitality-operations/rate-plans",{params}).then(unwrap)`

Calls: `GET /admin/hospitality-operations/rate-plans`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createRatePlan` (source line 11)

`payload=>api.post("/admin/hospitality-operations/rate-plans",payload).then(unwrap)`

Calls: `POST /admin/hospitality-operations/rate-plans`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateRatePlan` (source line 12)

`(id,payload)=>api.patch(`/admin/hospitality-operations/rate-plans/${id}`,payload).then(unwrap)`

Calls: `PATCH /admin/hospitality-operations/rate-plans/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSupplierContracts` (source line 13)

`(params={})=>api.get("/admin/hospitality-operations/suppliers/contracts",{params}).then(unwrap)`

Calls: `GET /admin/hospitality-operations/suppliers/contracts`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createSupplierContract` (source line 14)

`payload=>api.post("/admin/hospitality-operations/suppliers/contracts",payload).then(unwrap)`

Calls: `POST /admin/hospitality-operations/suppliers/contracts`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateSupplierContract` (source line 15)

`(id,payload)=>api.patch(`/admin/hospitality-operations/suppliers/contracts/${id}`,payload).then(unwrap)`

Calls: `PATCH /admin/hospitality-operations/suppliers/contracts/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getHospitalityDeposits` (source line 16)

`(params={})=>api.get("/admin/hospitality-operations/deposits",{params}).then(unwrap)`

Calls: `GET /admin/hospitality-operations/deposits`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getHospitalityRoomBlocks` (source line 17)

`(params={})=>api.get("/admin/hospitality-operations/hotels/room-blocks",{params}).then(unwrap)`

Calls: `GET /admin/hospitality-operations/hotels/room-blocks`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createHospitalityDeposit` (source line 18)

`payload=>api.post("/admin/hospitality-operations/deposits",payload).then(unwrap)`

Calls: `POST /admin/hospitality-operations/deposits`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateHospitalityDeposit` (source line 19)

`(id,payload)=>api.patch(`/admin/hospitality-operations/deposits/${id}`,payload).then(unwrap)`

Calls: `PATCH /admin/hospitality-operations/deposits/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTransferDispatch` (source line 20)

`(params={})=>api.get("/admin/hospitality-operations/transfers/dispatch",{params}).then(unwrap)`

Calls: `GET /admin/hospitality-operations/transfers/dispatch`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `assignTransfer` (source line 21)

`(id,payload)=>api.patch(`/admin/hospitality-operations/transfers/${id}/assign`,payload).then(unwrap)`

Calls: `PATCH /admin/hospitality-operations/transfers/${…}/assign`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateTransferStatus` (source line 22)

`(id,payload)=>api.patch(`/admin/hospitality-operations/transfers/${id}/status`,payload).then(unwrap)`

Calls: `PATCH /admin/hospitality-operations/transfers/${…}/status`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getHospitalityPaymentReconciliation` (source line 23)

`(params={})=>api.get("/admin/hospitality-operations/payments/reconciliation",{params}).then(unwrap)`

Calls: `GET /admin/hospitality-operations/payments/reconciliation`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getHospitalityDrivers` (source line 24)

`()=>api.get("/admin/hospitality-operations/drivers").then(unwrap)`

Calls: `GET /admin/hospitality-operations/drivers`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getHospitalityVehicles` (source line 25)

`()=>api.get("/admin/hospitality-operations/vehicles").then(unwrap)`

Calls: `GET /admin/hospitality-operations/vehicles`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/admin/HospitalityCommercial.jsx`](../../../../client/src/pages/admin/HospitalityCommercial.jsx)
- [`client/src/pages/admin/HospitalityOperations.jsx`](../../../../client/src/pages/admin/HospitalityOperations.jsx)
- [`client/src/pages/admin/HospitalityReservationOperations.jsx`](../../../../client/src/pages/admin/HospitalityReservationOperations.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";
const unwrap=r=>r?.data?.data??r?.data??[];
export const getHospitalityDashboard=()=>api.get("/admin/hospitality-operations/dashboard").then(unwrap);
export const getHotelCalendar=(params={})=>api.get("/admin/hospitality-operations/hotels/calendar",{params}).then(unwrap);
export const getHotelPerformance=(params={})=>api.get("/admin/hospitality-operations/hotels/performance",{params}).then(unwrap);
export const amendHotelBooking=(id,payload)=>api.patch(`/admin/hospitality-operations/hotels/bookings/${id}/amend`,payload).then(unwrap);
export const cancelHotelBooking=(id,payload={})=>api.patch(`/admin/hospitality-operations/hotels/bookings/${id}/cancel`,payload).then(unwrap);
export const blockRooms=payload=>api.post("/admin/hospitality-operations/hotels/room-blocks",payload).then(unwrap);
export const releaseRoomBlock=id=>api.patch(`/admin/hospitality-operations/hotels/room-blocks/${id}/release`).then(unwrap);
export const getRatePlans=(params={})=>api.get("/admin/hospitality-operations/rate-plans",{params}).then(unwrap);
export const createRatePlan=payload=>api.post("/admin/hospitality-operations/rate-plans",payload).then(unwrap);
export const updateRatePlan=(id,payload)=>api.patch(`/admin/hospitality-operations/rate-plans/${id}`,payload).then(unwrap);
export const getSupplierContracts=(params={})=>api.get("/admin/hospitality-operations/suppliers/contracts",{params}).then(unwrap);
export const createSupplierContract=payload=>api.post("/admin/hospitality-operations/suppliers/contracts",payload).then(unwrap);
export const updateSupplierContract=(id,payload)=>api.patch(`/admin/hospitality-operations/suppliers/contracts/${id}`,payload).then(unwrap);
export const getHospitalityDeposits=(params={})=>api.get("/admin/hospitality-operations/deposits",{params}).then(unwrap);
export const getHospitalityRoomBlocks=(params={})=>api.get("/admin/hospitality-operations/hotels/room-blocks",{params}).then(unwrap);
export const createHospitalityDeposit=payload=>api.post("/admin/hospitality-operations/deposits",payload).then(unwrap);
export const updateHospitalityDeposit=(id,payload)=>api.patch(`/admin/hospitality-operations/deposits/${id}`,payload).then(unwrap);
export const getTransferDispatch=(params={})=>api.get("/admin/hospitality-operations/transfers/dispatch",{params}).then(unwrap);
export const assignTransfer=(id,payload)=>api.patch(`/admin/hospitality-operations/transfers/${id}/assign`,payload).then(unwrap);
export const updateTransferStatus=(id,payload)=>api.patch(`/admin/hospitality-operations/transfers/${id}/status`,payload).then(unwrap);
export const getHospitalityPaymentReconciliation=(params={})=>api.get("/admin/hospitality-operations/payments/reconciliation",{params}).then(unwrap);
export const getHospitalityDrivers=()=>api.get("/admin/hospitality-operations/drivers").then(unwrap);
export const getHospitalityVehicles=()=>api.get("/admin/hospitality-operations/vehicles").then(unwrap);
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.

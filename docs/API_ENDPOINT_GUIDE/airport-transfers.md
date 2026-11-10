# API endpoints: airport-transfers

This guide contains 8 mounted method/path inventory entries in the **airport-transfers** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-166 — GET /api/airport-transfers

**Contract status:** SOURCE-TRACED<br>
**Router:** [airportTransferRoutes.js](../../server/routes/airportTransferRoutes.js) · [route module explanation](../code-explanations/backend/routes/airportTransferRoutes.md)<br>
**Mounted inventory entry:** 166 of 629<br>
**Route declaration pipeline:** `listTransfers`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/", listTransfers)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `airportCode`, `direction`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Airport transfer API contracts](../API_DOMAIN_CONTRACTS/airport-transfers.md) for shared route-specific behavior.

## endpoint-167 — GET /api/airport-transfers/admin/catalog

**Contract status:** SOURCE-TRACED<br>
**Router:** [airportTransferRoutes.js](../../server/routes/airportTransferRoutes.js) · [route module explanation](../code-explanations/backend/routes/airportTransferRoutes.md)<br>
**Mounted inventory entry:** 167 of 629<br>
**Route declaration pipeline:** `protect`, `managerOnly`, `listAdminTransfersSafe`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.get("/admin/catalog", protect, managerOnly, listAdminTransfersSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Airport transfer API contracts](../API_DOMAIN_CONTRACTS/airport-transfers.md) for shared route-specific behavior.

## endpoint-168 — POST /api/airport-transfers/admin/catalog

**Contract status:** SOURCE-TRACED<br>
**Router:** [airportTransferRoutes.js](../../server/routes/airportTransferRoutes.js) · [route module explanation](../code-explanations/backend/routes/airportTransferRoutes.md)<br>
**Mounted inventory entry:** 168 of 629<br>
**Route declaration pipeline:** `protect`, `managerOnly`, `createTransfer`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.post("/admin/catalog", protect, managerOnly, createTransfer)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `vehicleType`, `passengerCapacity`, `price`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Airport transfer API contracts](../API_DOMAIN_CONTRACTS/airport-transfers.md) for shared route-specific behavior.

## endpoint-169 — PATCH /api/airport-transfers/admin/catalog/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [airportTransferRoutes.js](../../server/routes/airportTransferRoutes.js) · [route module explanation](../code-explanations/backend/routes/airportTransferRoutes.md)<br>
**Mounted inventory entry:** 169 of 629<br>
**Route declaration pipeline:** `protect`, `managerOnly`, `updateTransfer`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.patch("/admin/catalog/:id", protect, managerOnly, updateTransfer)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Airport transfer API contracts](../API_DOMAIN_CONTRACTS/airport-transfers.md) for shared route-specific behavior.

## endpoint-170 — POST /api/airport-transfers/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [airportTransferRoutes.js](../../server/routes/airportTransferRoutes.js) · [route module explanation](../code-explanations/backend/routes/airportTransferRoutes.md)<br>
**Mounted inventory entry:** 170 of 629<br>
**Route declaration pipeline:** `protect`, `createEnhancedTransferBooking`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/bookings", protect, createEnhancedTransferBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `passengers`, `luggage`, `pickupDateTime`, `flightArrivalDateTime`, `flightDepartureDateTime`, `childSeats`, `boosterSeats`, `taxes`, `fees`, `linkedBooking`, `pickupLocation`, `dropoffLocation`, `flightNumber`, `airline`, `terminal`, `meetAndGreet`, `signboardName`, `passengerName`, `whatsappContact`, `passengerPhone`, `wheelchairAccessible`, `accommodationName`, `passengerEmail`, `specialRequests`, `source`, `notes`, `transferId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`, `invoice`, `paymentRequired`.

**Source-traced contract:** See [Airport transfer API contracts](../API_DOMAIN_CONTRACTS/airport-transfers.md) for shared route-specific behavior.

## endpoint-171 — GET /api/airport-transfers/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [airportTransferRoutes.js](../../server/routes/airportTransferRoutes.js) · [route module explanation](../code-explanations/backend/routes/airportTransferRoutes.md)<br>
**Mounted inventory entry:** 171 of 629<br>
**Route declaration pipeline:** `protect`, `listTransferBookingsSafe`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/bookings", protect, listTransferBookingsSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Airport transfer API contracts](../API_DOMAIN_CONTRACTS/airport-transfers.md) for shared route-specific behavior.

## endpoint-172 — PATCH /api/airport-transfers/bookings/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [airportTransferRoutes.js](../../server/routes/airportTransferRoutes.js) · [route module explanation](../code-explanations/backend/routes/airportTransferRoutes.md)<br>
**Mounted inventory entry:** 172 of 629<br>
**Route declaration pipeline:** `protect`, `paymentMutationGuard`, `updateTransferBooking`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/bookings/:id", protect, paymentMutationGuard, updateTransferBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`, `assignedVehicle`, `assignedDriver`, `specialRequests`, `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `403`, `409`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Airport transfer API contracts](../API_DOMAIN_CONTRACTS/airport-transfers.md) for shared route-specific behavior.

## endpoint-173 — GET /api/airport-transfers/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [airportTransferRoutes.js](../../server/routes/airportTransferRoutes.js) · [route module explanation](../code-explanations/backend/routes/airportTransferRoutes.md)<br>
**Mounted inventory entry:** 173 of 629<br>
**Route declaration pipeline:** `getTransfer`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/:id", getTransfer)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Airport transfer API contracts](../API_DOMAIN_CONTRACTS/airport-transfers.md) for shared route-specific behavior.


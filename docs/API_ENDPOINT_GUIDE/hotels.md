# API endpoints: hotels

This guide contains 12 mounted method/path inventory entries in the **hotels** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-289 — GET /api/hotels

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 289 of 629<br>
**Route declaration pipeline:** `listHotels`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/", listHotels)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `city`, `featured`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-290 — GET /api/hotels/availability

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 290 of 629<br>
**Route declaration pipeline:** `checkHotelAvailability`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/availability", checkHotelAvailability)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `hotelId`, `checkIn`, `checkOut`, `ratePlanId`.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-291 — GET /api/hotels/admin/catalog

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 291 of 629<br>
**Route declaration pipeline:** `protect`, `managerOnly`, `listAdminHotelsSafe`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.get("/admin/catalog", protect, managerOnly, listAdminHotelsSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-292 — POST /api/hotels/admin/catalog

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 292 of 629<br>
**Route declaration pipeline:** `protect`, `managerOnly`, `createAdminHotel`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.post("/admin/catalog", protect, managerOnly, createAdminHotel)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`, `409`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-293 — PATCH /api/hotels/admin/catalog/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 293 of 629<br>
**Route declaration pipeline:** `protect`, `managerOnly`, `updateHotel`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.patch("/admin/catalog/:id", protect, managerOnly, updateHotel)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-294 — POST /api/hotels/admin/catalog/:hotelId/rooms

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 294 of 629<br>
**Route declaration pipeline:** `protect`, `managerOnly`, `createRoomType`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.post("/admin/catalog/:hotelId/rooms", protect, managerOnly, createRoomType)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `hotelId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`, `409`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-295 — PATCH /api/hotels/admin/rooms/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 295 of 629<br>
**Route declaration pipeline:** `protect`, `managerOnly`, `updateRoomType`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.patch("/admin/rooms/:id", protect, managerOnly, updateRoomType)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-296 — POST /api/hotels/admin/sync-inventory

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 296 of 629<br>
**Route declaration pipeline:** `protect`, `managerOnly`, `syncAccommodationInventoryToHotelPms`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.post("/admin/sync-inventory", protect, managerOnly, syncAccommodationInventoryToHotelPms)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-297 — POST /api/hotels/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 297 of 629<br>
**Route declaration pipeline:** `protect`, `createConcurrentSafeHotelBooking`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/bookings", protect, createConcurrentSafeHotelBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `checkIn`, `checkOut`, `rooms`, `adults`, `children`, `ratePlanId`, `taxes`, `fees`, `linkedBooking`, `estimatedArrivalTime`, `guests`, `mealPlan`, `bedPreference`, `dietaryRequirements`, `accessibilityNeeds`, `airportTransferRequired`, `specialRequests`, `source`, `hotelId`, `roomTypeId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`, `invoice`, `paymentRequired`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-298 — GET /api/hotels/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 298 of 629<br>
**Route declaration pipeline:** `protect`, `listHotelBookingsSafe`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/bookings", protect, listHotelBookingsSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`, `customerId`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-299 — PATCH /api/hotels/bookings/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 299 of 629<br>
**Route declaration pipeline:** `protect`, `paymentMutationGuard`, `updateHotelBooking`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/bookings/:id", protect, paymentMutationGuard, updateHotelBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`, `specialRequests`, `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `403`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
## endpoint-300 — GET /api/hotels/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [hotelRoutes.js](../../server/routes/hotelRoutes.js) · [route module explanation](../code-explanations/backend/routes/hotelRoutes.md)<br>
**Mounted inventory entry:** 300 of 629<br>
**Route declaration pipeline:** `getHotel`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/:id", getHotel)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [hotel operations contracts](../API_DOMAIN_CONTRACTS/hotel-operations.md) for validation, inventory and authorization details.
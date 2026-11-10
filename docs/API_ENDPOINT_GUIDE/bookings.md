# API endpoints: bookings

This guide contains 11 mounted method/path inventory entries in the **bookings** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-187 — GET /api/bookings/test

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 187 of 629<br>
**Route declaration pipeline:** inline callback
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/test", (req, res) => res.status(200).json({ success: true, message: "Booking routes are loaded" }))
```

**Source-traced contract:** See [Booking route probe](../API_DOMAIN_CONTRACTS/booking-route-probe.md).

## endpoint-188 — POST /api/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 188 of 629<br>
**Route declaration pipeline:** `customerOnly`, `validateBookingTravelDate`, `createCustomerBooking`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** customerOnly`

**Source declaration:**

```js
router.post("/", customerOnly, validateBookingTravelDate, createCustomerBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `tour`, `travelDate`, `travelers`, `numberOfGuests`, `contact`, `paymentMethod`, `pickupLocation`, `pickupTime`, `hotelName`, `roomNumber`, `emergencyContact`, `specialRequests`, `bookingType`, `groupReference`, `corporateAccount`, `corporateCompanyName`, `corporatePin`, `purchaseOrderNumber`, `paymentTerms`, `billingContact`, `roomingListReference`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-189 — GET /api/bookings/my-bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 189 of 629<br>
**Route declaration pipeline:** `customerOnly`, `getCustomerBookings`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** customerOnly`

**Source declaration:**

```js
router.get("/my-bookings", customerOnly, getCustomerBookings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Customer booking management routes](../API_DOMAIN_CONTRACTS/customer-booking-management.md) for fields, ownership and side effects.

## endpoint-190 — PUT /api/bookings/cancel/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 190 of 629<br>
**Route declaration pipeline:** `customerOnly`, `cancelBooking`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** customerOnly`

**Source declaration:**

```js
router.put("/cancel/:id", customerOnly, cancelBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Customer booking management routes](../API_DOMAIN_CONTRACTS/customer-booking-management.md) for fields, ownership and side effects.

## endpoint-191 — PUT /api/bookings/reschedule/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 191 of 629<br>
**Route declaration pipeline:** `customerOnly`, `rescheduleBooking`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** customerOnly`

**Source declaration:**

```js
router.put("/reschedule/:id", customerOnly, rescheduleBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `newTravelDate`, `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Customer booking management routes](../API_DOMAIN_CONTRACTS/customer-booking-management.md) for fields, ownership and side effects.

## endpoint-192 — PUT /api/bookings/:id/travel-date

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 192 of 629<br>
**Route declaration pipeline:** `customerOnly`, `updateBookingTravelDate`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** customerOnly`

**Source declaration:**

```js
router.put("/:id/travel-date", customerOnly, updateBookingTravelDate)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `travelDate`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Customer booking management routes](../API_DOMAIN_CONTRACTS/customer-booking-management.md) for fields, ownership and side effects.

## endpoint-193 — GET /api/bookings/confirmed

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 193 of 629<br>
**Route declaration pipeline:** `managerOnly`, `getConfirmedBookings`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.get("/confirmed", managerOnly, getConfirmedBookings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `page`, `pages`, `count`, `data`.

**Source-traced contract:** See [Booking operations read/status contracts](../API_DOMAIN_CONTRACTS/booking-operations-read.md).

## endpoint-194 — GET /api/bookings/admin

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 194 of 629<br>
**Route declaration pipeline:** `managerOnly`, `getAllBookings`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.get("/admin", managerOnly, getAllBookings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`, `status`, `paymentStatus`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Booking operations read/status contracts](../API_DOMAIN_CONTRACTS/booking-operations-read.md).

## endpoint-195 — GET /api/bookings/admin/all

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 195 of 629<br>
**Route declaration pipeline:** `adminOnly`, `getAllBookings`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** adminOnly`

**Source declaration:**

```js
router.get("/admin/all", adminOnly, getAllBookings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`, `status`, `paymentStatus`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Booking operations read/status contracts](../API_DOMAIN_CONTRACTS/booking-operations-read.md).

## endpoint-196 — PUT /api/bookings/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 196 of 629<br>
**Route declaration pipeline:** `adminOnly`, `requireFullPaymentForTrip`, `updateBookingStatus`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** adminOnly`

**Source declaration:**

```js
router.put("/:id/status", adminOnly, requireFullPaymentForTrip, updateBookingStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`, `allowedStatuses`, `code`.

**Source-traced contract:** See [Booking operations read/status contracts](../API_DOMAIN_CONTRACTS/booking-operations-read.md).

## endpoint-197 — GET /api/bookings/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [bookingRoutes.js](../../server/routes/bookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/bookingRoutes.md)<br>
**Mounted inventory entry:** 197 of 629<br>
**Route declaration pipeline:** `getBookingByIdOptimized`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/:id", getBookingByIdOptimized)
```

**Source-traced contract:** See [Booking operations read/status contracts](../API_DOMAIN_CONTRACTS/booking-operations-read.md).


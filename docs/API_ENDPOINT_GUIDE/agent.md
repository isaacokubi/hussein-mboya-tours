# API endpoints: agent

This guide contains 28 mounted method/path inventory entries in the **agent** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-112 — GET /api/agent/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 112 of 629<br>
**Route declaration pipeline:** `getAgentBookings`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", getAgentBookings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `paymentStatus`, `search`.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `pages`, `count`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md); route prefix aliases share the controller while differing by `/agents` versus `/agent`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md).

## endpoint-114 — GET /api/agent/bookings/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 114 of 629<br>
**Route declaration pipeline:** `getAgentBooking`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/:id", getAgentBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md); route prefix aliases share the controller while differing by `/agents` versus `/agent`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md).

## endpoint-116 — POST /api/agent/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 116 of 629<br>
**Route declaration pipeline:** `createBooking`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/", createBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `customer`, `tour`, `travelDate`, `travelers`, `pickupLocation`, `pickupTime`, `hotelName`, `roomNumber`, `emergencyContact`, `specialRequests`, `paymentMethod`, `customerNotes`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `403`, `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `booking`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md); route prefix aliases share the controller while differing by `/agents` versus `/agent`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md).

## endpoint-118 — PATCH /api/agent/bookings/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 118 of 629<br>
**Route declaration pipeline:** `updateBookingStatus`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/:id/status", updateBookingStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`, `code`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md); route prefix aliases share the controller while differing by `/agents` versus `/agent`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md).

## endpoint-120 — PATCH /api/agent/bookings/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 120 of 629<br>
**Route declaration pipeline:** `cancelAgentBooking`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/:id/cancel", cancelAgentBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md); route prefix aliases share the controller while differing by `/agents` versus `/agent`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md).

## endpoint-122 — DELETE /api/agent/bookings/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 122 of 629<br>
**Route declaration pipeline:** `cancelAgentBooking`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.delete("/:id", cancelAgentBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md); route prefix aliases share the controller while differing by `/agents` versus `/agent`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md).

## endpoint-124 — GET /api/agent/customers

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 124 of 629<br>
**Route declaration pipeline:** `getCustomers`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", getCustomers)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `search`.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `pages`, `count`.

**Source-traced contract:** See [Agent customer API contracts](../API_DOMAIN_CONTRACTS/agent-customers.md); the plural and singular mounts are aliases of the same handler.

## endpoint-126 — GET /api/agent/customers/stats

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 126 of 629<br>
**Route declaration pipeline:** `getCustomerStats`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/stats", getCustomerStats)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent customer API contracts](../API_DOMAIN_CONTRACTS/agent-customers.md); the plural and singular mounts are aliases of the same handler.

## endpoint-128 — GET /api/agent/customers/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 128 of 629<br>
**Route declaration pipeline:** `getCustomer`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/:id", getCustomer)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent customer API contracts](../API_DOMAIN_CONTRACTS/agent-customers.md); the plural and singular mounts are aliases of the same handler.

## endpoint-130 — POST /api/agent/customers

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 130 of 629<br>
**Route declaration pipeline:** `createCustomer`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/", createCustomer)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent customer API contracts](../API_DOMAIN_CONTRACTS/agent-customers.md); the plural and singular mounts are aliases of the same handler.

## endpoint-132 — PUT /api/agent/customers/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 132 of 629<br>
**Route declaration pipeline:** `updateCustomer`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put("/:id", updateCustomer)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent customer API contracts](../API_DOMAIN_CONTRACTS/agent-customers.md); the plural and singular mounts are aliases of the same handler.

## endpoint-134 — DELETE /api/agent/customers/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 134 of 629<br>
**Route declaration pipeline:** `deleteCustomer`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.delete("/:id", deleteCustomer)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent customer API contracts](../API_DOMAIN_CONTRACTS/agent-customers.md); the plural and singular mounts are aliases of the same handler.

## endpoint-136 — GET /api/agent/packages

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentPackageRoutes.js](../../server/routes/agentPackageRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentPackageRoutes.md)<br>
**Mounted inventory entry:** 136 of 629<br>
**Route declaration pipeline:** `getAgentPackages`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", getAgentPackages)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `search`, `category`, `destination`, `featured`, `page`, `limit`, `sort`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Agent tour package API contracts](../API_DOMAIN_CONTRACTS/agent-packages.md); this repeated route inventory row resolves to the same effective mounted contract.

## endpoint-138 — GET /api/agent/packages/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentPackageRoutes.js](../../server/routes/agentPackageRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentPackageRoutes.md)<br>
**Mounted inventory entry:** 138 of 629<br>
**Route declaration pipeline:** `getPackageDetails`
**Router-wide middleware:** resolveTenant; protect; agentMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/:id", getPackageDetails)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `package`.

**Source-traced contract:** See [Agent tour package API contracts](../API_DOMAIN_CONTRACTS/agent-packages.md); this repeated route inventory row resolves to the same effective mounted contract.

## endpoint-140 — GET /api/agent/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 140 of 629<br>
**Route declaration pipeline:** `getAgentDashboard`
**Router-wide middleware:** protect; resolveTenant; agentMiddleware; requireApprovedAgent
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/dashboard", getAgentDashboard)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Agent dashboard API contract](../API_DOMAIN_CONTRACTS/agent-dashboard.md); the singular mount is an alias.

## endpoint-142 — GET /api/agent/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 142 of 629<br>
**Route declaration pipeline:** `getAgentBookings`
**Router-wide middleware:** protect; resolveTenant; agentMiddleware; requireApprovedAgent
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/bookings", getAgentBookings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent booking API contracts](../API_DOMAIN_CONTRACTS/agent-bookings.md); this repeated route inventory row resolves to the same effective mounted contract.

## endpoint-144 — GET /api/agent/customers

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 144 of 629<br>
**Route declaration pipeline:** `getAgentCustomers`
**Router-wide middleware:** protect; resolveTenant; agentMiddleware; requireApprovedAgent
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/customers", getAgentCustomers)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Agent customer API contracts](../API_DOMAIN_CONTRACTS/agent-customers.md); this repeated route inventory row resolves to the same effective mounted contract.

## endpoint-146 — GET /api/agent/quotes

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 146 of 629<br>
**Route declaration pipeline:** `getAgentQuotations`
**Router-wide middleware:** protect; resolveTenant; agentMiddleware; requireApprovedAgent
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/quotes", getAgentQuotations)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`.

**Source-traced contract:** See [Agent quotation API contracts](../API_DOMAIN_CONTRACTS/agent-quotations.md); the routes share controllers across plural/singular aliases with mount-order differences documented there.

## endpoint-148 — GET /api/agent/commission

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 148 of 629<br>
**Route declaration pipeline:** `getMyAgentCommission`
**Router-wide middleware:** protect; resolveTenant; agentMiddleware; requireApprovedAgent
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/commission", getMyAgentCommission)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `commissionRate`, `data`.

**Source-traced contract:** See [Agent commission listing API contract](../API_DOMAIN_CONTRACTS/agent-commission.md); aliases share the same agent router.

## endpoint-150 — GET /api/agent/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 150 of 629<br>
**Route declaration pipeline:** `authorize`, `getAgentTours`
**Router-wide middleware:** protect; resolveTenant; agentMiddleware; requireApprovedAgent
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/tours", authorize("view_agent_tours"), getAgentTours)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: `401`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`.

**Source-traced contract:** See [Agent-created tour API contracts](../API_DOMAIN_CONTRACTS/agent-tours.md); plural/singular routes share handlers.

## endpoint-152 — GET /api/agent/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 152 of 629<br>
**Route declaration pipeline:** `authorize`, `getAgentTour`
**Router-wide middleware:** protect; resolveTenant; agentMiddleware; requireApprovedAgent
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/tours/:id", authorize("view_agent_tours"), getAgentTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent-created tour API contracts](../API_DOMAIN_CONTRACTS/agent-tours.md); plural/singular routes share handlers.

## endpoint-154 — POST /api/agent/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 154 of 629<br>
**Route declaration pipeline:** `authorize`, `createAgentTour`
**Router-wide middleware:** protect; resolveTenant; agentMiddleware; requireApprovedAgent
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/tours", authorize("create_agent_tour"), upload.array("images", 10), createAgentTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `title`, `destination`, `price`, `agentPrice`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `401`, `404`, `403`, `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent-created tour API contracts](../API_DOMAIN_CONTRACTS/agent-tours.md); plural/singular routes share handlers.

## endpoint-156 — PUT /api/agent/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 156 of 629<br>
**Route declaration pipeline:** `authorize`, `updateAgentTour`
**Router-wide middleware:** protect; resolveTenant; agentMiddleware; requireApprovedAgent
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.put("/tours/:id", authorize("edit_agent_tour"), upload.array("images", 10), updateAgentTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `title`, `price`, `agentPrice`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent-created tour API contracts](../API_DOMAIN_CONTRACTS/agent-tours.md); plural/singular routes share handlers.

## endpoint-158 — DELETE /api/agent/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 158 of 629<br>
**Route declaration pipeline:** `authorize`, `deleteAgentTour`
**Router-wide middleware:** protect; resolveTenant; agentMiddleware; requireApprovedAgent
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.delete("/tours/:id", authorize("delete_agent_tour"), deleteAgentTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent-created tour API contracts](../API_DOMAIN_CONTRACTS/agent-tours.md); plural/singular routes share handlers.

## endpoint-368 — POST /api/agent/quotes

**Contract status:** SOURCE-TRACED<br>
**Router:** [quotationRoutes.js](../../server/routes/quotationRoutes.js) · [route module explanation](../code-explanations/backend/routes/quotationRoutes.md)<br>
**Mounted inventory entry:** 368 of 629<br>
**Route declaration pipeline:** `createQuotation`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post(
  "/",
  createQuotation
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `customer`, `tourPackage`, `items`, `discount`, `taxRate`, `notes`, `validUntil`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `quotation`.

**Source-traced contract:** See [Agent quotation API contracts](../API_DOMAIN_CONTRACTS/agent-quotations.md); the routes share controllers across plural/singular aliases with mount-order differences documented there.

## endpoint-370 — GET /api/agent/quotes

**Contract status:** SOURCE-TRACED<br>
**Router:** [quotationRoutes.js](../../server/routes/quotationRoutes.js) · [route module explanation](../code-explanations/backend/routes/quotationRoutes.md)<br>
**Mounted inventory entry:** 370 of 629<br>
**Route declaration pipeline:** `getAgentQuotations`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get(
  "/",
  getAgentQuotations
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`.

**Source-traced contract:** See [Agent quotation API contracts](../API_DOMAIN_CONTRACTS/agent-quotations.md); the routes share controllers across plural/singular aliases with mount-order differences documented there.

## endpoint-372 — GET /api/agent/quotes/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [quotationRoutes.js](../../server/routes/quotationRoutes.js) · [route module explanation](../code-explanations/backend/routes/quotationRoutes.md)<br>
**Mounted inventory entry:** 372 of 629<br>
**Route declaration pipeline:** `getQuotationById`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get(
  "/:id",
  getQuotationById
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent quotation API contracts](../API_DOMAIN_CONTRACTS/agent-quotations.md); the routes share controllers across plural/singular aliases with mount-order differences documented there.

## endpoint-374 — PATCH /api/agent/quotes/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [quotationRoutes.js](../../server/routes/quotationRoutes.js) · [route module explanation](../code-explanations/backend/routes/quotationRoutes.md)<br>
**Mounted inventory entry:** 374 of 629<br>
**Route declaration pipeline:** `updateQuotationStatus`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch(
  "/:id/status",
  updateQuotationStatus
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Agent quotation API contracts](../API_DOMAIN_CONTRACTS/agent-quotations.md); the routes share controllers across plural/singular aliases with mount-order differences documented there.


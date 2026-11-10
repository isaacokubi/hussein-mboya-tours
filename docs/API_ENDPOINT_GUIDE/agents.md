# API endpoints: agents

This guide contains 28 mounted method/path inventory entries in the **agents** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-111 — GET /api/agents/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 111 of 629<br>
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

## endpoint-113 — GET /api/agents/bookings/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 113 of 629<br>
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

## endpoint-115 — POST /api/agents/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 115 of 629<br>
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

## endpoint-117 — PATCH /api/agents/bookings/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 117 of 629<br>
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

## endpoint-119 — PATCH /api/agents/bookings/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 119 of 629<br>
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

## endpoint-121 — DELETE /api/agents/bookings/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentBookingRoutes.js](../../server/routes/agentBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentBookingRoutes.md)<br>
**Mounted inventory entry:** 121 of 629<br>
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

## endpoint-123 — GET /api/agents/customers

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 123 of 629<br>
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

## endpoint-125 — GET /api/agents/customers/stats

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 125 of 629<br>
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

## endpoint-127 — GET /api/agents/customers/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 127 of 629<br>
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

## endpoint-129 — POST /api/agents/customers

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 129 of 629<br>
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

## endpoint-131 — PUT /api/agents/customers/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 131 of 629<br>
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

## endpoint-133 — DELETE /api/agents/customers/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentCustomerRoutes.js](../../server/routes/agentCustomerRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentCustomerRoutes.md)<br>
**Mounted inventory entry:** 133 of 629<br>
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

## endpoint-135 — GET /api/agents/packages

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentPackageRoutes.js](../../server/routes/agentPackageRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentPackageRoutes.md)<br>
**Mounted inventory entry:** 135 of 629<br>
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

## endpoint-137 — GET /api/agents/packages/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentPackageRoutes.js](../../server/routes/agentPackageRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentPackageRoutes.md)<br>
**Mounted inventory entry:** 137 of 629<br>
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

## endpoint-139 — GET /api/agents/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 139 of 629<br>
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

**Source-traced contract:** See [Agent dashboard API contract](../API_DOMAIN_CONTRACTS/agent-dashboard.md); the plural mount is an alias.

## endpoint-141 — GET /api/agents/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 141 of 629<br>
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

## endpoint-143 — GET /api/agents/customers

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 143 of 629<br>
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

## endpoint-145 — GET /api/agents/quotes

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 145 of 629<br>
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

## endpoint-147 — GET /api/agents/commission

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 147 of 629<br>
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

## endpoint-149 — GET /api/agents/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 149 of 629<br>
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

## endpoint-151 — GET /api/agents/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 151 of 629<br>
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

## endpoint-153 — POST /api/agents/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 153 of 629<br>
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

## endpoint-155 — PUT /api/agents/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 155 of 629<br>
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

## endpoint-157 — DELETE /api/agents/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [agentRoutes.js](../../server/routes/agentRoutes.js) · [route module explanation](../code-explanations/backend/routes/agentRoutes.md)<br>
**Mounted inventory entry:** 157 of 629<br>
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

## endpoint-367 — POST /api/agents/quotes

**Contract status:** SOURCE-TRACED<br>
**Router:** [quotationRoutes.js](../../server/routes/quotationRoutes.js) · [route module explanation](../code-explanations/backend/routes/quotationRoutes.md)<br>
**Mounted inventory entry:** 367 of 629<br>
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

## endpoint-369 — GET /api/agents/quotes

**Contract status:** SOURCE-TRACED<br>
**Router:** [quotationRoutes.js](../../server/routes/quotationRoutes.js) · [route module explanation](../code-explanations/backend/routes/quotationRoutes.md)<br>
**Mounted inventory entry:** 369 of 629<br>
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

## endpoint-371 — GET /api/agents/quotes/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [quotationRoutes.js](../../server/routes/quotationRoutes.js) · [route module explanation](../code-explanations/backend/routes/quotationRoutes.md)<br>
**Mounted inventory entry:** 371 of 629<br>
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

## endpoint-373 — PATCH /api/agents/quotes/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [quotationRoutes.js](../../server/routes/quotationRoutes.js) · [route module explanation](../code-explanations/backend/routes/quotationRoutes.md)<br>
**Mounted inventory entry:** 373 of 629<br>
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


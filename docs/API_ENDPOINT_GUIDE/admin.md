# API endpoints: admin

This guide contains 159 mounted method/path inventory entries in the **admin** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-20 — GET /api/admin/agents

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAgentRoutes.js](../../server/routes/adminAgentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAgentRoutes.md)<br>
**Mounted inventory entry:** 20 of 629<br>
**Route declaration pipeline:** `getAgents`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", getAgents)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`, `code`, `message`.

**Source-traced contract:** See [Admin agent API contracts](../API_DOMAIN_CONTRACTS/admin-agents.md), section `GET /api/admin/agents`. The handler, tenant filters, model effects, response envelope and failure branches were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-21 — GET /api/admin/agents/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAgentRoutes.js](../../server/routes/adminAgentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAgentRoutes.md)<br>
**Mounted inventory entry:** 21 of 629<br>
**Route declaration pipeline:** `getAgentById`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/:id", getAgentById)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin agent API contracts](../API_DOMAIN_CONTRACTS/admin-agents.md), section `GET /api/admin/agents/:id`. The handler, tenant filters, model effects, response envelope and failure branches were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-22 — PUT /api/admin/agents/:id/approve

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAgentRoutes.js](../../server/routes/adminAgentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAgentRoutes.md)<br>
**Mounted inventory entry:** 22 of 629<br>
**Route declaration pipeline:** `approveAgent`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put("/:id/approve", approveAgent)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `422`.
- JSON envelope keys observed: `success`, `code`, `message`, `data`.

**Source-traced contract:** See [Admin agent API contracts](../API_DOMAIN_CONTRACTS/admin-agents.md), section `PUT /api/admin/agents/:id/approve`. The handler, tenant filters, model effects, response envelope and failure branches were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-23 — PUT /api/admin/agents/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAgentRoutes.js](../../server/routes/adminAgentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAgentRoutes.md)<br>
**Mounted inventory entry:** 23 of 629<br>
**Route declaration pipeline:** `updateAgentStatus`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put("/:id/status", updateAgentStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `422`.
- JSON envelope keys observed: `success`, `message`, `code`, `data`.

**Source-traced contract:** See [Admin agent API contracts](../API_DOMAIN_CONTRACTS/admin-agents.md), section `PUT /api/admin/agents/:id/status`. The handler, tenant filters, model effects, response envelope and failure branches were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-24 — POST /api/admin/auth/login

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAuthRoutes.js](../../server/routes/adminAuthRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAuthRoutes.md)<br>
**Mounted inventory entry:** 24 of 629<br>
**Route declaration pipeline:** `loginRateLimiter`, `adminLogin`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post(
  "/login",
  loginRateLimiter,
  adminLogin
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `email`, `password`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `401`, `403`, `200`, `500`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin login contract](../API_DOMAIN_CONTRACTS/admin-auth.md). The tenant resolution, rate limit, account lookup, role gate, token claims and response/error branches were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-25 — GET /api/admin/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminBookingRoutes.js](../../server/routes/adminBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminBookingRoutes.md)<br>
**Mounted inventory entry:** 25 of 629<br>
**Route declaration pipeline:** `getBookings`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("booking.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("booking.manage"

**Source declaration:**

```js
router.get("/", getBookings)
```

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-26 — GET /api/admin/bookings/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminBookingRoutes.js](../../server/routes/adminBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminBookingRoutes.md)<br>
**Mounted inventory entry:** 26 of 629<br>
**Route declaration pipeline:** `getBooking`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("booking.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("booking.manage"

**Source declaration:**

```js
router.get("/:id", getBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`, `booking`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-27 — PUT /api/admin/bookings/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminBookingRoutes.js](../../server/routes/adminBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminBookingRoutes.md)<br>
**Mounted inventory entry:** 27 of 629<br>
**Route declaration pipeline:** `updateBookingStatus`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("booking.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("booking.manage"

**Source declaration:**

```js
router.put("/:id/status", updateBookingStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`, `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `allowedStatuses`, `paymentStatus`, `data`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-28 — PUT /api/admin/bookings/:id/assign

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminBookingRoutes.js](../../server/routes/adminBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminBookingRoutes.md)<br>
**Mounted inventory entry:** 28 of 629<br>
**Route declaration pipeline:** `guardBookingResources`, `assignResources`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("booking.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("booking.manage"

**Source declaration:**

```js
router.put("/:id/assign", guardBookingResources, assignResources)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guide`, `driver`, `vehicle`, `agent`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `paymentStatus`, `data`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-29 — PUT /api/admin/bookings/:id/payment

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminBookingRoutes.js](../../server/routes/adminBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminBookingRoutes.md)<br>
**Mounted inventory entry:** 29 of 629<br>
**Route declaration pipeline:** `updatePaymentStatus`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("booking.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("booking.manage"

**Source declaration:**

```js
router.put("/:id/payment", updatePaymentStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `410`.
- JSON envelope keys observed: `success`, `code`, `message`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-30 — GET /api/admin/bookings/:id/timeline

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminBookingRoutes.js](../../server/routes/adminBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminBookingRoutes.md)<br>
**Mounted inventory entry:** 30 of 629<br>
**Route declaration pipeline:** `getBookingTimeline`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("booking.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("booking.manage"

**Source declaration:**

```js
router.get("/:id/timeline", getBookingTimeline)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-31 — GET /api/admin/bookings/:id/invoice

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminBookingRoutes.js](../../server/routes/adminBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminBookingRoutes.md)<br>
**Mounted inventory entry:** 31 of 629<br>
**Route declaration pipeline:** `downloadBookingInvoice`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("booking.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("booking.manage"

**Source declaration:**

```js
router.get("/:id/invoice", downloadBookingInvoice)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-32 — POST /api/admin/bookings/:id/notify

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminBookingRoutes.js](../../server/routes/adminBookingRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminBookingRoutes.md)<br>
**Mounted inventory entry:** 32 of 629<br>
**Route declaration pipeline:** `sendBookingNotification`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("booking.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("booking.manage"

**Source declaration:**

```js
router.post("/:id/notify", sendBookingNotification)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `message`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `channel`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-33 — GET /api/admin/experiences

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminCategoryRoutes.js](../../server/routes/adminCategoryRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminCategoryRoutes.md)<br>
**Mounted inventory entry:** 33 of 629<br>
**Route declaration pipeline:** `getAdminCategories`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", getAdminCategories)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.

**Source-traced contract:** See [Admin experience/category contracts](../API_DOMAIN_CONTRACTS/admin-experiences.md), section GET /api/admin/experiences. Controller, tenant model and content-manager middleware behavior were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-34 — POST /api/admin/experiences

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminCategoryRoutes.js](../../server/routes/adminCategoryRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminCategoryRoutes.md)<br>
**Mounted inventory entry:** 34 of 629<br>
**Route declaration pipeline:** `createCategory`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/", createCategory)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `slug`, `icon`, `description`, `image`, `active`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`, `409`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin experience/category contracts](../API_DOMAIN_CONTRACTS/admin-experiences.md), section POST /api/admin/experiences. Controller, tenant model and content-manager middleware behavior were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-35 — PUT /api/admin/experiences/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminCategoryRoutes.js](../../server/routes/adminCategoryRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminCategoryRoutes.md)<br>
**Mounted inventory entry:** 35 of 629<br>
**Route declaration pipeline:** `updateCategory`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put("/:id", updateCategory)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `slug`, `icon`, `description`, `image`, `active`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin experience/category contracts](../API_DOMAIN_CONTRACTS/admin-experiences.md), section PUT /api/admin/experiences/:id. Controller, tenant model and content-manager middleware behavior were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-36 — DELETE /api/admin/experiences/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminCategoryRoutes.js](../../server/routes/adminCategoryRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminCategoryRoutes.md)<br>
**Mounted inventory entry:** 36 of 629<br>
**Route declaration pipeline:** `deleteCategory`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.delete("/:id", deleteCategory)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin experience/category contracts](../API_DOMAIN_CONTRACTS/admin-experiences.md), section DELETE /api/admin/experiences/:id. Controller, tenant model and content-manager middleware behavior were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-37 — GET /api/admin/coupons

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminCouponRoutes.js](../../server/routes/adminCouponRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminCouponRoutes.md)<br>
**Mounted inventory entry:** 37 of 629<br>
**Route declaration pipeline:** `getAdminCoupons`
**Router-wide middleware:** resolveTenant; protect, adminMiddleware; authorize("coupon.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("coupon.manage"

**Source declaration:**

```js
router.get("/", getAdminCoupons)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`, `coupons`.

**Source-traced contract:** See [Admin coupon contracts](../API_DOMAIN_CONTRACTS/admin-coupons.md), section GET /api/admin/coupons. Route permission, request normalization, tenant model constraints and CRUD effects were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-38 — POST /api/admin/coupons

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminCouponRoutes.js](../../server/routes/adminCouponRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminCouponRoutes.md)<br>
**Mounted inventory entry:** 38 of 629<br>
**Route declaration pipeline:** `createAdminCoupon`
**Router-wide middleware:** resolveTenant; protect, adminMiddleware; authorize("coupon.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("coupon.manage"

**Source declaration:**

```js
router.post("/", createAdminCoupon)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`, `409`.
- JSON envelope keys observed: `success`, `message`, `coupon`.

**Source-traced contract:** See [Admin coupon contracts](../API_DOMAIN_CONTRACTS/admin-coupons.md), section POST /api/admin/coupons. Route permission, request normalization, tenant model constraints and CRUD effects were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-39 — PUT /api/admin/coupons/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminCouponRoutes.js](../../server/routes/adminCouponRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminCouponRoutes.md)<br>
**Mounted inventory entry:** 39 of 629<br>
**Route declaration pipeline:** `updateAdminCoupon`
**Router-wide middleware:** resolveTenant; protect, adminMiddleware; authorize("coupon.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("coupon.manage"

**Source declaration:**

```js
router.put("/:id", updateAdminCoupon)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `coupon`.

**Source-traced contract:** See [Admin coupon contracts](../API_DOMAIN_CONTRACTS/admin-coupons.md), section PUT /api/admin/coupons/:id. Route permission, request normalization, tenant model constraints and CRUD effects were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-40 — DELETE /api/admin/coupons/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminCouponRoutes.js](../../server/routes/adminCouponRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminCouponRoutes.md)<br>
**Mounted inventory entry:** 40 of 629<br>
**Route declaration pipeline:** `deleteAdminCoupon`
**Router-wide middleware:** resolveTenant; protect, adminMiddleware; authorize("coupon.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("coupon.manage"

**Source declaration:**

```js
router.delete("/:id", deleteAdminCoupon)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin coupon contracts](../API_DOMAIN_CONTRACTS/admin-coupons.md), section DELETE /api/admin/coupons/:id. Route permission, request normalization, tenant model constraints and CRUD effects were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-41 — GET /api/admin/dashboard/metrics

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminDashboardRoutes.js](../../server/routes/adminDashboardRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminDashboardRoutes.md)<br>
**Mounted inventory entry:** 41 of 629<br>
**Route declaration pipeline:** `protect`, `adminOnly`, `authorize`, `getDashboardMetrics`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** adminOnly`; authorize`

**Source declaration:**

```js
router.get("/metrics", protect, adminOnly, authorize("admin.dashboard"), getDashboardMetrics)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Canonical admin dashboard metrics](../API_DOMAIN_CONTRACTS/admin-dashboard.md), including the shared alias behavior, permission gate, tenant filters, aggregate outputs and financial metric sources.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-42 — GET /api/admin/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminDashboardRoutes.js](../../server/routes/adminDashboardRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminDashboardRoutes.md)<br>
**Mounted inventory entry:** 42 of 629<br>
**Route declaration pipeline:** `protect`, `adminOnly`, `authorize`, `getDashboardMetrics`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** adminOnly`; authorize`

**Source declaration:**

```js
router.get("/", protect, adminOnly, authorize("admin.dashboard"), getDashboardMetrics)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Canonical admin dashboard metrics](../API_DOMAIN_CONTRACTS/admin-dashboard.md), including the shared alias behavior, permission gate, tenant filters, aggregate outputs and financial metric sources.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-43 — GET /api/admin/destinations

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminDestinationRoutes.js](../../server/routes/adminDestinationRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminDestinationRoutes.md)<br>
**Mounted inventory entry:** 43 of 629<br>
**Route declaration pipeline:** `getAdminDestinations`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("manage_destinations")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("manage_destinations"

**Source declaration:**

```js
router.get(
  "/",
  getAdminDestinations
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`.

**Source-traced contract:** See [Admin destination contracts](../API_DOMAIN_CONTRACTS/admin-destinations.md), section GET /api/admin/destinations. Route permission, tenant filters, upload middleware and controller/provider effects were traced directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-44 — GET /api/admin/destinations/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminDestinationRoutes.js](../../server/routes/adminDestinationRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminDestinationRoutes.md)<br>
**Mounted inventory entry:** 44 of 629<br>
**Route declaration pipeline:** `getDestinationById`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("manage_destinations")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("manage_destinations"

**Source declaration:**

```js
router.get(
  "/:id",
  getDestinationById
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `code`, `data`.

**Source-traced contract:** See [Admin destination contracts](../API_DOMAIN_CONTRACTS/admin-destinations.md), section GET /api/admin/destinations/:id. Route permission, tenant filters, upload middleware and controller/provider effects were traced directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-45 — POST /api/admin/destinations

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminDestinationRoutes.js](../../server/routes/adminDestinationRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminDestinationRoutes.md)<br>
**Mounted inventory entry:** 45 of 629<br>
**Route declaration pipeline:** `createDestination`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("manage_destinations")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("manage_destinations"

**Source declaration:**

```js
router.post(
  "/",
  upload.array("images", 10),
  createDestination
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `slug`, `description`, `country`, `city`, `featured`, `seo`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin destination contracts](../API_DOMAIN_CONTRACTS/admin-destinations.md), section POST /api/admin/destinations. Route permission, tenant filters, upload middleware and controller/provider effects were traced directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-46 — PUT /api/admin/destinations/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminDestinationRoutes.js](../../server/routes/adminDestinationRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminDestinationRoutes.md)<br>
**Mounted inventory entry:** 46 of 629<br>
**Route declaration pipeline:** `updateDestination`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("manage_destinations")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("manage_destinations"

**Source declaration:**

```js
router.put(
  "/:id",
  upload.array("images", 10),
  updateDestination
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `slug`, `description`, `country`, `city`, `featured`, `status`, `seo`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`, `code`.

**Source-traced contract:** See [Admin destination contracts](../API_DOMAIN_CONTRACTS/admin-destinations.md), section PUT /api/admin/destinations/:id. Route permission, tenant filters, upload middleware and controller/provider effects were traced directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-47 — DELETE /api/admin/destinations/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminDestinationRoutes.js](../../server/routes/adminDestinationRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminDestinationRoutes.md)<br>
**Mounted inventory entry:** 47 of 629<br>
**Route declaration pipeline:** `deleteDestination`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("manage_destinations")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("manage_destinations"

**Source declaration:**

```js
router.delete(
  "/:id",
  deleteDestination
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `503`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin destination contracts](../API_DOMAIN_CONTRACTS/admin-destinations.md), section DELETE /api/admin/destinations/:id. Route permission, tenant filters, upload middleware and controller/provider effects were traced directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-48 — POST /api/admin/gallery/upload

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminGalleryRoutes.js](../../server/routes/adminGalleryRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminGalleryRoutes.md)<br>
**Mounted inventory entry:** 48 of 629<br>
**Route declaration pipeline:** `uploadSingle`, `uploadGalleryImage`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/upload", uploadSingle("image"), uploadGalleryImage)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin gallery contracts](../API_DOMAIN_CONTRACTS/admin-gallery.md), section POST /api/admin/gallery/upload. Role gate, upload middleware, tenant model hooks and controller/provider effects were traced directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-49 — GET /api/admin/gallery

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminGalleryRoutes.js](../../server/routes/adminGalleryRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminGalleryRoutes.md)<br>
**Mounted inventory entry:** 49 of 629<br>
**Route declaration pipeline:** `getAdminGallery`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", getAdminGallery)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.

**Source-traced contract:** See [Admin gallery contracts](../API_DOMAIN_CONTRACTS/admin-gallery.md), section GET /api/admin/gallery. Role gate, upload middleware, tenant model hooks and controller/provider effects were traced directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-50 — POST /api/admin/gallery

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminGalleryRoutes.js](../../server/routes/adminGalleryRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminGalleryRoutes.md)<br>
**Mounted inventory entry:** 50 of 629<br>
**Route declaration pipeline:** `createAdminGallery`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/", createAdminGallery)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `title`, `category`, `featured`, `active`, `imageUrl`, `publicId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `gallery`.

**Source-traced contract:** See [Admin gallery contracts](../API_DOMAIN_CONTRACTS/admin-gallery.md), section POST /api/admin/gallery. Role gate, upload middleware, tenant model hooks and controller/provider effects were traced directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-51 — PUT /api/admin/gallery/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminGalleryRoutes.js](../../server/routes/adminGalleryRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminGalleryRoutes.md)<br>
**Mounted inventory entry:** 51 of 629<br>
**Route declaration pipeline:** `updateAdminGallery`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put("/:id", updateAdminGallery)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `title`, `category`, `featured`, `active`, `imageUrl`, `publicId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `gallery`.

**Source-traced contract:** See [Admin gallery contracts](../API_DOMAIN_CONTRACTS/admin-gallery.md), section PUT /api/admin/gallery/:id. Role gate, upload middleware, tenant model hooks and controller/provider effects were traced directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-52 — DELETE /api/admin/gallery/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminGalleryRoutes.js](../../server/routes/adminGalleryRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminGalleryRoutes.md)<br>
**Mounted inventory entry:** 52 of 629<br>
**Route declaration pipeline:** `deleteAdminGallery`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.delete("/:id", deleteAdminGallery)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin gallery contracts](../API_DOMAIN_CONTRACTS/admin-gallery.md), section DELETE /api/admin/gallery/:id. Role gate, upload middleware, tenant model hooks and controller/provider effects were traced directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-53 — GET /api/admin/hero

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminHeroRoutes.js](../../server/routes/adminHeroRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminHeroRoutes.md)<br>
**Mounted inventory entry:** 53 of 629<br>
**Route declaration pipeline:** `listHeroSlides`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", listHeroSlides)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin hero slide contracts](../API_DOMAIN_CONTRACTS/admin-hero.md), which traces the router, middleware, controller, tenant-scoped HeroSlide model, response branches, and frontend caller.

**Frontend caller:** `client/src/api/adminHeroApi.js`; UI integration is in `client/src/components/admin/TenantHeroManager.jsx`.

## endpoint-54 — POST /api/admin/hero

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminHeroRoutes.js](../../server/routes/adminHeroRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminHeroRoutes.md)<br>
**Mounted inventory entry:** 54 of 629<br>
**Route declaration pipeline:** `createHeroSlide`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/", createHeroSlide)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`.

**Source-traced contract:** See [Admin hero slide contracts](../API_DOMAIN_CONTRACTS/admin-hero.md), which traces the router, middleware, controller, tenant-scoped HeroSlide model, response branches, and frontend caller.

**Frontend caller:** `client/src/api/adminHeroApi.js`; UI integration is in `client/src/components/admin/TenantHeroManager.jsx`.

## endpoint-55 — PUT /api/admin/hero/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminHeroRoutes.js](../../server/routes/adminHeroRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminHeroRoutes.md)<br>
**Mounted inventory entry:** 55 of 629<br>
**Route declaration pipeline:** `updateHeroSlide`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put("/:id", updateHeroSlide)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin hero slide contracts](../API_DOMAIN_CONTRACTS/admin-hero.md), which traces the router, middleware, controller, tenant-scoped HeroSlide model, response branches, and frontend caller.

**Frontend caller:** `client/src/api/adminHeroApi.js`; UI integration is in `client/src/components/admin/TenantHeroManager.jsx`.

## endpoint-56 — DELETE /api/admin/hero/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminHeroRoutes.js](../../server/routes/adminHeroRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminHeroRoutes.md)<br>
**Mounted inventory entry:** 56 of 629<br>
**Route declaration pipeline:** `deleteHeroSlide`
**Router-wide middleware:** resolveTenant, protect, contentManagerMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.delete("/:id", deleteHeroSlide)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin hero slide contracts](../API_DOMAIN_CONTRACTS/admin-hero.md), which traces the router, middleware, controller, tenant-scoped HeroSlide model, response branches, and frontend caller.

**Frontend caller:** `client/src/api/adminHeroApi.js`; UI integration is in `client/src/components/admin/TenantHeroManager.jsx`.

## endpoint-57 — GET /api/admin/packages

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPackageRoutes.js](../../server/routes/adminPackageRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPackageRoutes.md)<br>
**Mounted inventory entry:** 57 of 629<br>
**Route declaration pipeline:** `listAdminPackages`
**Router-wide middleware:** resolveTenant, protect, adminMiddleware, authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.get("/", listAdminPackages)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.

**Source-traced contract:** See [Admin tour package contracts](../API_DOMAIN_CONTRACTS/admin-packages.md), tracing middleware, validators, controller, tenant-scoped model operations, responses, and frontend caller search.

**Frontend caller:** No matching first-party client caller was found in `client/src` at review time.

## endpoint-58 — POST /api/admin/packages

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPackageRoutes.js](../../server/routes/adminPackageRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPackageRoutes.md)<br>
**Mounted inventory entry:** 58 of 629<br>
**Route declaration pipeline:** `createAdminPackage`
**Router-wide middleware:** resolveTenant, protect, adminMiddleware, authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.post("/", createAdminPackage)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`, `409`.
- JSON envelope keys observed: `success`, `package`, `message`.

**Source-traced contract:** See [Admin tour package contracts](../API_DOMAIN_CONTRACTS/admin-packages.md), tracing middleware, validators, controller, tenant-scoped model operations, responses, and frontend caller search.

**Frontend caller:** No matching first-party client caller was found in `client/src` at review time.

## endpoint-59 — PUT /api/admin/packages/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPackageRoutes.js](../../server/routes/adminPackageRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPackageRoutes.md)<br>
**Mounted inventory entry:** 59 of 629<br>
**Route declaration pipeline:** `updateAdminPackage`
**Router-wide middleware:** resolveTenant, protect, adminMiddleware, authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.put("/:id", updateAdminPackage)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `slug`, `status`, `published`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `package`.

**Source-traced contract:** See [Admin tour package contracts](../API_DOMAIN_CONTRACTS/admin-packages.md), tracing middleware, validators, controller, tenant-scoped model operations, responses, and frontend caller search.

**Frontend caller:** No matching first-party client caller was found in `client/src` at review time.

## endpoint-60 — DELETE /api/admin/packages/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPackageRoutes.js](../../server/routes/adminPackageRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPackageRoutes.md)<br>
**Mounted inventory entry:** 60 of 629<br>
**Route declaration pipeline:** `deleteAdminPackage`
**Router-wide middleware:** resolveTenant, protect, adminMiddleware, authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.delete("/:id", deleteAdminPackage)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `deleted`, `packageId`.

**Source-traced contract:** See [Admin tour package contracts](../API_DOMAIN_CONTRACTS/admin-packages.md), tracing middleware, validators, controller, tenant-scoped model operations, responses, and frontend caller search.

**Frontend caller:** No matching first-party client caller was found in `client/src` at review time.

## endpoint-61 — GET /api/admin/payments

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 61 of 629<br>
**Route declaration pipeline:** `getPayments`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.get("/", getPayments)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `method`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-62 — GET /api/admin/payments/reconciliation

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 62 of 629<br>
**Route declaration pipeline:** `getPaymentReconciliation`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.get("/reconciliation", getPaymentReconciliation)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-63 — GET /api/admin/payments/stats

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 63 of 629<br>
**Route declaration pipeline:** `getPaymentStats`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.get("/stats", getPaymentStats)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-64 — GET /api/admin/payments/analytics

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 64 of 629<br>
**Route declaration pipeline:** `getPaymentAnalytics`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.get("/analytics", getPaymentAnalytics)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-65 — GET /api/admin/payments/export/csv

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 65 of 629<br>
**Route declaration pipeline:** `exportPaymentsCSV`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.get("/export/csv", exportPaymentsCSV)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-66 — GET /api/admin/payments/export/pdf

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 66 of 629<br>
**Route declaration pipeline:** `exportPaymentsPDF`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.get("/export/pdf", exportPaymentsPDF)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-67 — GET /api/admin/payments/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 67 of 629<br>
**Route declaration pipeline:** `getPayment`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.get("/:id", getPayment)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-68 — PATCH /api/admin/payments/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 68 of 629<br>
**Route declaration pipeline:** `updatePaymentStatus`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.patch("/:id/status", updatePaymentStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`, `confirmationReference`, `receiptNumber`, `confirmationNotes`, `failureReason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`.
- JSON envelope keys observed: `success`, `message`, `payment`, `booking`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-69 — PATCH /api/admin/payments/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 69 of 629<br>
**Route declaration pipeline:** `updatePaymentStatus`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.patch("/:id", updatePaymentStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`, `confirmationReference`, `receiptNumber`, `confirmationNotes`, `failureReason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`.
- JSON envelope keys observed: `success`, `message`, `payment`, `booking`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-70 — PATCH /api/admin/payments/:id/refund

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 70 of 629<br>
**Route declaration pipeline:** `guardPaymentRefund`, `refundPayment`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.patch("/:id/refund", guardPaymentRefund, refundPayment)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `amount`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `501`.
- JSON envelope keys observed: `success`, `message`, `payment`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-71 — PUT /api/admin/payments/:id/refund

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 71 of 629<br>
**Route declaration pipeline:** `guardPaymentRefund`, `refundPayment`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.put("/:id/refund", guardPaymentRefund, refundPayment)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `amount`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `501`.
- JSON envelope keys observed: `success`, `message`, `payment`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-72 — POST /api/admin/payments/:id/refund

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminPaymentRoutes.js](../../server/routes/adminPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminPaymentRoutes.md)<br>
**Mounted inventory entry:** 72 of 629<br>
**Route declaration pipeline:** `guardPaymentRefund`, `refundPayment`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("payment.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("payment.manage"

**Source declaration:**

```js
router.post("/:id/refund", guardPaymentRefund, refundPayment)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `amount`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `501`.
- JSON envelope keys observed: `success`, `message`, `payment`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-73 — GET /api/admin/reviews

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminReviewRoutes.js](../../server/routes/adminReviewRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminReviewRoutes.md)<br>
**Mounted inventory entry:** 73 of 629<br>
**Route declaration pipeline:** `getAdminReviews`
**Router-wide middleware:** resolveTenant; protect, adminMiddleware; authorize("review.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("review.manage"

**Source declaration:**

```js
router.get("/", getAdminReviews)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.

**Source-traced contract:** See [Admin review moderation contracts](../API_DOMAIN_CONTRACTS/admin-reviews.md), including role and permission gates, tenant filters, review mutation, rating recalculation, persistence boundaries, responses and frontend callers.

**Frontend caller:** `client/src/api/adminReviewApi.js`, used by `client/src/pages/admin/AdminReviews.jsx`.

## endpoint-74 — PATCH /api/admin/reviews/:id/approve

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminReviewRoutes.js](../../server/routes/adminReviewRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminReviewRoutes.md)<br>
**Mounted inventory entry:** 74 of 629<br>
**Route declaration pipeline:** `approveAdminReview`
**Router-wide middleware:** resolveTenant; protect, adminMiddleware; authorize("review.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("review.manage"

**Source declaration:**

```js
router.patch("/:id/approve", approveAdminReview)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin review moderation contracts](../API_DOMAIN_CONTRACTS/admin-reviews.md), including role and permission gates, tenant filters, review mutation, rating recalculation, persistence boundaries, responses and frontend callers.

**Frontend caller:** `client/src/api/adminReviewApi.js`, used by `client/src/pages/admin/AdminReviews.jsx`.

## endpoint-75 — PATCH /api/admin/reviews/:id/reject

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminReviewRoutes.js](../../server/routes/adminReviewRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminReviewRoutes.md)<br>
**Mounted inventory entry:** 75 of 629<br>
**Route declaration pipeline:** `rejectAdminReview`
**Router-wide middleware:** resolveTenant; protect, adminMiddleware; authorize("review.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("review.manage"

**Source declaration:**

```js
router.patch("/:id/reject", rejectAdminReview)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin review moderation contracts](../API_DOMAIN_CONTRACTS/admin-reviews.md), including role and permission gates, tenant filters, review mutation, rating recalculation, persistence boundaries, responses and frontend callers.

**Frontend caller:** `client/src/api/adminReviewApi.js`, used by `client/src/pages/admin/AdminReviews.jsx`.

## endpoint-76 — DELETE /api/admin/reviews/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminReviewRoutes.js](../../server/routes/adminReviewRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminReviewRoutes.md)<br>
**Mounted inventory entry:** 76 of 629<br>
**Route declaration pipeline:** `deleteAdminReview`
**Router-wide middleware:** resolveTenant; protect, adminMiddleware; authorize("review.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("review.manage"

**Source declaration:**

```js
router.delete("/:id", deleteAdminReview)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin review moderation contracts](../API_DOMAIN_CONTRACTS/admin-reviews.md), including role and permission gates, tenant filters, review mutation, rating recalculation, persistence boundaries, responses and frontend callers.

**Frontend caller:** `client/src/api/adminReviewApi.js`, used by `client/src/pages/admin/AdminReviews.jsx`.

## endpoint-77 — GET /api/admin/roles

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoleRoutes.js](../../server/routes/adminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoleRoutes.md)<br>
**Mounted inventory entry:** 77 of 629<br>
**Route declaration pipeline:** `getRoles`
**Router-wide middleware:** resolveTenant; protect; checkPermission("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("roles.manage"

**Source declaration:**

```js
router.get(
"/",
getRoles
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`, `roles`.

**Source-traced contract:** See [Admin role and permission contracts](../API_DOMAIN_CONTRACTS/admin-roles.md), which distinguishes each route method and shared RBAC, tenant, model and permission behavior.

**Frontend caller:** `client/src/api/admin/adminRoleApi.js`; role management UI callers use the same wrappers.

## endpoint-78 — GET /api/admin/roles/permissions/all

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoleRoutes.js](../../server/routes/adminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoleRoutes.md)<br>
**Mounted inventory entry:** 78 of 629<br>
**Route declaration pipeline:** `getPermissions`
**Router-wide middleware:** resolveTenant; protect; checkPermission("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("roles.manage"

**Source declaration:**

```js
router.get(
"/permissions/all",
getPermissions
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.

**Source-traced contract:** See [Admin role and permission contracts](../API_DOMAIN_CONTRACTS/admin-roles.md), which distinguishes each route method and shared RBAC, tenant, model and permission behavior.

**Frontend caller:** `client/src/api/admin/adminRoleApi.js`; role management UI callers use the same wrappers.

## endpoint-79 — GET /api/admin/roles/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoleRoutes.js](../../server/routes/adminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoleRoutes.md)<br>
**Mounted inventory entry:** 79 of 629<br>
**Route declaration pipeline:** `getRole`
**Router-wide middleware:** resolveTenant; protect; checkPermission("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("roles.manage"

**Source declaration:**

```js
router.get(
"/:id",
getRole
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin role and permission contracts](../API_DOMAIN_CONTRACTS/admin-roles.md), which distinguishes each route method and shared RBAC, tenant, model and permission behavior.

**Frontend caller:** `client/src/api/admin/adminRoleApi.js`; role management UI callers use the same wrappers.

## endpoint-80 — POST /api/admin/roles

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoleRoutes.js](../../server/routes/adminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoleRoutes.md)<br>
**Mounted inventory entry:** 80 of 629<br>
**Route declaration pipeline:** `createRole`
**Router-wide middleware:** resolveTenant; protect; checkPermission("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("roles.manage"

**Source declaration:**

```js
router.post(
"/",
createRole
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `displayName`, `description`, `permissions`, `level`, `status`, `isDefault`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin role and permission contracts](../API_DOMAIN_CONTRACTS/admin-roles.md), which distinguishes each route method and shared RBAC, tenant, model and permission behavior.

**Frontend caller:** `client/src/api/admin/adminRoleApi.js`; role management UI callers use the same wrappers.

## endpoint-81 — PUT /api/admin/roles/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoleRoutes.js](../../server/routes/adminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoleRoutes.md)<br>
**Mounted inventory entry:** 81 of 629<br>
**Route declaration pipeline:** `updateRole`
**Router-wide middleware:** resolveTenant; protect; checkPermission("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("roles.manage"

**Source declaration:**

```js
router.put(
"/:id",
updateRole
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `displayName`, `description`, `level`, `status`, `isDefault`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin role and permission contracts](../API_DOMAIN_CONTRACTS/admin-roles.md), which distinguishes each route method and shared RBAC, tenant, model and permission behavior.

**Frontend caller:** `client/src/api/admin/adminRoleApi.js`; role management UI callers use the same wrappers.

## endpoint-82 — PATCH /api/admin/roles/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoleRoutes.js](../../server/routes/adminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoleRoutes.md)<br>
**Mounted inventory entry:** 82 of 629<br>
**Route declaration pipeline:** `updateRole`
**Router-wide middleware:** resolveTenant; protect; checkPermission("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("roles.manage"

**Source declaration:**

```js
router.patch(
"/:id",
updateRole
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `displayName`, `description`, `level`, `status`, `isDefault`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin role and permission contracts](../API_DOMAIN_CONTRACTS/admin-roles.md), which distinguishes each route method and shared RBAC, tenant, model and permission behavior.

**Frontend caller:** `client/src/api/admin/adminRoleApi.js`; role management UI callers use the same wrappers.

## endpoint-83 — DELETE /api/admin/roles/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoleRoutes.js](../../server/routes/adminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoleRoutes.md)<br>
**Mounted inventory entry:** 83 of 629<br>
**Route declaration pipeline:** `deleteRole`
**Router-wide middleware:** resolveTenant; protect; checkPermission("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("roles.manage"

**Source declaration:**

```js
router.delete(
"/:id",
deleteRole
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin role and permission contracts](../API_DOMAIN_CONTRACTS/admin-roles.md), which distinguishes each route method and shared RBAC, tenant, model and permission behavior.

**Frontend caller:** `client/src/api/admin/adminRoleApi.js`; role management UI callers use the same wrappers.

## endpoint-84 — PUT /api/admin/roles/:id/permissions

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoleRoutes.js](../../server/routes/adminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoleRoutes.md)<br>
**Mounted inventory entry:** 84 of 629<br>
**Route declaration pipeline:** `updatePermissions`
**Router-wide middleware:** resolveTenant; protect; checkPermission("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("roles.manage"

**Source declaration:**

```js
router.put(
"/:id/permissions",
updatePermissions
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `permissions`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin role and permission contracts](../API_DOMAIN_CONTRACTS/admin-roles.md), which distinguishes each route method and shared RBAC, tenant, model and permission behavior.

**Frontend caller:** `client/src/api/admin/adminRoleApi.js`; role management UI callers use the same wrappers.

## endpoint-85 — GET /api/admin/bookings/analytics

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 85 of 629<br>
**Route declaration pipeline:** `getBookingAnalytics`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.get("/bookings/analytics", getBookingAnalytics)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin booking and revenue analytics](../API_DOMAIN_CONTRACTS/admin-analytics.md), including distinct route authorization, tenant filters, aggregation logic, response shape and revenue basis.

**Frontend caller:** `client/src/api/adminApi.js`.

## endpoint-86 — GET /api/admin/revenue/analytics

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 86 of 629<br>
**Route declaration pipeline:** `getRevenueAnalytics`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.get("/revenue/analytics", getRevenueAnalytics)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin booking and revenue analytics](../API_DOMAIN_CONTRACTS/admin-analytics.md), including distinct route authorization, tenant filters, aggregation logic, response shape and revenue basis.

**Frontend caller:** `client/src/api/adminApi.js`.

## endpoint-87 — PUT /api/admin/bookings/:id/refund

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 87 of 629<br>
**Route declaration pipeline:** `refundBooking`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.put("/bookings/:id/refund", refundBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `amount`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `501`, `200`.
- JSON envelope keys observed: `success`, `message`, `payment`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-88 — POST /api/admin/bookings/:id/refund

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 88 of 629<br>
**Route declaration pipeline:** `refundBooking`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.post("/bookings/:id/refund", refundBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `amount`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `501`, `200`.
- JSON envelope keys observed: `success`, `message`, `payment`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-89 — PUT /api/admin/refunds/:id/process

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 89 of 629<br>
**Route declaration pipeline:** `processRefund`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.put("/refunds/:id/process", processRefund)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`, `mpesaReference`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-90 — GET /api/admin/users

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 90 of 629<br>
**Route declaration pipeline:** `getUsers`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.get("/users", getUsers)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin user and staff management contracts](../API_DOMAIN_CONTRACTS/admin-users.md), which records each method, validation branch, tenant filters, model mutations, compensation limits, response, and frontend caller.

**Frontend caller:** `client/src/api/adminUserApi.js` or `client/src/api/adminApi.js` as noted in the domain contract.

## endpoint-91 — POST /api/admin/users/staff

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 91 of 629<br>
**Route declaration pipeline:** `createStaffAccount`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.post("/users/staff", createStaffAccount)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `companyName`, `name`, `email`, `phone`, `password`, `role`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `403`, `201`.
- JSON envelope keys observed: `success`, `message`, `repaired`.

**Source-traced contract:** See [Admin user and staff management contracts](../API_DOMAIN_CONTRACTS/admin-users.md), which records each method, validation branch, tenant filters, model mutations, compensation limits, response, and frontend caller.

**Frontend caller:** `client/src/api/adminUserApi.js` or `client/src/api/adminApi.js` as noted in the domain contract.

## endpoint-92 — GET /api/admin/users/analytics

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 92 of 629<br>
**Route declaration pipeline:** `getUserAnalytics`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.get("/users/analytics", getUserAnalytics)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin user and staff management contracts](../API_DOMAIN_CONTRACTS/admin-users.md), which records each method, validation branch, tenant filters, model mutations, compensation limits, response, and frontend caller.

**Frontend caller:** `client/src/api/adminUserApi.js` or `client/src/api/adminApi.js` as noted in the domain contract.

## endpoint-93 — PATCH /api/admin/users/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 93 of 629<br>
**Route declaration pipeline:** `updateUserStatus`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.patch("/users/:id/status", updateUserStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin user and staff management contracts](../API_DOMAIN_CONTRACTS/admin-users.md), which records each method, validation branch, tenant filters, model mutations, compensation limits, response, and frontend caller.

**Frontend caller:** `client/src/api/adminUserApi.js` or `client/src/api/adminApi.js` as noted in the domain contract.

## endpoint-94 — PUT /api/admin/users/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 94 of 629<br>
**Route declaration pipeline:** `updateUserStatus`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.put("/users/:id/status", updateUserStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin user and staff management contracts](../API_DOMAIN_CONTRACTS/admin-users.md), which records each method, validation branch, tenant filters, model mutations, compensation limits, response, and frontend caller.

**Frontend caller:** `client/src/api/adminUserApi.js` or `client/src/api/adminApi.js` as noted in the domain contract.

## endpoint-95 — PUT /api/admin/users/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 95 of 629<br>
**Route declaration pipeline:** `updateUserProfile`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.put("/users/:id", updateUserProfile)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `email`, `phone`, `role`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `409`.
- JSON envelope keys observed: `success`, `message`, `user`, `data`.

**Source-traced contract:** See [Admin user and staff management contracts](../API_DOMAIN_CONTRACTS/admin-users.md), which records each method, validation branch, tenant filters, model mutations, compensation limits, response, and frontend caller.

**Frontend caller:** `client/src/api/adminUserApi.js` or `client/src/api/adminApi.js` as noted in the domain contract.

## endpoint-96 — DELETE /api/admin/users/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 96 of 629<br>
**Route declaration pipeline:** `deleteUser`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.delete("/users/:id", deleteUser)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`, `deleted`.

**Source-traced contract:** See [Admin user and staff management contracts](../API_DOMAIN_CONTRACTS/admin-users.md), which records each method, validation branch, tenant filters, model mutations, compensation limits, response, and frontend caller.

**Frontend caller:** `client/src/api/adminUserApi.js` or `client/src/api/adminApi.js` as noted in the domain contract.

## endpoint-97 — GET /api/admin/reports/daily

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 97 of 629<br>
**Route declaration pipeline:** `dailyBookingReport`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.get("/reports/daily", dailyBookingReport)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.

**Source-traced contract:** See [Admin booking report contracts](../API_DOMAIN_CONTRACTS/admin-booking-reports.md) for date rules, aggregation behavior, joins, response shape, and known tenant lookup gaps.

**Frontend caller:** `client/src/api/adminReportApi.js`.

## endpoint-98 — GET /api/admin/reports/monthly

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 98 of 629<br>
**Route declaration pipeline:** `monthlyBookingReport`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.get("/reports/monthly", monthlyBookingReport)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `year`, `month`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.

**Source-traced contract:** See [Admin booking report contracts](../API_DOMAIN_CONTRACTS/admin-booking-reports.md) for date rules, aggregation behavior, joins, response shape, and known tenant lookup gaps.

**Frontend caller:** `client/src/api/adminReportApi.js`.

## endpoint-99 — GET /api/admin/reports/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 99 of 629<br>
**Route declaration pipeline:** `tourBookingReport`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.get("/reports/tours", tourBookingReport)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.

**Source-traced contract:** See [Admin booking report contracts](../API_DOMAIN_CONTRACTS/admin-booking-reports.md) for date rules, aggregation behavior, joins, response shape, and known tenant lookup gaps.

**Frontend caller:** `client/src/api/adminReportApi.js`.

## endpoint-100 — GET /api/admin/reports/agents

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminRoutes.js](../../server/routes/adminRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminRoutes.md)<br>
**Mounted inventory entry:** 100 of 629<br>
**Route declaration pipeline:** `agentBookingReport`
**Router-wide middleware:** protect; resolveTenant; adminMiddleware; "/users", checkPermission("user.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("user.manage"

**Source declaration:**

```js
router.get("/reports/agents", agentBookingReport)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.

**Source-traced contract:** See [Admin booking report contracts](../API_DOMAIN_CONTRACTS/admin-booking-reports.md) for date rules, aggregation behavior, joins, response shape, and known tenant lookup gaps.

**Frontend caller:** `client/src/api/adminReportApi.js`.

## endpoint-101 — GET /api/admin/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminTourRoutes.js](../../server/routes/adminTourRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminTourRoutes.md)<br>
**Mounted inventory entry:** 101 of 629<br>
**Route declaration pipeline:** `getAllTours`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.get("/", getAllTours)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `category`, `featured`, `destination`, `available`, `search`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `pages`, `count`.

**Source-traced contract:** See [Admin tour catalogue contracts](../API_DOMAIN_CONTRACTS/admin-tours.md), including actual query handling, tenant plugin enforcement, populated fields, responses, frontend use and test coverage.

**Frontend caller:** `getAdminTours` in `client/src/api/adminTourApi.js`; the list page applies its search locally.

## endpoint-102 — GET /api/admin/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminTourRoutes.js](../../server/routes/adminTourRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminTourRoutes.md)<br>
**Mounted inventory entry:** 102 of 629<br>
**Route declaration pipeline:** `getTour`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.get("/:id", getTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-103 — POST /api/admin/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminTourRoutes.js](../../server/routes/adminTourRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminTourRoutes.md)<br>
**Mounted inventory entry:** 103 of 629<br>
**Route declaration pipeline:** `validateFutureTourDate`, `createTour`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.post("/", validateFutureTourDate, upload.array("images", 10), createTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `assignedGuide`, `guide`, `assignedDriver`, `driver`, `assignedVehicle`, `vehicle`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-104 — PUT /api/admin/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminTourRoutes.js](../../server/routes/adminTourRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminTourRoutes.md)<br>
**Mounted inventory entry:** 104 of 629<br>
**Route declaration pipeline:** `validateTourCommand`, `updateTour`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.put("/:id", validateTourCommand(), upload.array("images", 10), updateTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `data`, `tour`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-105 — DELETE /api/admin/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminTourRoutes.js](../../server/routes/adminTourRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminTourRoutes.md)<br>
**Mounted inventory entry:** 105 of 629<br>
**Route declaration pipeline:** `deleteTour`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.delete("/:id", deleteTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`, `data`, `bookingsAffected`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-106 — PATCH /api/admin/tours/:id/publication

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminTourRoutes.js](../../server/routes/adminTourRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminTourRoutes.md)<br>
**Mounted inventory entry:** 106 of 629<br>
**Route declaration pipeline:** `setPublication`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.patch("/:id/publication", setPublication)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `published`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-107 — PATCH /api/admin/tours/:id/restore

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminTourRoutes.js](../../server/routes/adminTourRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminTourRoutes.md)<br>
**Mounted inventory entry:** 107 of 629<br>
**Route declaration pipeline:** `restoreTour`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.patch("/:id/restore", restoreTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-108 — PATCH /api/admin/tours/:id/guide

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminTourRoutes.js](../../server/routes/adminTourRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminTourRoutes.md)<br>
**Mounted inventory entry:** 108 of 629<br>
**Route declaration pipeline:** `assignTourResourcesSafe`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.patch("/:id/guide", assignTourResourcesSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-109 — PATCH /api/admin/tours/:id/driver

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminTourRoutes.js](../../server/routes/adminTourRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminTourRoutes.md)<br>
**Mounted inventory entry:** 109 of 629<br>
**Route declaration pipeline:** `assignTourResourcesSafe`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.patch("/:id/driver", assignTourResourcesSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-110 — PATCH /api/admin/tours/:id/vehicle

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminTourRoutes.js](../../server/routes/adminTourRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminTourRoutes.md)<br>
**Mounted inventory entry:** 110 of 629<br>
**Route declaration pipeline:** `assignTourResourcesSafe`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("tour.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("tour.manage"

**Source declaration:**

```js
router.patch("/:id/vehicle", assignTourResourcesSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-204 — GET /api/admin/compliance

**Contract status:** SOURCE-TRACED<br>
**Router:** [complianceRoutes.js](../../server/routes/complianceRoutes.js) · [route module explanation](../code-explanations/backend/routes/complianceRoutes.md)<br>
**Mounted inventory entry:** 204 of 629<br>
**Route declaration pipeline:** `authorize`, `listComplianceRecords`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/", authorize("finance.view"), listComplianceRecords)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `type`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-205 — GET /api/admin/compliance/summary

**Contract status:** SOURCE-TRACED<br>
**Router:** [complianceRoutes.js](../../server/routes/complianceRoutes.js) · [route module explanation](../code-explanations/backend/routes/complianceRoutes.md)<br>
**Mounted inventory entry:** 205 of 629<br>
**Route declaration pipeline:** `authorize`, `getComplianceSummary`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/summary", authorize("finance.view"), getComplianceSummary)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-206 — PUT /api/admin/compliance/:type

**Contract status:** SOURCE-TRACED<br>
**Router:** [complianceRoutes.js](../../server/routes/complianceRoutes.js) · [route module explanation](../code-explanations/backend/routes/complianceRoutes.md)<br>
**Mounted inventory entry:** 206 of 629<br>
**Route declaration pipeline:** `authorize`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.put("/:type", authorize("finance.manage"), (req, res, next) => { req.body = { ...(req.body || {}), type: req.params.type }; return upsertComplianceRecord(req, res, next); })
```

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-207 — POST /api/admin/compliance/etims/invoices/:id/queue

**Contract status:** SOURCE-TRACED<br>
**Router:** [complianceRoutes.js](../../server/routes/complianceRoutes.js) · [route module explanation](../code-explanations/backend/routes/complianceRoutes.md)<br>
**Mounted inventory entry:** 207 of 629<br>
**Route declaration pipeline:** `authorize`, `queueEtimsInvoice`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/etims/invoices/:id/queue", authorize("finance.manage"), queueEtimsInvoice)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `202`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-208 — GET /api/admin/compliance/etims/invoices/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [complianceRoutes.js](../../server/routes/complianceRoutes.js) · [route module explanation](../code-explanations/backend/routes/complianceRoutes.md)<br>
**Mounted inventory entry:** 208 of 629<br>
**Route declaration pipeline:** `authorize`, `getEtimsInvoiceStatus`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/etims/invoices/:id/status", authorize("finance.view"), getEtimsInvoiceStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-210 — GET /api/admin/credit-debit-notes

**Contract status:** SOURCE-TRACED<br>
**Router:** [creditDebitNoteRoutes.js](../../server/routes/creditDebitNoteRoutes.js) · [route module explanation](../code-explanations/backend/routes/creditDebitNoteRoutes.md)<br>
**Mounted inventory entry:** 210 of 629<br>
**Route declaration pipeline:** `authorize`, `listCreditDebitNotes`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/", authorize("finance.view"), listCreditDebitNotes)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-211 — POST /api/admin/credit-debit-notes

**Contract status:** SOURCE-TRACED<br>
**Router:** [creditDebitNoteRoutes.js](../../server/routes/creditDebitNoteRoutes.js) · [route module explanation](../code-explanations/backend/routes/creditDebitNoteRoutes.md)<br>
**Mounted inventory entry:** 211 of 629<br>
**Route declaration pipeline:** `authorize`, `createCreditDebitNote`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/", authorize("finance.manage"), createCreditDebitNote)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `type`, `originalInvoice`, `reason`, `amount`, `taxAmount`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-212 — POST /api/admin/credit-debit-notes/:id/issue

**Contract status:** SOURCE-TRACED<br>
**Router:** [creditDebitNoteRoutes.js](../../server/routes/creditDebitNoteRoutes.js) · [route module explanation](../code-explanations/backend/routes/creditDebitNoteRoutes.md)<br>
**Mounted inventory entry:** 212 of 629<br>
**Route declaration pipeline:** `authorize`, `issueCreditDebitNote`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/:id/issue", authorize("finance.manage"), issueCreditDebitNote)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-213 — POST /api/admin/credit-debit-notes/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [creditDebitNoteRoutes.js](../../server/routes/creditDebitNoteRoutes.js) · [route module explanation](../code-explanations/backend/routes/creditDebitNoteRoutes.md)<br>
**Mounted inventory entry:** 213 of 629<br>
**Route declaration pipeline:** `authorize`, `cancelCreditDebitNote`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/:id/cancel", authorize("finance.manage"), cancelCreditDebitNote)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-221 — GET /api/admin/customers

**Contract status:** SOURCE-TRACED<br>
**Router:** [customerRoutes.js](../../server/routes/customerRoutes.js) · [route module explanation](../code-explanations/backend/routes/customerRoutes.md)<br>
**Mounted inventory entry:** 221 of 629<br>
**Route declaration pipeline:** `getCustomers`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("manage_customers")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("manage_customers"

**Source declaration:**

```js
router.get(
  "/",
  getCustomers
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `search`, `page`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-223 — GET /api/admin/customers/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [customerRoutes.js](../../server/routes/customerRoutes.js) · [route module explanation](../code-explanations/backend/routes/customerRoutes.md)<br>
**Mounted inventory entry:** 223 of 629<br>
**Route declaration pipeline:** `getCustomerProfile`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("manage_customers")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("manage_customers"

**Source declaration:**

```js
router.get(
  "/:id",
  getCustomerProfile
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-230 — GET /api/admin/developer/api-keys

**Contract status:** SOURCE-TRACED<br>
**Router:** [developerIntegrationRoutes.js](../../server/routes/developerIntegrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/developerIntegrationRoutes.md)<br>
**Mounted inventory entry:** 230 of 629<br>
**Route declaration pipeline:** `listApiKeys`
**Router-wide middleware:** resolveTenant, protect, checkPermission("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("system.security"

**Source declaration:**

```js
router.get("/api-keys", listApiKeys)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-231 — POST /api/admin/developer/api-keys

**Contract status:** SOURCE-TRACED<br>
**Router:** [developerIntegrationRoutes.js](../../server/routes/developerIntegrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/developerIntegrationRoutes.md)<br>
**Mounted inventory entry:** 231 of 629<br>
**Route declaration pipeline:** `createApiKey`
**Router-wide middleware:** resolveTenant, protect, checkPermission("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("system.security"

**Source declaration:**

```js
router.post("/api-keys", createApiKey)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `scopes`, `expiresAt`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-232 — POST /api/admin/developer/api-keys/:id/revoke

**Contract status:** SOURCE-TRACED<br>
**Router:** [developerIntegrationRoutes.js](../../server/routes/developerIntegrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/developerIntegrationRoutes.md)<br>
**Mounted inventory entry:** 232 of 629<br>
**Route declaration pipeline:** `revokeApiKey`
**Router-wide middleware:** resolveTenant, protect, checkPermission("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("system.security"

**Source declaration:**

```js
router.post("/api-keys/:id/revoke", revokeApiKey)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-233 — GET /api/admin/developer/webhooks

**Contract status:** SOURCE-TRACED<br>
**Router:** [developerIntegrationRoutes.js](../../server/routes/developerIntegrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/developerIntegrationRoutes.md)<br>
**Mounted inventory entry:** 233 of 629<br>
**Route declaration pipeline:** `listWebhooks`
**Router-wide middleware:** resolveTenant, protect, checkPermission("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("system.security"

**Source declaration:**

```js
router.get("/webhooks", listWebhooks)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-234 — POST /api/admin/developer/webhooks

**Contract status:** SOURCE-TRACED<br>
**Router:** [developerIntegrationRoutes.js](../../server/routes/developerIntegrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/developerIntegrationRoutes.md)<br>
**Mounted inventory entry:** 234 of 629<br>
**Route declaration pipeline:** `createWebhook`
**Router-wide middleware:** resolveTenant, protect, checkPermission("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("system.security"

**Source declaration:**

```js
router.post("/webhooks", createWebhook)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `url`, `events`, `name`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-235 — PATCH /api/admin/developer/webhooks/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [developerIntegrationRoutes.js](../../server/routes/developerIntegrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/developerIntegrationRoutes.md)<br>
**Mounted inventory entry:** 235 of 629<br>
**Route declaration pipeline:** `updateWebhook`
**Router-wide middleware:** resolveTenant, protect, checkPermission("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("system.security"

**Source declaration:**

```js
router.patch("/webhooks/:id", updateWebhook)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `url`, `events`, `active`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-236 — POST /api/admin/developer/webhooks/:id/test

**Contract status:** SOURCE-TRACED<br>
**Router:** [developerIntegrationRoutes.js](../../server/routes/developerIntegrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/developerIntegrationRoutes.md)<br>
**Mounted inventory entry:** 236 of 629<br>
**Route declaration pipeline:** `testWebhook`
**Router-wide middleware:** resolveTenant, protect, checkPermission("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("system.security"

**Source declaration:**

```js
router.post("/webhooks/:id/test", testWebhook)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `202`.
- JSON envelope keys observed: `success`, `message`, `jobId`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-237 — DELETE /api/admin/developer/webhooks/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [developerIntegrationRoutes.js](../../server/routes/developerIntegrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/developerIntegrationRoutes.md)<br>
**Mounted inventory entry:** 237 of 629<br>
**Route declaration pipeline:** `deleteWebhook`
**Router-wide middleware:** resolveTenant, protect, checkPermission("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("system.security"

**Source declaration:**

```js
router.delete("/webhooks/:id", deleteWebhook)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-244 — GET /api/admin/finance

**Contract status:** SOURCE-TRACED<br>
**Router:** [financeRoutes.js](../../server/routes/financeRoutes.js) · [route module explanation](../code-explanations/backend/routes/financeRoutes.md)<br>
**Mounted inventory entry:** 244 of 629<br>
**Route declaration pipeline:** `getFinanceStats`
**Router-wide middleware:** resolveTenant; protect; financeAccess; "/compliance", financeComplianceRoutes; "/kenya-readiness", kenyaReadinessRoutes; "/accounting", accountingRoutes
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", getFinanceStats)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-245 — GET /api/admin/finance/stats

**Contract status:** SOURCE-TRACED<br>
**Router:** [financeRoutes.js](../../server/routes/financeRoutes.js) · [route module explanation](../code-explanations/backend/routes/financeRoutes.md)<br>
**Mounted inventory entry:** 245 of 629<br>
**Route declaration pipeline:** `getFinanceStats`
**Router-wide middleware:** resolveTenant; protect; financeAccess; "/compliance", financeComplianceRoutes; "/kenya-readiness", kenyaReadinessRoutes; "/accounting", accountingRoutes
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/stats", getFinanceStats)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-246 — GET /api/admin/finance/transactions

**Contract status:** SOURCE-TRACED<br>
**Router:** [financeRoutes.js](../../server/routes/financeRoutes.js) · [route module explanation](../code-explanations/backend/routes/financeRoutes.md)<br>
**Mounted inventory entry:** 246 of 629<br>
**Route declaration pipeline:** `getTransactions`
**Router-wide middleware:** resolveTenant; protect; financeAccess; "/compliance", financeComplianceRoutes; "/kenya-readiness", kenyaReadinessRoutes; "/accounting", accountingRoutes
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/transactions", getTransactions)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `status`, `search`, `startDate`, `endDate`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-247 — GET /api/admin/finance/reports

**Contract status:** SOURCE-TRACED<br>
**Router:** [financeRoutes.js](../../server/routes/financeRoutes.js) · [route module explanation](../code-explanations/backend/routes/financeRoutes.md)<br>
**Mounted inventory entry:** 247 of 629<br>
**Route declaration pipeline:** `getReports`
**Router-wide middleware:** resolveTenant; protect; financeAccess; "/compliance", financeComplianceRoutes; "/kenya-readiness", kenyaReadinessRoutes; "/accounting", accountingRoutes
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/reports", getReports)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-248 — GET /api/admin/finance/withholding-tax

**Contract status:** SOURCE-TRACED<br>
**Router:** [financeRoutes.js](../../server/routes/financeRoutes.js) · [route module explanation](../code-explanations/backend/routes/financeRoutes.md)<br>
**Mounted inventory entry:** 248 of 629<br>
**Route declaration pipeline:** `listWithholdingTax`
**Router-wide middleware:** resolveTenant; protect; financeAccess; "/compliance", financeComplianceRoutes; "/kenya-readiness", kenyaReadinessRoutes; "/accounting", accountingRoutes
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/withholding-tax", listWithholdingTax)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`, `taxPeriod`, `payee`, `limit`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`, `totals`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-249 — POST /api/admin/finance/withholding-tax

**Contract status:** SOURCE-TRACED<br>
**Router:** [financeRoutes.js](../../server/routes/financeRoutes.js) · [route module explanation](../code-explanations/backend/routes/financeRoutes.md)<br>
**Mounted inventory entry:** 249 of 629<br>
**Route declaration pipeline:** `authorize`, `createWithholdingTax`
**Router-wide middleware:** resolveTenant; protect; financeAccess; "/compliance", financeComplianceRoutes; "/kenya-readiness", kenyaReadinessRoutes; "/accounting", accountingRoutes
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/withholding-tax", authorize("finance.manage"), createWithholdingTax)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `baseAmount`, `rate`, `taxPeriod`, `payeeName`, `payeePin`, `reference`, `sourceType`, `sourceId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `422`, `201`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-250 — POST /api/admin/finance/withholding-tax/:id/remit

**Contract status:** SOURCE-TRACED<br>
**Router:** [financeRoutes.js](../../server/routes/financeRoutes.js) · [route module explanation](../code-explanations/backend/routes/financeRoutes.md)<br>
**Mounted inventory entry:** 250 of 629<br>
**Route declaration pipeline:** `authorize`, `remitWithholdingTax`
**Router-wide middleware:** resolveTenant; protect; financeAccess; "/compliance", financeComplianceRoutes; "/kenya-readiness", kenyaReadinessRoutes; "/accounting", accountingRoutes
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/withholding-tax/:id/remit", authorize("finance.manage"), remitWithholdingTax)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `paymentReference`, `certificateNumber`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `422`.
- JSON envelope keys observed: `success`, `message`, `data`, `alreadyRemitted`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-251 — POST /api/admin/finance/withholding-tax/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [financeRoutes.js](../../server/routes/financeRoutes.js) · [route module explanation](../code-explanations/backend/routes/financeRoutes.md)<br>
**Mounted inventory entry:** 251 of 629<br>
**Route declaration pipeline:** `authorize`, `cancelWithholdingTax`
**Router-wide middleware:** resolveTenant; protect; financeAccess; "/compliance", financeComplianceRoutes; "/kenya-readiness", kenyaReadinessRoutes; "/accounting", accountingRoutes
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/withholding-tax/:id/cancel", authorize("finance.manage"), cancelWithholdingTax)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-260 — GET /api/admin/hospitality-operations/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 260 of 629<br>
**Route declaration pipeline:** `hospitalityDashboard`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/dashboard",hospitalityDashboard)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-261 — GET /api/admin/hospitality-operations/hotels/calendar

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 261 of 629<br>
**Route declaration pipeline:** `hotelCalendar`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/hotels/calendar",hotelCalendar)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `hotelId`, `from`, `to`.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-262 — GET /api/admin/hospitality-operations/hotels/performance

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 262 of 629<br>
**Route declaration pipeline:** `hotelPerformance`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/hotels/performance",hotelPerformance)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `hotelId`, `from`, `to`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-263 — PATCH /api/admin/hospitality-operations/hotels/bookings/:id/amend

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 263 of 629<br>
**Route declaration pipeline:** `amendHotelBookingProduction`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/hotels/bookings/:id/amend",amendHotelBookingProduction)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `checkIn`, `checkOut`, `rooms`, `adults`, `children`, `ratePlanId`, `mealPlan`, `specialRequests`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `400`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-264 — PATCH /api/admin/hospitality-operations/hotels/bookings/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 264 of 629<br>
**Route declaration pipeline:** `cancelHotelBooking`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/hotels/bookings/:id/cancel",cancelHotelBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-265 — GET /api/admin/hospitality-operations/hotels/room-blocks

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 265 of 629<br>
**Route declaration pipeline:** `roomBlocks`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/hotels/room-blocks",roomBlocks)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`, `hotelId`, `roomTypeId`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-266 — POST /api/admin/hospitality-operations/hotels/room-blocks

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 266 of 629<br>
**Route declaration pipeline:** `createConcurrentSafeRoomBlock`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.post("/hotels/room-blocks",createConcurrentSafeRoomBlock)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `roomTypeId`, `startDate`, `endDate`, `quantity`, `reason`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-267 — PATCH /api/admin/hospitality-operations/hotels/room-blocks/:id/release

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 267 of 629<br>
**Route declaration pipeline:** `releaseRoomBlock`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/hotels/room-blocks/:id/release",releaseRoomBlock)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-268 — GET /api/admin/hospitality-operations/rate-plans

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 268 of 629<br>
**Route declaration pipeline:** `ratePlans`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/rate-plans",ratePlans)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `hotelId`, `roomTypeId`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-269 — POST /api/admin/hospitality-operations/rate-plans

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 269 of 629<br>
**Route declaration pipeline:** `createCommercialRatePlan`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.post("/rate-plans",createCommercialRatePlan)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `hotel`, `roomType`, `nightlyRate`, `minNights`, `maxNights`, `name`, `validFrom`, `validTo`, `code`, `currency`, `mealPlan`, `refundable`, `cancellationPolicy`, `stopSell`, `status`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-270 — PATCH /api/admin/hospitality-operations/rate-plans/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 270 of 629<br>
**Route declaration pipeline:** `updateCommercialRatePlan`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/rate-plans/:id",updateCommercialRatePlan)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `hotel`, `roomType`, `validFrom`, `validTo`, `nightlyRate`, `minNights`, `maxNights`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-271 — GET /api/admin/hospitality-operations/suppliers/contracts

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 271 of 629<br>
**Route declaration pipeline:** `supplierContracts`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/suppliers/contracts",supplierContracts)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`, `supplierType`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-272 — POST /api/admin/hospitality-operations/suppliers/contracts

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 272 of 629<br>
**Route declaration pipeline:** `createCommercialSupplierContract`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.post("/suppliers/contracts",createCommercialSupplierContract)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `commissionPercent`, `depositPercent`, `supplierName`, `validFrom`, `validTo`, `hotel`, `contractNumber`, `currency`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-273 — PATCH /api/admin/hospitality-operations/suppliers/contracts/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 273 of 629<br>
**Route declaration pipeline:** `updateCommercialSupplierContract`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/suppliers/contracts/:id",updateCommercialSupplierContract)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `hotel`, `validFrom`, `validTo`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-274 — GET /api/admin/hospitality-operations/deposits

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 274 of 629<br>
**Route declaration pipeline:** `deposits`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/deposits",deposits)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-275 — POST /api/admin/hospitality-operations/deposits

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 275 of 629<br>
**Route declaration pipeline:** `createCommercialDeposit`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.post("/deposits",createCommercialDeposit)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `hospitalityBooking`, `hospitalityType`, `amount`, `paidAmount`, `currency`, `dueDate`, `notes`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-276 — PATCH /api/admin/hospitality-operations/deposits/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 276 of 629<br>
**Route declaration pipeline:** `updateCommercialDeposit`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/deposits/:id",updateCommercialDeposit)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `paidAmount`, `dueDate`, `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-277 — GET /api/admin/hospitality-operations/transfers/dispatch

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 277 of 629<br>
**Route declaration pipeline:** `transferDispatch`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/transfers/dispatch",transferDispatch)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `date`, `from`, `to`, `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-278 — PATCH /api/admin/hospitality-operations/transfers/:id/assign

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 278 of 629<br>
**Route declaration pipeline:** `assignTransfer`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/transfers/:id/assign",assignTransfer)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `vehicleId`, `driverId`, `status`, `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-279 — PATCH /api/admin/hospitality-operations/transfers/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 279 of 629<br>
**Route declaration pipeline:** `updateTransferStatus`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/transfers/:id/status",updateTransferStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`, `delayMinutes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-280 — GET /api/admin/hospitality-operations/payments/reconciliation

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 280 of 629<br>
**Route declaration pipeline:** `paymentReconciliation`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/payments/reconciliation",paymentReconciliation)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`, `provider`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-281 — GET /api/admin/hospitality-operations/drivers

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 281 of 629<br>
**Route declaration pipeline:** `listDrivers`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/drivers",listDrivers)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-282 — GET /api/admin/hospitality-operations/vehicles

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityOperationsRoutes.js](../../server/routes/hospitalityOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityOperationsRoutes.md)<br>
**Mounted inventory entry:** 282 of 629<br>
**Route declaration pipeline:** `listVehicles`
**Router-wide middleware:** protect,managerOnly,ensureOpsAccess
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/vehicles",listVehicles)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-343 — GET /api/admin/operations

**Contract status:** SOURCE-TRACED<br>
**Router:** [operationsRoutes.js](../../server/routes/operationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/operationsRoutes.md)<br>
**Mounted inventory entry:** 343 of 629<br>
**Route declaration pipeline:** `getOperationsOverview`
**Router-wide middleware:** resolveTenant, protect, checkPermission("booking.manage"); "/module", operationsModuleRoutes
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission("booking.manage"

**Source declaration:**

```js
router.get("/", getOperationsOverview)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-344 — GET /api/admin/payment-gateways

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentGatewayRoutes.js](../../server/routes/paymentGatewayRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentGatewayRoutes.md)<br>
**Mounted inventory entry:** 344 of 629<br>
**Route declaration pipeline:** `listGatewayConfigs`
**Router-wide middleware:** resolveTenant, protect, authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.get("/", listGatewayConfigs)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-345 — GET /api/admin/payment-gateways/:provider

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentGatewayRoutes.js](../../server/routes/paymentGatewayRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentGatewayRoutes.md)<br>
**Mounted inventory entry:** 345 of 629<br>
**Route declaration pipeline:** `getGatewayConfig`
**Router-wide middleware:** resolveTenant, protect, authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.get("/:provider", getGatewayConfig)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `provider`; query parameters read: `environment`.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-346 — PUT /api/admin/payment-gateways/:provider

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentGatewayRoutes.js](../../server/routes/paymentGatewayRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentGatewayRoutes.md)<br>
**Mounted inventory entry:** 346 of 629<br>
**Route declaration pipeline:** `upsertGatewayConfig`
**Router-wide middleware:** resolveTenant, protect, authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.put("/:provider", upsertGatewayConfig)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `provider`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-347 — POST /api/admin/payment-gateways/MPESA/validate

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentGatewayRoutes.js](../../server/routes/paymentGatewayRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentGatewayRoutes.md)<br>
**Mounted inventory entry:** 347 of 629<br>
**Route declaration pipeline:** `rateLimit`, `validateMpesaGateway`
**Router-wide middleware:** resolveTenant, protect, authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.post("/MPESA/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), validateMpesaGateway)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `environment`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-348 — POST /api/admin/payment-gateways/STRIPE/validate

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentGatewayRoutes.js](../../server/routes/paymentGatewayRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentGatewayRoutes.md)<br>
**Mounted inventory entry:** 348 of 629<br>
**Route declaration pipeline:** `rateLimit`, `validateStripeGateway`
**Router-wide middleware:** resolveTenant, protect, authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.post("/STRIPE/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), validateStripeGateway)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-349 — POST /api/admin/payment-gateways/PAYPAL/validate

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentGatewayRoutes.js](../../server/routes/paymentGatewayRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentGatewayRoutes.md)<br>
**Mounted inventory entry:** 349 of 629<br>
**Route declaration pipeline:** `rateLimit`, `validatePaypalGateway`
**Router-wide middleware:** resolveTenant, protect, authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.post("/PAYPAL/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), validatePaypalGateway)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `environment`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-350 — DELETE /api/admin/payment-gateways/:provider

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentGatewayRoutes.js](../../server/routes/paymentGatewayRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentGatewayRoutes.md)<br>
**Mounted inventory entry:** 350 of 629<br>
**Route declaration pipeline:** `disableGatewayConfig`
**Router-wide middleware:** resolveTenant, protect, authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.delete("/:provider", disableGatewayConfig)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `provider`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-351 — GET /api/admin/payment-links/public/:token

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentLinkRoutes.js](../../server/routes/paymentLinkRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentLinkRoutes.md)<br>
**Mounted inventory entry:** 351 of 629<br>
**Route declaration pipeline:** `resolveTenant`, `getPaymentLink`
**Router-wide middleware:** resolveTenant, protect, authorize("finance.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("finance.manage"

**Source declaration:**

```js
router.get("/public/:token", resolveTenant, getPaymentLink)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `token`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-353 — GET /api/admin/payment-links

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentLinkRoutes.js](../../server/routes/paymentLinkRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentLinkRoutes.md)<br>
**Mounted inventory entry:** 353 of 629<br>
**Route declaration pipeline:** `listPaymentLinks`
**Router-wide middleware:** resolveTenant, protect, authorize("finance.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("finance.manage"

**Source declaration:**

```js
router.get("/", listPaymentLinks)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-355 — POST /api/admin/payment-links

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentLinkRoutes.js](../../server/routes/paymentLinkRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentLinkRoutes.md)<br>
**Mounted inventory entry:** 355 of 629<br>
**Route declaration pipeline:** `createPaymentLink`
**Router-wide middleware:** resolveTenant, protect, authorize("finance.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("finance.manage"

**Source declaration:**

```js
router.post("/", createPaymentLink)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `bookingId`, `amount`, `expiresAt`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `201`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-357 — POST /api/admin/payment-links/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentLinkRoutes.js](../../server/routes/paymentLinkRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentLinkRoutes.md)<br>
**Mounted inventory entry:** 357 of 629<br>
**Route declaration pipeline:** `cancelPaymentLink`
**Router-wide middleware:** resolveTenant, protect, authorize("finance.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("finance.manage"

**Source declaration:**

```js
router.post("/:id/cancel", cancelPaymentLink)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-382 — GET /api/admin/settings

**Contract status:** SOURCE-TRACED<br>
**Router:** [settingsRoutes.js](../../server/routes/settingsRoutes.js) · [route module explanation](../code-explanations/backend/routes/settingsRoutes.md)<br>
**Mounted inventory entry:** 382 of 629<br>
**Route declaration pipeline:** `getSettings`
**Router-wide middleware:** resolveTenant; protect; authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.get("/", getSettings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `data`, `scope`.

**Contract:** No path/query/body input. `getSettings` returns 200 `{success:true,data,settings,scope}`. In tenant context, `data` and `settings` contain tenant settings merged with organization profile overrides plus `tenantProfile`; `scope` is `tenant`. In tenant-bypass/platform context it returns platform settings with `scope:"platform"`. Missing setting records are initialized from defaults; tenant defaults are seeded from `Organization`. Reads include `SystemSetting`, and tenant profile resolution reads `Organization` plus the first matching admin `User`. Exceptions go to centralized error middleware. The mount requires resolved tenant context, JWT authentication, and `settings.manage`; no focused endpoint test was identified.

## endpoint-384 — PUT /api/admin/settings

**Contract status:** SOURCE-TRACED<br>
**Router:** [settingsRoutes.js](../../server/routes/settingsRoutes.js) · [route module explanation](../code-explanations/backend/routes/settingsRoutes.md)<br>
**Mounted inventory entry:** 384 of 629<br>
**Route declaration pipeline:** `updateSettings`
**Router-wide middleware:** resolveTenant; protect; authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.put("/", updateSettings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Contract:** The body is an allowlist of company/contact/location/currency/timezone, booking/tax/commission rates, payment-method flags and instructions, email/social/SEO fields, notifications, theme colors, typography, and homepage sections; unknown properties are dropped. String values are normalized (including currency uppercase and support email lowercase); numeric and boolean string values are coerced, and SEO keywords/homepage sections accept JSON strings. Colors must be six-digit hex; overlay is 0–100; tax/deposit/commission rates are 0–100; company name cannot be blank; support email and enabled cash/bank details are validated. Success is 200 `{success:true,message,data,settings,tenantProfile,scope}`. Tenant updates save `SystemSetting`, then separately update mapped `Organization` profile/brand fields; these writes are not transactional and later organization failure can follow a successful settings write. Validation returns 400 `{success:false,message}`; caught failures return `error.status || 500` with a public message. No multipart middleware is mounted here, so the controller's optional `req.file` logo path is not populated by this route. Permission is `settings.manage`; there is no dedicated endpoint test found.

## endpoint-500 — GET /api/admin/tax/rules

**Contract status:** SOURCE-TRACED<br>
**Router:** [taxRoutes.js](../../server/routes/taxRoutes.js) · [route module explanation](../code-explanations/backend/routes/taxRoutes.md)<br>
**Mounted inventory entry:** 500 of 629<br>
**Route declaration pipeline:** `authorize`, `listTaxRules`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/rules", authorize("finance.view"), listTaxRules)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-501 — POST /api/admin/tax/rules/initialize

**Contract status:** SOURCE-TRACED<br>
**Router:** [taxRoutes.js](../../server/routes/taxRoutes.js) · [route module explanation](../code-explanations/backend/routes/taxRoutes.md)<br>
**Mounted inventory entry:** 501 of 629<br>
**Route declaration pipeline:** `authorize`, `initializeTaxRules`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/rules/initialize", authorize("finance.manage"), initializeTaxRules)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-502 — PUT /api/admin/tax/rules/:code

**Contract status:** SOURCE-TRACED<br>
**Router:** [taxRoutes.js](../../server/routes/taxRoutes.js) · [route module explanation](../code-explanations/backend/routes/taxRoutes.md)<br>
**Mounted inventory entry:** 502 of 629<br>
**Route declaration pipeline:** `authorize`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.put("/rules/:code", authorize("finance.manage"), (req, res, next) => { req.body = { ...(req.body || {}), code: req.params.code }; return upsertTaxRule(req, res, next); })
```

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).

## endpoint-503 — POST /api/admin/tax/calculate

**Contract status:** SOURCE-TRACED<br>
**Router:** [taxRoutes.js](../../server/routes/taxRoutes.js) · [route module explanation](../code-explanations/backend/routes/taxRoutes.md)<br>
**Mounted inventory entry:** 503 of 629<br>
**Route declaration pipeline:** `authorize`, `calculateTaxQuote`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/calculate", authorize("finance.view"), calculateTaxQuote)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md). Endpoint-specific methods, validation order, transaction boundaries, response differences, and shared resource assignment behavior are documented there.

**Source-traced contract:** See [Admin tour management contracts](../API_DOMAIN_CONTRACTS/admin-tour-management.md).


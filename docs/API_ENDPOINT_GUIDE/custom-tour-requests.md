# API endpoints: custom-tour-requests

This guide contains 6 mounted method/path inventory entries in the **custom-tour-requests** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-215 — POST /api/custom-tour-requests

**Contract status:** SOURCE-TRACED<br>
**Router:** [customTourRequestRoutes.js](../../server/routes/customTourRequestRoutes.js) · [route module explanation](../code-explanations/backend/routes/customTourRequestRoutes.md)<br>
**Mounted inventory entry:** 215 of 629<br>
**Route declaration pipeline:** `optionalProtect`, `createCustomTourRequest`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** Optional authentication is visible; anonymous and authenticated branches must be checked in the handler.

**Source declaration:**

```js
router.post("/", optionalProtect, createCustomTourRequest)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `destination`, `durationDays`, `people`, `startDate`, `budget`, `requirements`, `pickupLocation`, `pickupDate`, `pickupTime`, `adults`, `children`, `accommodationPreference`, `mealPreference`, `transportPreference`, `emergencyContact`, `specialRequests`, `guestName`, `guestEmail`, `guestPhone`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `request`.




**Source-traced contract:** See [CRM statistics and custom-tour lifecycle](../API_DOMAIN_CONTRACTS/crm-stats.md) for the endpoint-specific behavior and verified limits.
## endpoint-216 — GET /api/custom-tour-requests/mine

**Contract status:** SOURCE-TRACED<br>
**Router:** [customTourRequestRoutes.js](../../server/routes/customTourRequestRoutes.js) · [route module explanation](../code-explanations/backend/routes/customTourRequestRoutes.md)<br>
**Mounted inventory entry:** 216 of 629<br>
**Route declaration pipeline:** `protect`, `getMyCustomTourRequests`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/mine", protect, getMyCustomTourRequests)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.




**Source-traced contract:** See [CRM statistics and custom-tour lifecycle](../API_DOMAIN_CONTRACTS/crm-stats.md) for the endpoint-specific behavior and verified limits.
## endpoint-217 — GET /api/custom-tour-requests/admin

**Contract status:** SOURCE-TRACED<br>
**Router:** [customTourRequestRoutes.js](../../server/routes/customTourRequestRoutes.js) · [route module explanation](../code-explanations/backend/routes/customTourRequestRoutes.md)<br>
**Mounted inventory entry:** 217 of 629<br>
**Route declaration pipeline:** `protect`, `adminMiddleware`, `getAdminCustomTourRequests`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/admin", protect, adminMiddleware, getAdminCustomTourRequests)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.




**Source-traced contract:** See [CRM statistics and custom-tour lifecycle](../API_DOMAIN_CONTRACTS/crm-stats.md) for the endpoint-specific behavior and verified limits.
## endpoint-218 — PATCH /api/custom-tour-requests/admin/:id/quote

**Contract status:** SOURCE-TRACED<br>
**Router:** [customTourRequestRoutes.js](../../server/routes/customTourRequestRoutes.js) · [route module explanation](../code-explanations/backend/routes/customTourRequestRoutes.md)<br>
**Mounted inventory entry:** 218 of 629<br>
**Route declaration pipeline:** `protect`, `adminMiddleware`, `quoteCustomTourRequest`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/admin/:id/quote", protect, adminMiddleware, quoteCustomTourRequest)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`, `quotedAmount`, `adminNotes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `request`.




**Source-traced contract:** See [CRM statistics and custom-tour lifecycle](../API_DOMAIN_CONTRACTS/crm-stats.md) for the endpoint-specific behavior and verified limits.
## endpoint-219 — PATCH /api/custom-tour-requests/admin/:id/assign

**Contract status:** SOURCE-TRACED<br>
**Router:** [customTourRequestRoutes.js](../../server/routes/customTourRequestRoutes.js) · [route module explanation](../code-explanations/backend/routes/customTourRequestRoutes.md)<br>
**Mounted inventory entry:** 219 of 629<br>
**Route declaration pipeline:** `protect`, `adminMiddleware`, `assignCustomTourResources`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/admin/:id/assign", protect, adminMiddleware, assignCustomTourResources)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guide`, `driver`, `agent`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `400`.
- JSON envelope keys observed: `success`, `message`, `request`.




**Source-traced contract:** See [CRM statistics and custom-tour lifecycle](../API_DOMAIN_CONTRACTS/crm-stats.md) for the endpoint-specific behavior and verified limits.
## endpoint-220 — POST /api/custom-tour-requests/:id/convert

**Contract status:** SOURCE-TRACED<br>
**Router:** [customTourRequestRoutes.js](../../server/routes/customTourRequestRoutes.js) · [route module explanation](../code-explanations/backend/routes/customTourRequestRoutes.md)<br>
**Mounted inventory entry:** 220 of 629<br>
**Route declaration pipeline:** `protect`, `convertCustomTourToBooking`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/:id/convert", protect, convertCustomTourToBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `booking`.




**Source-traced contract:** See [CRM statistics and custom-tour lifecycle](../API_DOMAIN_CONTRACTS/crm-stats.md) for the endpoint-specific behavior and verified limits.
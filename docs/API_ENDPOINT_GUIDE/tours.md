# API endpoints: tours

This guide contains 15 mounted method/path inventory entries in the **tours** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-585 — GET /api/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 585 of 629<br>
**Route declaration pipeline:** `getTours`
**Router-wide middleware:** none for this declaration; public routes are registered before protect/tourManagerOnly
**Authentication evidence:** No authentication middleware applies to this route; it is public. Global tenant resolution still runs, and the handler fails closed without tenant context unless platform bypass is intentional.

**Source declaration:**

```js
router.get("/", getTours)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`, `destination`, `category`, `featured`, `duration`, `travellers`, `sort`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-586 — GET /api/tours/featured

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 586 of 629<br>
**Route declaration pipeline:** `getFeaturedTours`
**Router-wide middleware:** none for this declaration; public routes are registered before protect/tourManagerOnly
**Authentication evidence:** No authentication middleware applies to this route; it is public. Global tenant resolution still runs, and the handler fails closed without tenant context unless platform bypass is intentional.

**Source declaration:**

```js
router.get("/featured", getFeaturedTours)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-587 — GET /api/tours/search

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 587 of 629<br>
**Route declaration pipeline:** `searchTours`
**Router-wide middleware:** none for this declaration; public routes are registered before protect/tourManagerOnly
**Authentication evidence:** No authentication middleware applies to this route; it is public. Global tenant resolution still runs, and the handler fails closed without tenant context unless platform bypass is intentional.

**Source declaration:**

```js
router.get("/search", searchTours)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `keyword`, `search`, `category`, `country`, `destination`, `page`, `limit`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-588 — GET /api/tours/slug/:slug

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 588 of 629<br>
**Route declaration pipeline:** `getTourBySlug`
**Router-wide middleware:** none for this declaration; public routes are registered before protect/tourManagerOnly
**Authentication evidence:** No authentication middleware applies to this route; it is public. Global tenant resolution still runs, and the handler fails closed without tenant context unless platform bypass is intentional.

**Source declaration:**

```js
router.get("/slug/:slug", getTourBySlug)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `slug`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-589 — GET /api/tours/:id/availability

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 589 of 629<br>
**Route declaration pipeline:** `getTourAvailability`
**Router-wide middleware:** none for this declaration; public routes are registered before protect/tourManagerOnly
**Authentication evidence:** No authentication middleware applies to this route; it is public. Global tenant resolution still runs, and the handler fails closed without tenant context unless platform bypass is intentional.

**Source declaration:**

```js
router.get("/:id/availability", getTourAvailability)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: `travelDate`.
- Literal HTTP statuses in handler: `404`, `400`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-590 — GET /api/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 590 of 629<br>
**Route declaration pipeline:** `getTourById`
**Router-wide middleware:** none for this declaration; public routes are registered before protect/tourManagerOnly
**Authentication evidence:** No authentication middleware applies to this route; it is public. Global tenant resolution still runs, and the handler fails closed without tenant context unless platform bypass is intentional.

**Source declaration:**

```js
router.get("/:id", getTourById)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-591 — GET /api/tours/manager

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 591 of 629<br>
**Route declaration pipeline:** `getManagerTours`
**Router-wide middleware:** protect; tourManagerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/manager", getManagerTours)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-592 — POST /api/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 592 of 629<br>
**Route declaration pipeline:** `validateTourCommand`, `createTour`
**Router-wide middleware:** protect; tourManagerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/", validateTourCommand(), upload.array("images", 10), createTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `assignedGuide`, `guide`, `assignedDriver`, `driver`, `assignedVehicle`, `vehicle`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-593 — PATCH /api/tours/:id/availability

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 593 of 629<br>
**Route declaration pipeline:** `updateTourAvailability`
**Router-wide middleware:** protect; tourManagerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/:id/availability", updateTourAvailability)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `totalSlots`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-594 — PUT /api/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 594 of 629<br>
**Route declaration pipeline:** `validateTourCommand`, `updateTour`
**Router-wide middleware:** protect; tourManagerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put("/:id", validateTourCommand({ allowPast: true }), upload.array("images", 10), updateTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `data`, `tour`.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-595 — DELETE /api/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 595 of 629<br>
**Route declaration pipeline:** `deleteTour`
**Router-wide middleware:** protect; tourManagerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.delete("/:id", deleteTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`, `data`, `bookingsAffected`.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-596 — PATCH /api/tours/:id/publication

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 596 of 629<br>
**Route declaration pipeline:** `setPublication`
**Router-wide middleware:** protect; tourManagerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/:id/publication", setPublication)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `published`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-597 — PUT /api/tours/:id/assign

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 597 of 629<br>
**Route declaration pipeline:** `assignTourResourcesSafe`
**Router-wide middleware:** protect; tourManagerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put("/:id/assign", assignTourResourcesSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-598 — PATCH /api/tours/:id/assign-vehicle

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 598 of 629<br>
**Route declaration pipeline:** `assignTourResourcesSafe`
**Router-wide middleware:** protect; tourManagerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/:id/assign-vehicle", assignTourResourcesSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-599 — PATCH /api/tours/:id/remove-vehicle

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourRoutes.js](../../server/routes/tourRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourRoutes.md)<br>
**Mounted inventory entry:** 599 of 629<br>
**Route declaration pipeline:** inline callback
**Router-wide middleware:** protect; tourManagerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/:id/remove-vehicle", (req, res, next) => { req.body = { ...(req.body || {}), vehicleId: null }; return assignTourResourcesSafe(req, res, next); })
```

**Source-traced behavior:** See [Public and manager tour catalogue API contracts](../API_DOMAIN_CONTRACTS/tour-catalogue.md) for visibility filters, tenant scope, query normalization, tour CRUD, assignment and lifecycle behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


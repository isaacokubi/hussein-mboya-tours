# API endpoints: tourmanager

This guide contains 34 mounted method/path inventory entries in the **tourmanager** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-516 — GET /api/tourmanager/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 516 of 629<br>
**Route declaration pipeline:** `getTourManagerDashboard`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/dashboard", getTourManagerDashboard)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [Tour manager dashboard contract](../API_DOMAIN_CONTRACTS/tour-manager-dashboard.md) for the shared `/tourmanager` and `/tour-manager` aliases, tenant scope, dashboard aggregation, revenue source, result shaping and response schema.
**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-518 — GET /api/tourmanager/copilot/summary

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 518 of 629<br>
**Route declaration pipeline:** `getOperationsCopilotSummary`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/copilot/summary", getOperationsCopilotSummary)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [Tour Manager Operations Copilot API contracts](../API_DOMAIN_CONTRACTS/operations-copilot.md) for tenant scope, calculations, request validation, preview-only behavior and test evidence.
**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-520 — POST /api/tourmanager/copilot/quote-draft

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 520 of 629<br>
**Route declaration pipeline:** `createOperationsQuoteDraft`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.post("/copilot/quote-draft", createOperationsQuoteDraft)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `tourId`, `travelerCount`, `discountPercent`, `taxPercent`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [Tour Manager Operations Copilot API contracts](../API_DOMAIN_CONTRACTS/operations-copilot.md) for tenant scope, calculations, request validation, preview-only behavior and test evidence.
**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-522 — GET /api/tourmanager/calendar/reminders

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 522 of 629<br>
**Route declaration pipeline:** `listCalendarReminders`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/calendar/reminders", listCalendarReminders)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `start`, `end`.
- Literal HTTP statuses in handler: `400`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-524 — POST /api/tourmanager/calendar/reminders

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 524 of 629<br>
**Route declaration pipeline:** `createCalendarReminder`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.post("/calendar/reminders", createCalendarReminder)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `date`, `title`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-526 — DELETE /api/tourmanager/calendar/reminders/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 526 of 629<br>
**Route declaration pipeline:** `deleteCalendarReminder`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.delete("/calendar/reminders/:id", deleteCalendarReminder)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-528 — GET /api/tourmanager/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 528 of 629<br>
**Route declaration pipeline:** `getTours`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/tours", getTours)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `upcoming`, `page`, `limit`, `status`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [Tour Manager API contracts](../API_DOMAIN_CONTRACTS/tour-manager.md) for tenant scope, query filtering, pagination, populated resources and response shape.
**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-530 — POST /api/tourmanager/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 530 of 629<br>
**Route declaration pipeline:** `validateFutureTourDate`, `validateTourCommand`, `createTour`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.post("/tours", validateFutureTourDate, validateTourCommand(), createTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `assignedGuide`, `guide`, `assignedDriver`, `driver`, `assignedVehicle`, `vehicle`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-532 — PUT /api/tourmanager/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 532 of 629<br>
**Route declaration pipeline:** `validateTourCommand`, `updateTour`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.put("/tours/:id", validateTourCommand(), updateTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `data`, `tour`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-534 — DELETE /api/tourmanager/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 534 of 629<br>
**Route declaration pipeline:** `deleteTour`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.delete("/tours/:id", deleteTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`, `data`, `bookingsAffected`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-536 — PATCH /api/tourmanager/tours/:id/publication

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 536 of 629<br>
**Route declaration pipeline:** `setPublication`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/tours/:id/publication", setPublication)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `published`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-538 — PUT /api/tourmanager/tours/:id/assign

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 538 of 629<br>
**Route declaration pipeline:** `validateTourAssignmentTenant`, `assignTourResourcesSafe`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.put("/tours/:id/assign", validateTourAssignmentTenant, assignTourResourcesSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-540 — PATCH /api/tourmanager/tours/:id/complete

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 540 of 629<br>
**Route declaration pipeline:** `completeTour`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/tours/:id/complete", completeTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-542 — PATCH /api/tourmanager/tours/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 542 of 629<br>
**Route declaration pipeline:** `cancelTour`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/tours/:id/cancel", cancelTour)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `message`, `data`, `bookingsAffected`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-544 — PUT /api/tourmanager/assign-resources/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 544 of 629<br>
**Route declaration pipeline:** `validateTourAssignmentTenant`, `assignTourResourcesSafe`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.put("/assign-resources/:id", validateTourAssignmentTenant, assignTourResourcesSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-546 — POST /api/tourmanager/assign-guide

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 546 of 629<br>
**Route declaration pipeline:** `validateTourAssignmentTenant`, `assignTourResourcesSafe`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.post("/assign-guide", (req, res, next) => { req.params.id = req.body?.tourId; next(); }, validateTourAssignmentTenant, assignTourResourcesSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-548 — POST /api/tourmanager/itineraries

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 548 of 629<br>
**Route declaration pipeline:** `createItinerary`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.post("/itineraries", createItinerary)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `tour`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `itinerary`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-550 — GET /api/tourmanager/itineraries

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 550 of 629<br>
**Route declaration pipeline:** `getItineraries`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/itineraries", getItineraries)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `tour`, `status`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-552 — GET /api/tourmanager/itineraries/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 552 of 629<br>
**Route declaration pipeline:** `getItinerary`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/itineraries/:id", getItinerary)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-554 — PUT /api/tourmanager/itineraries/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 554 of 629<br>
**Route declaration pipeline:** `updateItinerary`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.put("/itineraries/:id", updateItinerary)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `tour`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-556 — DELETE /api/tourmanager/itineraries/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 556 of 629<br>
**Route declaration pipeline:** `deleteItinerary`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.delete("/itineraries/:id", deleteItinerary)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-558 — GET /api/tourmanager/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 558 of 629<br>
**Route declaration pipeline:** `getTourManagerBookings`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/bookings", getTourManagerBookings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `paymentStatus`, `search`, `tour`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `pages`, `count`, `bookings`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-560 — PATCH /api/tourmanager/bookings/:id/complete

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 560 of 629<br>
**Route declaration pipeline:** `completeBookingAndMaybeRelease`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/bookings/:id/complete", completeBookingAndMaybeRelease)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-562 — PUT /api/tourmanager/bookings/:id/complete

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 562 of 629<br>
**Route declaration pipeline:** `completeBookingAndMaybeRelease`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.put("/bookings/:id/complete", completeBookingAndMaybeRelease)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-564 — PATCH /api/tourmanager/bookings/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 564 of 629<br>
**Route declaration pipeline:** `cancelBookingAndUpdateCapacity`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.patch("/bookings/:id/cancel", cancelBookingAndUpdateCapacity)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-566 — POST /api/tourmanager/bookings/:id/notify

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 566 of 629<br>
**Route declaration pipeline:** `sendBookingNotification`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.post("/bookings/:id/notify", sendBookingNotification)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `type`, `channel`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-568 — PUT /api/tourmanager/bookings/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 568 of 629<br>
**Route declaration pipeline:** `cancelBookingAndUpdateCapacity`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.put("/bookings/:id/cancel", cancelBookingAndUpdateCapacity)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-570 — GET /api/tourmanager/customers

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 570 of 629<br>
**Route declaration pipeline:** `getTenantCustomers`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/customers", getTenantCustomers)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `search`, `page`, `limit`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-572 — GET /api/tourmanager/guides

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 572 of 629<br>
**Route declaration pipeline:** `getTenantGuides`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/guides", getTenantGuides)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-574 — GET /api/tourmanager/drivers

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 574 of 629<br>
**Route declaration pipeline:** `getTenantDrivers`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/drivers", getTenantDrivers)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-576 — GET /api/tourmanager/vehicles

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 576 of 629<br>
**Route declaration pipeline:** `getTenantVehicles`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/vehicles", getTenantVehicles)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-578 — GET /api/tourmanager/reports

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 578 of 629<br>
**Route declaration pipeline:** `getTourReports`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/reports", getTourReports)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-580 — GET /api/tourmanager/tours/:id/availability

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 580 of 629<br>
**Route declaration pipeline:** `getTourAvailability`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.get("/tours/:id/availability", getTourAvailability)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: `travelDate`.
- Literal HTTP statuses in handler: `404`, `400`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-582 — PUT /api/tourmanager/tours/:id/availability

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 582 of 629<br>
**Route declaration pipeline:** `updateTourAvailability`
**Router-wide middleware:** protect; resolveTenant; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.put("/tours/:id/availability", updateTourAvailability)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `totalSlots`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


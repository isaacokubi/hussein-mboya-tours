# API endpoints: tour-manager

This guide contains 34 mounted method/path inventory entries in the **tour-manager** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-517 — GET /api/tour-manager/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 517 of 629<br>
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

**Source-traced contract:** See [Tour manager dashboard contract](../API_DOMAIN_CONTRACTS/tour-manager-dashboard.md), including the shared `/tourmanager` mount alias and its tenant-scoped aggregation and formatting behavior.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-519 — GET /api/tour-manager/copilot/summary

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 519 of 629<br>
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

## endpoint-521 — POST /api/tour-manager/copilot/quote-draft

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 521 of 629<br>
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

## endpoint-523 — GET /api/tour-manager/calendar/reminders

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 523 of 629<br>
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

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-525 — POST /api/tour-manager/calendar/reminders

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 525 of 629<br>
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

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-527 — DELETE /api/tour-manager/calendar/reminders/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 527 of 629<br>
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

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-529 — GET /api/tour-manager/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 529 of 629<br>
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

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-531 — POST /api/tour-manager/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 531 of 629<br>
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

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Source-traced behavior:** See [Tour Manager API contracts (both tenant aliases)](../API_DOMAIN_CONTRACTS/tour-manager.md) for shared routing, role/tenant scope, handler behavior, response shapes, transaction boundaries and known operational caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-533 — PUT /api/tour-manager/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 533 of 629<br>
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

## endpoint-535 — DELETE /api/tour-manager/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 535 of 629<br>
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

## endpoint-537 — PATCH /api/tour-manager/tours/:id/publication

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 537 of 629<br>
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

## endpoint-539 — PUT /api/tour-manager/tours/:id/assign

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 539 of 629<br>
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

## endpoint-541 — PATCH /api/tour-manager/tours/:id/complete

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 541 of 629<br>
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

## endpoint-543 — PATCH /api/tour-manager/tours/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 543 of 629<br>
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

## endpoint-545 — PUT /api/tour-manager/assign-resources/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 545 of 629<br>
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

## endpoint-547 — POST /api/tour-manager/assign-guide

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 547 of 629<br>
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

## endpoint-549 — POST /api/tour-manager/itineraries

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 549 of 629<br>
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

## endpoint-551 — GET /api/tour-manager/itineraries

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 551 of 629<br>
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

## endpoint-553 — GET /api/tour-manager/itineraries/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 553 of 629<br>
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

## endpoint-555 — PUT /api/tour-manager/itineraries/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 555 of 629<br>
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

## endpoint-557 — DELETE /api/tour-manager/itineraries/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 557 of 629<br>
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

## endpoint-559 — GET /api/tour-manager/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 559 of 629<br>
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

## endpoint-561 — PATCH /api/tour-manager/bookings/:id/complete

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 561 of 629<br>
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

## endpoint-563 — PUT /api/tour-manager/bookings/:id/complete

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 563 of 629<br>
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

## endpoint-565 — PATCH /api/tour-manager/bookings/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 565 of 629<br>
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

## endpoint-567 — POST /api/tour-manager/bookings/:id/notify

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 567 of 629<br>
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

## endpoint-569 — PUT /api/tour-manager/bookings/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 569 of 629<br>
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

## endpoint-571 — GET /api/tour-manager/customers

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 571 of 629<br>
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

## endpoint-573 — GET /api/tour-manager/guides

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 573 of 629<br>
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

## endpoint-575 — GET /api/tour-manager/drivers

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 575 of 629<br>
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

## endpoint-577 — GET /api/tour-manager/vehicles

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 577 of 629<br>
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

## endpoint-579 — GET /api/tour-manager/reports

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 579 of 629<br>
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

## endpoint-581 — GET /api/tour-manager/tours/:id/availability

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 581 of 629<br>
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

## endpoint-583 — PUT /api/tour-manager/tours/:id/availability

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourManagerRoutes.js](../../server/routes/tourManagerRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourManagerRoutes.md)<br>
**Mounted inventory entry:** 583 of 629<br>
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


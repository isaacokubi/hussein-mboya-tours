# API endpoints: operations

This guide contains 8 mounted method/path inventory entries in the **operations** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-606 — GET /api/operations

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelOperationsRoutes.js](../../server/routes/travelOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelOperationsRoutes.md)<br>
**Mounted inventory entry:** 606 of 629<br>
**Route declaration pipeline:** `listOperations`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", listOperations)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-607 — POST /api/operations

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelOperationsRoutes.js](../../server/routes/travelOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelOperationsRoutes.md)<br>
**Mounted inventory entry:** 607 of 629<br>
**Route declaration pipeline:** `managerOnly`, `createOperation`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.post("/", managerOnly, createOperation)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `type`, `name`, `startAt`, `endAt`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-608 — PATCH /api/operations/:id

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelOperationsRoutes.js](../../server/routes/travelOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelOperationsRoutes.md)<br>
**Mounted inventory entry:** 608 of 629<br>
**Route declaration pipeline:** `managerOnly`, `updateOperation`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.patch("/:id", managerOnly, updateOperation)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-609 — DELETE /api/operations/:id

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelOperationsRoutes.js](../../server/routes/travelOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelOperationsRoutes.md)<br>
**Mounted inventory entry:** 609 of 629<br>
**Route declaration pipeline:** `managerOnly`, `deleteOperation`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.delete("/:id", managerOnly, deleteOperation)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-610 — GET /api/operations/rules/list

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelOperationsRoutes.js](../../server/routes/travelOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelOperationsRoutes.md)<br>
**Mounted inventory entry:** 610 of 629<br>
**Route declaration pipeline:** `listRules`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/rules/list", listRules)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `type`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-611 — POST /api/operations/rules

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelOperationsRoutes.js](../../server/routes/travelOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelOperationsRoutes.md)<br>
**Mounted inventory entry:** 611 of 629<br>
**Route declaration pipeline:** `managerOnly`, `createRule`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.post("/rules", managerOnly, createRule)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `type`, `name`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-612 — PATCH /api/operations/rules/:id

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelOperationsRoutes.js](../../server/routes/travelOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelOperationsRoutes.md)<br>
**Mounted inventory entry:** 612 of 629<br>
**Route declaration pipeline:** `managerOnly`, `updateRule`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.patch("/rules/:id", managerOnly, updateRule)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-613 — DELETE /api/operations/rules/:id

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelOperationsRoutes.js](../../server/routes/travelOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelOperationsRoutes.md)<br>
**Mounted inventory entry:** 613 of 629<br>
**Route declaration pipeline:** `managerOnly`, `deleteRule`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.delete("/rules/:id", managerOnly, deleteRule)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


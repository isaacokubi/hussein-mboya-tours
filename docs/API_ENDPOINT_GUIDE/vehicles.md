# API endpoints: vehicles

This guide contains 9 mounted method/path inventory entries in the **vehicles** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-618 — POST /api/vehicles

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [vehicleRoutes.js](../../server/routes/vehicleRoutes.js) · [route module explanation](../code-explanations/backend/routes/vehicleRoutes.md)<br>
**Mounted inventory entry:** 618 of 629<br>
**Route declaration pipeline:** `managerOnly`, `createVehicle`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.post("/", managerOnly, upload.single("image"), createVehicle)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `capacity`, `year`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `field`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-619 — PUT /api/vehicles/:id

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [vehicleRoutes.js](../../server/routes/vehicleRoutes.js) · [route module explanation](../code-explanations/backend/routes/vehicleRoutes.md)<br>
**Mounted inventory entry:** 619 of 629<br>
**Route declaration pipeline:** `managerOnly`, `updateVehicle`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.put("/:id", managerOnly, upload.single("image"), updateVehicle)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `field`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-620 — DELETE /api/vehicles/:id

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [vehicleRoutes.js](../../server/routes/vehicleRoutes.js) · [route module explanation](../code-explanations/backend/routes/vehicleRoutes.md)<br>
**Mounted inventory entry:** 620 of 629<br>
**Route declaration pipeline:** `managerOnly`, `deleteVehicle`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.delete("/:id", managerOnly, deleteVehicle)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-621 — GET /api/vehicles

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [vehicleRoutes.js](../../server/routes/vehicleRoutes.js) · [route module explanation](../code-explanations/backend/routes/vehicleRoutes.md)<br>
**Mounted inventory entry:** 621 of 629<br>
**Route declaration pipeline:** `vehicleReadOnly`, `getVehicles`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", vehicleReadOnly, getVehicles)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-622 — GET /api/vehicles/:id

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [vehicleRoutes.js](../../server/routes/vehicleRoutes.js) · [route module explanation](../code-explanations/backend/routes/vehicleRoutes.md)<br>
**Mounted inventory entry:** 622 of 629<br>
**Route declaration pipeline:** `vehicleReadOnly`, `getVehicle`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/:id", vehicleReadOnly, getVehicle)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-623 — PUT /api/vehicles/:id/assign-driver

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [vehicleRoutes.js](../../server/routes/vehicleRoutes.js) · [route module explanation](../code-explanations/backend/routes/vehicleRoutes.md)<br>
**Mounted inventory entry:** 623 of 629<br>
**Route declaration pipeline:** `managerOnly`, `assignVehicleDriver`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.put("/:id/assign-driver", managerOnly, assignVehicleDriver)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `driverId`, `driver`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-624 — PUT /api/vehicles/:id/remove-driver

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [vehicleRoutes.js](../../server/routes/vehicleRoutes.js) · [route module explanation](../code-explanations/backend/routes/vehicleRoutes.md)<br>
**Mounted inventory entry:** 624 of 629<br>
**Route declaration pipeline:** `managerOnly`, `removeVehicleDriver`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.put("/:id/remove-driver", managerOnly, removeVehicleDriver)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-625 — PUT /api/vehicles/:id/status

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [vehicleRoutes.js](../../server/routes/vehicleRoutes.js) · [route module explanation](../code-explanations/backend/routes/vehicleRoutes.md)<br>
**Mounted inventory entry:** 625 of 629<br>
**Route declaration pipeline:** `managerOnly`, `updateVehicleStatus`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.put("/:id/status", managerOnly, updateVehicleStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-626 — PATCH /api/vehicles/:id/restore

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [vehicleRoutes.js](../../server/routes/vehicleRoutes.js) · [route module explanation](../code-explanations/backend/routes/vehicleRoutes.md)<br>
**Mounted inventory entry:** 626 of 629<br>
**Route declaration pipeline:** `adminOnly`, `restoreVehicle`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** adminOnly`

**Source declaration:**

```js
router.patch("/:id/restore", adminOnly, restoreVehicle)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


# API endpoints: staff

This guide contains 8 mounted method/path inventory entries in the **staff** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-386 — GET /api/staff/guides

**Contract status:** SOURCE-TRACED<br>
**Router:** [staffRoutes.js](../../server/routes/staffRoutes.js) · [route module explanation](../code-explanations/backend/routes/staffRoutes.md)<br>
**Mounted inventory entry:** 386 of 629<br>
**Route declaration pipeline:** `managerOnly`, `getGuides`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.get("/guides", managerOnly, getGuides)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.

**Source-traced behavior:** See [staff and operational personnel contracts](../API_DOMAIN_CONTRACTS/staff-management.md) for request fields, role gate, tenant filters, persistence, responses, errors, callers, tests and per-alias behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-387 — GET /api/staff/drivers

**Contract status:** SOURCE-TRACED<br>
**Router:** [staffRoutes.js](../../server/routes/staffRoutes.js) · [route module explanation](../code-explanations/backend/routes/staffRoutes.md)<br>
**Mounted inventory entry:** 387 of 629<br>
**Route declaration pipeline:** `managerOnly`, `getDrivers`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.get("/drivers", managerOnly, getDrivers)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.

**Source-traced behavior:** See [staff and operational personnel contracts](../API_DOMAIN_CONTRACTS/staff-management.md) for request fields, role gate, tenant filters, persistence, responses, errors, callers, tests and per-alias behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-388 — POST /api/staff

**Contract status:** SOURCE-TRACED<br>
**Router:** [staffRoutes.js](../../server/routes/staffRoutes.js) · [route module explanation](../code-explanations/backend/routes/staffRoutes.md)<br>
**Mounted inventory entry:** 388 of 629<br>
**Route declaration pipeline:** `adminOnly`, `createStaff`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** adminOnly`

**Source declaration:**

```js
router.post("/", adminOnly, createStaff)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [staff and operational personnel contracts](../API_DOMAIN_CONTRACTS/staff-management.md) for request fields, role gate, tenant filters, persistence, responses, errors, callers, tests and per-alias behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-389 — GET /api/staff

**Contract status:** SOURCE-TRACED<br>
**Router:** [staffRoutes.js](../../server/routes/staffRoutes.js) · [route module explanation](../code-explanations/backend/routes/staffRoutes.md)<br>
**Mounted inventory entry:** 389 of 629<br>
**Route declaration pipeline:** `managerOnly`, `getStaff`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.get("/", managerOnly, getStaff)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `includeInactive`, `position`, `availability`, `status`, `search`, `page`, `limit`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [staff and operational personnel contracts](../API_DOMAIN_CONTRACTS/staff-management.md) for request fields, role gate, tenant filters, persistence, responses, errors, callers, tests and per-alias behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-390 — GET /api/staff/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [staffRoutes.js](../../server/routes/staffRoutes.js) · [route module explanation](../code-explanations/backend/routes/staffRoutes.md)<br>
**Mounted inventory entry:** 390 of 629<br>
**Route declaration pipeline:** `managerOnly`, `getStaffById`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.get("/:id", managerOnly, getStaffById)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [staff and operational personnel contracts](../API_DOMAIN_CONTRACTS/staff-management.md) for request fields, role gate, tenant filters, persistence, responses, errors, callers, tests and per-alias behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-391 — PUT /api/staff/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [staffRoutes.js](../../server/routes/staffRoutes.js) · [route module explanation](../code-explanations/backend/routes/staffRoutes.md)<br>
**Mounted inventory entry:** 391 of 629<br>
**Route declaration pipeline:** `adminOnly`, `updateStaff`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** adminOnly`

**Source declaration:**

```js
router.put("/:id/status", adminOnly, updateStaff)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `email`, `phone`, `role`, `position`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [staff and operational personnel contracts](../API_DOMAIN_CONTRACTS/staff-management.md) for request fields, role gate, tenant filters, persistence, responses, errors, callers, tests and per-alias behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-392 — PUT /api/staff/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [staffRoutes.js](../../server/routes/staffRoutes.js) · [route module explanation](../code-explanations/backend/routes/staffRoutes.md)<br>
**Mounted inventory entry:** 392 of 629<br>
**Route declaration pipeline:** `adminOnly`, `updateStaff`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** adminOnly`

**Source declaration:**

```js
router.put("/:id", adminOnly, updateStaff)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `email`, `phone`, `role`, `position`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced behavior:** See [staff and operational personnel contracts](../API_DOMAIN_CONTRACTS/staff-management.md) for request fields, role gate, tenant filters, persistence, responses, errors, callers, tests and per-alias behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-393 — DELETE /api/staff/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [staffRoutes.js](../../server/routes/staffRoutes.js) · [route module explanation](../code-explanations/backend/routes/staffRoutes.md)<br>
**Mounted inventory entry:** 393 of 629<br>
**Route declaration pipeline:** `adminOnly`, `deleteStaff`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** adminOnly`

**Source declaration:**

```js
router.delete("/:id", adminOnly, deleteStaff)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [staff and operational personnel contracts](../API_DOMAIN_CONTRACTS/staff-management.md) for request fields, role gate, tenant filters, persistence, responses, errors, callers, tests and per-alias behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


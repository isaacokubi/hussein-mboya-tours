# API endpoints: driver

This guide contains 5 mounted method/path inventory entries in the **driver** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-239 — GET /api/driver/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [driverRoutes.js](../../server/routes/driverRoutes.js) · [route module explanation](../code-explanations/backend/routes/driverRoutes.md)<br>
**Mounted inventory entry:** 239 of 629<br>
**Route declaration pipeline:** `driverDashboard`
**Router-wide middleware:** protect; resolveTenant; driverOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** driverOnly

**Source declaration:**

```js
router.get("/dashboard", driverDashboard)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [driver operations contracts](../API_DOMAIN_CONTRACTS/driver-operations.md) for implementation behavior.
## endpoint-240 — GET /api/driver/assigned-tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [driverRoutes.js](../../server/routes/driverRoutes.js) · [route module explanation](../code-explanations/backend/routes/driverRoutes.md)<br>
**Mounted inventory entry:** 240 of 629<br>
**Route declaration pipeline:** `getAssignedTours`
**Router-wide middleware:** protect; resolveTenant; driverOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** driverOnly

**Source declaration:**

```js
router.get("/assigned-tours", getAssignedTours)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `count`, `tours`, `data`.


**Source-traced contract:** See [driver operations contracts](../API_DOMAIN_CONTRACTS/driver-operations.md) for implementation behavior.
## endpoint-241 — GET /api/driver/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [driverRoutes.js](../../server/routes/driverRoutes.js) · [route module explanation](../code-explanations/backend/routes/driverRoutes.md)<br>
**Mounted inventory entry:** 241 of 629<br>
**Route declaration pipeline:** `getTourDetails`
**Router-wide middleware:** protect; resolveTenant; driverOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** driverOnly

**Source declaration:**

```js
router.get("/tours/:id", getTourDetails)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [driver operations contracts](../API_DOMAIN_CONTRACTS/driver-operations.md) for implementation behavior.
## endpoint-242 — GET /api/driver/tours/:id/guests

**Contract status:** SOURCE-TRACED<br>
**Router:** [driverRoutes.js](../../server/routes/driverRoutes.js) · [route module explanation](../code-explanations/backend/routes/driverRoutes.md)<br>
**Mounted inventory entry:** 242 of 629<br>
**Route declaration pipeline:** `getTourGuests`
**Router-wide middleware:** protect; resolveTenant; driverOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** driverOnly

**Source declaration:**

```js
router.get("/tours/:id/guests", getTourGuests)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `403`.
- JSON envelope keys observed: `success`, `message`, `count`, `guests`, `data`.


**Source-traced contract:** See [driver operations contracts](../API_DOMAIN_CONTRACTS/driver-operations.md) for implementation behavior.
## endpoint-243 — PUT /api/driver/tours/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [driverRoutes.js](../../server/routes/driverRoutes.js) · [route module explanation](../code-explanations/backend/routes/driverRoutes.md)<br>
**Mounted inventory entry:** 243 of 629<br>
**Route declaration pipeline:** `updateTourStatus`
**Router-wide middleware:** protect; resolveTenant; driverOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** driverOnly

**Source declaration:**

```js
router.put("/tours/:id/status", updateTourStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [driver operations contracts](../API_DOMAIN_CONTRACTS/driver-operations.md) for implementation behavior.
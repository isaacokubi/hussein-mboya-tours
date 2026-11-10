# API endpoints: guide

This guide contains 6 mounted method/path inventory entries in the **guide** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-253 — GET /api/guide/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [guideRoutes.js](../../server/routes/guideRoutes.js) · [route module explanation](../code-explanations/backend/routes/guideRoutes.md)<br>
**Mounted inventory entry:** 253 of 629<br>
**Route declaration pipeline:** `guideDashboard`
**Router-wide middleware:** protect; resolveTenant; guideOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** guideOnly

**Source declaration:**

```js
router.get("/dashboard", guideDashboard)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.


**Source-traced contract:** See [guide operations](../API_DOMAIN_CONTRACTS/guide-operations.md) for detailed behavior and model interaction.
## endpoint-254 — GET /api/guide/assigned-tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [guideRoutes.js](../../server/routes/guideRoutes.js) · [route module explanation](../code-explanations/backend/routes/guideRoutes.md)<br>
**Mounted inventory entry:** 254 of 629<br>
**Route declaration pipeline:** `getAssignedTours`
**Router-wide middleware:** protect; resolveTenant; guideOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** guideOnly

**Source declaration:**

```js
router.get("/assigned-tours", getAssignedTours)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.


**Source-traced contract:** See [guide operations](../API_DOMAIN_CONTRACTS/guide-operations.md) for detailed behavior and model interaction.
## endpoint-255 — GET /api/guide/tours/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [guideRoutes.js](../../server/routes/guideRoutes.js) · [route module explanation](../code-explanations/backend/routes/guideRoutes.md)<br>
**Mounted inventory entry:** 255 of 629<br>
**Route declaration pipeline:** `getTourDetails`
**Router-wide middleware:** protect; resolveTenant; guideOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** guideOnly

**Source declaration:**

```js
router.get("/tours/:id", getTourDetails)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [guide operations](../API_DOMAIN_CONTRACTS/guide-operations.md) for detailed behavior and model interaction.
## endpoint-256 — GET /api/guide/tours/:id/guests

**Contract status:** SOURCE-TRACED<br>
**Router:** [guideRoutes.js](../../server/routes/guideRoutes.js) · [route module explanation](../code-explanations/backend/routes/guideRoutes.md)<br>
**Mounted inventory entry:** 256 of 629<br>
**Route declaration pipeline:** `getTourGuests`
**Router-wide middleware:** protect; resolveTenant; guideOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** guideOnly

**Source declaration:**

```js
router.get("/tours/:id/guests", getTourGuests)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`, `guests`, `data`.


**Source-traced contract:** See [guide operations](../API_DOMAIN_CONTRACTS/guide-operations.md) for detailed behavior and model interaction.
## endpoint-257 — PUT /api/guide/tours/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [guideRoutes.js](../../server/routes/guideRoutes.js) · [route module explanation](../code-explanations/backend/routes/guideRoutes.md)<br>
**Mounted inventory entry:** 257 of 629<br>
**Route declaration pipeline:** `updateTourStatus`
**Router-wide middleware:** protect; resolveTenant; guideOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** guideOnly

**Source declaration:**

```js
router.put("/tours/:id/status", updateTourStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [guide operations](../API_DOMAIN_CONTRACTS/guide-operations.md) for detailed behavior and model interaction.
## endpoint-258 — POST /api/guide/tours/:id/report

**Contract status:** SOURCE-TRACED<br>
**Router:** [guideRoutes.js](../../server/routes/guideRoutes.js) · [route module explanation](../code-explanations/backend/routes/guideRoutes.md)<br>
**Mounted inventory entry:** 258 of 629<br>
**Route declaration pipeline:** `submitTourReport`
**Router-wide middleware:** protect; resolveTenant; guideOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** guideOnly

**Source declaration:**

```js
router.post("/tours/:id/report", submitTourReport)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `summary`, `issues`, `photos`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `201`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [guide operations](../API_DOMAIN_CONTRACTS/guide-operations.md) for detailed behavior and model interaction.
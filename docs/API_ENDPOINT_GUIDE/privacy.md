# API endpoints: privacy

This guide contains 4 mounted method/path inventory entries in the **privacy** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-362 — POST /api/privacy/requests

**Contract status:** SOURCE-TRACED<br>
**Router:** [privacyRoutes.js](../../server/routes/privacyRoutes.js) · [route module explanation](../code-explanations/backend/routes/privacyRoutes.md)<br>
**Mounted inventory entry:** 362 of 629<br>
**Route declaration pipeline:** `publicLimiter`, `createPrivacyRequest`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/requests", publicLimiter, createPrivacyRequest)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `type`, `requesterName`, `customer`, `requesterEmail`, `requesterPhone`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [privacy request contracts](../API_DOMAIN_CONTRACTS/privacy-requests.md) for validation, transitions and operational limitations.
## endpoint-363 — GET /api/privacy/admin/requests

**Contract status:** SOURCE-TRACED<br>
**Router:** [privacyRoutes.js](../../server/routes/privacyRoutes.js) · [route module explanation](../code-explanations/backend/routes/privacyRoutes.md)<br>
**Mounted inventory entry:** 363 of 629<br>
**Route declaration pipeline:** `protect`, `authorize`, `listPrivacyRequests`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/admin/requests", protect, authorize("finance.view"), listPrivacyRequests)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.


**Source-traced contract:** See [privacy request contracts](../API_DOMAIN_CONTRACTS/privacy-requests.md) for validation, transitions and operational limitations.
## endpoint-364 — GET /api/privacy/admin/summary

**Contract status:** SOURCE-TRACED<br>
**Router:** [privacyRoutes.js](../../server/routes/privacyRoutes.js) · [route module explanation](../code-explanations/backend/routes/privacyRoutes.md)<br>
**Mounted inventory entry:** 364 of 629<br>
**Route declaration pipeline:** `protect`, `authorize`, `getPrivacyComplianceSummary`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/admin/summary", protect, authorize("finance.view"), getPrivacyComplianceSummary)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.


**Source-traced contract:** See [privacy request contracts](../API_DOMAIN_CONTRACTS/privacy-requests.md) for validation, transitions and operational limitations.
## endpoint-365 — PATCH /api/privacy/admin/requests/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [privacyRoutes.js](../../server/routes/privacyRoutes.js) · [route module explanation](../code-explanations/backend/routes/privacyRoutes.md)<br>
**Mounted inventory entry:** 365 of 629<br>
**Route declaration pipeline:** `protect`, `authorize`, `updatePrivacyRequest`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.patch("/admin/requests/:id", protect, authorize("finance.manage"), updatePrivacyRequest)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`, `assignedTo`, `resolutionNotes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.


**Source-traced contract:** See [privacy request contracts](../API_DOMAIN_CONTRACTS/privacy-requests.md) for validation, transitions and operational limitations.
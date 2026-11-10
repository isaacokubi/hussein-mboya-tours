# API endpoints: operational-assets

This guide contains 4 mounted method/path inventory entries in the **operational-assets** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-339 — GET /api/operational-assets

**Contract status:** SOURCE-TRACED<br>
**Router:** [operationalAssetRoutes.js](../../server/routes/operationalAssetRoutes.js) · [route module explanation](../code-explanations/backend/routes/operationalAssetRoutes.md)<br>
**Mounted inventory entry:** 339 of 629<br>
**Route declaration pipeline:** `listOperationalAssets`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", listOperationalAssets)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `type`, `status`, `bookingId`, `tourId`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.


**Source-traced contract:** See [operational asset contracts](../API_DOMAIN_CONTRACTS/operational-assets.md) for validation and authorization scope.
## endpoint-340 — POST /api/operational-assets

**Contract status:** SOURCE-TRACED<br>
**Router:** [operationalAssetRoutes.js](../../server/routes/operationalAssetRoutes.js) · [route module explanation](../code-explanations/backend/routes/operationalAssetRoutes.md)<br>
**Mounted inventory entry:** 340 of 629<br>
**Route declaration pipeline:** `createOperationalAsset`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/", createOperationalAsset)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `type`, `name`, `code`, `status`, `bookingId`, `tourId`, `assignedTo`, `startAt`, `endAt`, `metadata`, `notes`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.


**Source-traced contract:** See [operational asset contracts](../API_DOMAIN_CONTRACTS/operational-assets.md) for validation and authorization scope.
## endpoint-341 — PATCH /api/operational-assets/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [operationalAssetRoutes.js](../../server/routes/operationalAssetRoutes.js) · [route module explanation](../code-explanations/backend/routes/operationalAssetRoutes.md)<br>
**Mounted inventory entry:** 341 of 629<br>
**Route declaration pipeline:** `updateOperationalAsset`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.patch("/:id", updateOperationalAsset)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.


**Source-traced contract:** See [operational asset contracts](../API_DOMAIN_CONTRACTS/operational-assets.md) for validation and authorization scope.
## endpoint-342 — DELETE /api/operational-assets/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [operationalAssetRoutes.js](../../server/routes/operationalAssetRoutes.js) · [route module explanation](../code-explanations/backend/routes/operationalAssetRoutes.md)<br>
**Mounted inventory entry:** 342 of 629<br>
**Route declaration pipeline:** `deleteOperationalAsset`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.delete("/:id", deleteOperationalAsset)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [operational asset contracts](../API_DOMAIN_CONTRACTS/operational-assets.md) for validation and authorization scope.
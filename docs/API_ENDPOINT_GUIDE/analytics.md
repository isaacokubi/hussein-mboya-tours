# API endpoints: analytics

This guide contains 3 mounted method/path inventory entries in the **analytics** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-174 — GET /api/analytics

**Contract status:** SOURCE-TRACED<br>
**Router:** [analyticsRoutes.js](../../server/routes/analyticsRoutes.js) · [route module explanation](../code-explanations/backend/routes/analyticsRoutes.md)<br>
**Mounted inventory entry:** 174 of 629<br>
**Route declaration pipeline:** `getAnalytics`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("analytics.view")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("analytics.view"

**Source declaration:**

```js
router.get(
  "/",
  getAnalytics
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Tenant analytics API contracts](../API_DOMAIN_CONTRACTS/analytics.md); query support and revenue bases are clarified there.

## endpoint-175 — GET /api/analytics/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [analyticsRoutes.js](../../server/routes/analyticsRoutes.js) · [route module explanation](../code-explanations/backend/routes/analyticsRoutes.md)<br>
**Mounted inventory entry:** 175 of 629<br>
**Route declaration pipeline:** `dashboardAnalytics`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("analytics.view")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("analytics.view"

**Source declaration:**

```js
router.get(
  "/dashboard",
  dashboardAnalytics
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Tenant analytics API contracts](../API_DOMAIN_CONTRACTS/analytics.md); query support and revenue bases are clarified there.

## endpoint-176 — GET /api/analytics/revenue

**Contract status:** SOURCE-TRACED<br>
**Router:** [analyticsRoutes.js](../../server/routes/analyticsRoutes.js) · [route module explanation](../code-explanations/backend/routes/analyticsRoutes.md)<br>
**Mounted inventory entry:** 176 of 629<br>
**Route declaration pipeline:** `revenueAnalytics`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("analytics.view")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("analytics.view"

**Source declaration:**

```js
router.get(
  "/revenue",
  revenueAnalytics
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Tenant analytics API contracts](../API_DOMAIN_CONTRACTS/analytics.md); query support and revenue bases are clarified there.


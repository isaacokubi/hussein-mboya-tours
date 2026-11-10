# API endpoints: recommendations

This guide contains 1 mounted method/path inventory entries in the **recommendations** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-375 — POST /api/recommendations

**Contract status:** SOURCE-TRACED<br>
**Router:** [recommendationRoutes.js](../../server/routes/recommendationRoutes.js) · [route module explanation](../code-explanations/backend/routes/recommendationRoutes.md)<br>
**Mounted inventory entry:** 375 of 629<br>
**Route declaration pipeline:** `getRecommendations`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post(
  "/",
  getRecommendations
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`, `recommendations`.



**Source-traced contract:** See [personalized recommendations](../API_DOMAIN_CONTRACTS/recommendations.md) for inputs, fallback and tenant-query behavior.

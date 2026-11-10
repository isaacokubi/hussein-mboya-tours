# API endpoints: crm

This guide contains 1 mounted method/path inventory entries in the **crm** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-214 — GET /api/crm/stats

**Contract status:** SOURCE-TRACED<br>
**Router:** [crmRoutes.js](../../server/routes/crmRoutes.js) · [route module explanation](../code-explanations/backend/routes/crmRoutes.md)<br>
**Mounted inventory entry:** 214 of 629<br>
**Route declaration pipeline:** `getCRMStats`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("manage_customers")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("manage_customers"

**Source declaration:**

```js
router.get(
  "/stats",
  getCRMStats
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.




**Source-traced contract:** See [CRM statistics and custom-tour lifecycle](../API_DOMAIN_CONTRACTS/crm-stats.md) for the endpoint-specific behavior and verified limits.
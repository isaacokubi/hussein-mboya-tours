# API endpoints: tour-reports

This guide contains 1 mounted method/path inventory entries in the **tour-reports** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-584 — GET /api/tour-reports

**Contract status:** SOURCE-TRACED<br>
**Router:** [tourReportRoutes.js](../../server/routes/tourReportRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourReportRoutes.md)<br>
**Mounted inventory entry:** 584 of 629<br>
**Route declaration pipeline:** `roleMiddleware`, `getTourReports`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** roleMiddleware`

**Source declaration:**

```js
router.get("/", roleMiddleware("admin", "manager", "super_admin"), getTourReports)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced behavior:** See [Tour reports API contract](../API_DOMAIN_CONTRACTS/tour-reports.md) for the exact role gate, tenant scope, report calculations, revenue bases and known aggregation caveats.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


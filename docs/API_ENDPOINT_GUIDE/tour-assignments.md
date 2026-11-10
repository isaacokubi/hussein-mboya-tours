# API endpoints: tour-assignments

This guide contains 1 mounted method/path inventory entries in the **tour-assignments** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-515 — PUT /api/tour-assignments/:id/assign

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [tourAssignmentRoutes.js](../../server/routes/tourAssignmentRoutes.js) · [route module explanation](../code-explanations/backend/routes/tourAssignmentRoutes.md)<br>
**Mounted inventory entry:** 515 of 629<br>
**Route declaration pipeline:** `validateTourAssignmentTenant`, `assignTourResourcesSafe`
**Router-wide middleware:** resolveTenant; protect; managerOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly

**Source declaration:**

```js
router.put("/:id/assign", validateTourAssignmentTenant, assignTourResourcesSafe)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


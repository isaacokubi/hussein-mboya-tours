# API endpoints: tour-assignments

This guide contains 1 mounted method/path inventory entries in the **tour-assignments** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-515 — PUT /api/tour-assignments/:id/assign

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Tenant-safe tour resource assignment API contract](../API_DOMAIN_CONTRACTS/tour-resource-assignment.md) for role checks, request semantics, tenant validation, resource availability/conflict checks, transaction boundaries and webhook behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


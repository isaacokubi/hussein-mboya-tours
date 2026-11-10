# API endpoints: settings

This guide contains 2 mounted method/path inventory entries in the **settings** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-383 — GET /api/settings

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [settingsRoutes.js](../../server/routes/settingsRoutes.js) · [route module explanation](../code-explanations/backend/routes/settingsRoutes.md)<br>
**Mounted inventory entry:** 383 of 629<br>
**Route declaration pipeline:** `getSettings`
**Router-wide middleware:** resolveTenant; protect; authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.get("/", getSettings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `data`, `scope`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-385 — PUT /api/settings

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [settingsRoutes.js](../../server/routes/settingsRoutes.js) · [route module explanation](../code-explanations/backend/routes/settingsRoutes.md)<br>
**Mounted inventory entry:** 385 of 629<br>
**Route declaration pipeline:** `updateSettings`
**Router-wide middleware:** resolveTenant; protect; authorize("settings.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("settings.manage"

**Source declaration:**

```js
router.put("/", updateSettings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


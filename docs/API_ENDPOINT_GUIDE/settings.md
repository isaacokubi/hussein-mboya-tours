# API endpoints: settings

This guide contains 2 mounted method/path inventory entries in the **settings** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-383 — GET /api/settings

**Contract status:** SOURCE-TRACED<br>
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

**Contract:** No path/query/body input. `getSettings` returns 200 `{success:true,data,settings,scope}`. Tenant context returns settings merged with organization profile overrides and `tenantProfile`; platform-bypass context returns platform settings. Missing records are initialized from defaults, seeded from `Organization` for tenants. Reads use `SystemSetting`, `Organization`, and the earliest matching admin `User`; unexpected errors go to centralized middleware. `resolveTenant`, `protect`, and `authorize("settings.manage")` apply to both public-prefix-looking `/api/settings` aliases; they are not public routes. No focused endpoint test was found.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-385 — PUT /api/settings

**Contract status:** SOURCE-TRACED<br>
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

**Contract:** Accepts only the explicit controller allowlist covering organization/contact/currency settings, rates, payment configuration and instructions, communication/SEO, notifications, branding, and homepage sections; unknown keys are ignored. It normalizes company name/contact/currency, numeric and string booleans, and JSON-or-comma SEO keywords. Colors require `#RRGGBB`; overlay and tax/deposit/commission rates are bounded 0–100; company name must remain nonempty; support email and enabled cash/bank details are validated. Success returns 200 `{success:true,message,data,settings,tenantProfile,scope}`. For a tenant, `SystemSetting` is saved and then selected organization profile/brand values are persisted separately without a transaction. Validation failure is 400 `{success:false,message}`; caught errors return `error.status || 500` with a public message. No upload middleware is mounted, so `req.file` logo handling is not active on this route. The route requires JWT and `settings.manage`; no focused endpoint test was found.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


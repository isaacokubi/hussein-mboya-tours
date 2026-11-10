# API endpoints: packages

This guide contains 1 mounted method/path inventory entries in the **packages** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-366 — GET /api/packages

**Contract status:** SOURCE-TRACED<br>
**Router:** [publicPackageRoutes.js](../../server/routes/publicPackageRoutes.js) · [route module explanation](../code-explanations/backend/routes/publicPackageRoutes.md)<br>
**Mounted inventory entry:** 366 of 629<br>
**Route declaration pipeline:** `listPublicPackages`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/", listPublicPackages)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.



**Source-traced contract:** See [public package listing](../API_DOMAIN_CONTRACTS/public-packages.md).

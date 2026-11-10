# API endpoints: categories

This guide contains 1 mounted method/path inventory entries in the **categories** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-199 — GET /api/categories

**Contract status:** SOURCE-TRACED<br>
**Router:** [categoryRoutes.js](../../server/routes/categoryRoutes.js) · [route module explanation](../code-explanations/backend/routes/categoryRoutes.md)<br>
**Mounted inventory entry:** 199 of 629<br>
**Route declaration pipeline:** `getCategories`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get(

"/",

getCategories

)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.

**Source-traced contract:** See [Public tour categories API](../API_DOMAIN_CONTRACTS/public-categories.md).


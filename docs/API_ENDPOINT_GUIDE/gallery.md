# API endpoints: gallery

This guide contains 1 mounted method/path inventory entries in the **gallery** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-252 — GET /api/gallery/featured

**Contract status:** SOURCE-TRACED<br>
**Router:** [galleryRoutes.js](../../server/routes/galleryRoutes.js) · [route module explanation](../code-explanations/backend/routes/galleryRoutes.md)<br>
**Mounted inventory entry:** 252 of 629<br>
**Route declaration pipeline:** `getFeaturedGallery`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get(

"/featured",

getFeaturedGallery

)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`, `data`.



**Source-traced contract:** See [public featured gallery](../API_DOMAIN_CONTRACTS/gallery-public.md) for fallback and filtering behavior.

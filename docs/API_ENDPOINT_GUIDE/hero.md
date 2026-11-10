# API endpoints: hero

This guide contains 1 mounted method/path inventory entries in the **hero** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-259 — GET /api/hero

**Contract status:** SOURCE-TRACED<br>
**Router:** [heroRoutes.js](../../server/routes/heroRoutes.js) · [route module explanation](../code-explanations/backend/routes/heroRoutes.md)<br>
**Mounted inventory entry:** 259 of 629<br>
**Route declaration pipeline:** `getHeroSlides`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get(

"/",

getHeroSlides

)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`, `500`.
- JSON envelope keys observed: `success`, `message`.



**Source-traced contract:** See [public hero slides](../API_DOMAIN_CONTRACTS/hero-slides.md).

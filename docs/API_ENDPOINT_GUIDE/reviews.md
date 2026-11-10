# API endpoints: reviews

This guide contains 3 mounted method/path inventory entries in the **reviews** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-376 — GET /api/reviews/tour/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [reviewRoutes.js](../../server/routes/reviewRoutes.js) · [route module explanation](../code-explanations/backend/routes/reviewRoutes.md)<br>
**Mounted inventory entry:** 376 of 629<br>
**Route declaration pipeline:** `getTourReviews`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get(
  "/tour/:id",
  getTourReviews
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`.


**Source-traced contract:** See [tour review contracts](../API_DOMAIN_CONTRACTS/reviews.md) for eligibility, moderation and vote behavior.
## endpoint-377 — POST /api/reviews

**Contract status:** SOURCE-TRACED<br>
**Router:** [reviewRoutes.js](../../server/routes/reviewRoutes.js) · [route module explanation](../code-explanations/backend/routes/reviewRoutes.md)<br>
**Mounted inventory entry:** 377 of 629<br>
**Route declaration pipeline:** `protect`, `createReview`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post(
  "/",
  protect,
  createReview
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `tour`, `tourId`, `rating`, `title`, `comment`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [tour review contracts](../API_DOMAIN_CONTRACTS/reviews.md) for eligibility, moderation and vote behavior.
## endpoint-378 — PUT /api/reviews/:id/helpful

**Contract status:** SOURCE-TRACED<br>
**Router:** [reviewRoutes.js](../../server/routes/reviewRoutes.js) · [route module explanation](../code-explanations/backend/routes/reviewRoutes.md)<br>
**Mounted inventory entry:** 378 of 629<br>
**Route declaration pipeline:** `protect`, `voteHelpful`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.put(
  "/:id/helpful",
  protect,
  voteHelpful
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `helpfulVotes`.


**Source-traced contract:** See [tour review contracts](../API_DOMAIN_CONTRACTS/reviews.md) for eligibility, moderation and vote behavior.
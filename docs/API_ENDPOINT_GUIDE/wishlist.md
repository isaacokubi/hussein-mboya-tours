# API endpoints: wishlist

This guide contains 3 mounted method/path inventory entries in the **wishlist** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-627 — GET /api/wishlist

**Contract status:** SOURCE-TRACED<br>
**Router:** [wishlistRoutes.js](../../server/routes/wishlistRoutes.js) · [route module explanation](../code-explanations/backend/routes/wishlistRoutes.md)<br>
**Mounted inventory entry:** 627 of 629<br>
**Route declaration pipeline:** `getWishlist`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get(
  "/",
  getWishlist
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `wishlist`.

**Source-traced behavior:** See [Tenant wishlist API contracts](../API_DOMAIN_CONTRACTS/wishlist.md) for authenticated-owner isolation, public-tour filtering, duplicate handling, response envelopes and model behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-628 — POST /api/wishlist

**Contract status:** SOURCE-TRACED<br>
**Router:** [wishlistRoutes.js](../../server/routes/wishlistRoutes.js) · [route module explanation](../code-explanations/backend/routes/wishlistRoutes.md)<br>
**Mounted inventory entry:** 628 of 629<br>
**Route declaration pipeline:** `addWishlist`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post(
  "/",
  addWishlist
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `tourId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`, `wishlist`.

**Source-traced behavior:** See [Tenant wishlist API contracts](../API_DOMAIN_CONTRACTS/wishlist.md) for authenticated-owner isolation, public-tour filtering, duplicate handling, response envelopes and model behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-629 — DELETE /api/wishlist/:tourId

**Contract status:** SOURCE-TRACED<br>
**Router:** [wishlistRoutes.js](../../server/routes/wishlistRoutes.js) · [route module explanation](../code-explanations/backend/routes/wishlistRoutes.md)<br>
**Mounted inventory entry:** 629 of 629<br>
**Route declaration pipeline:** `removeWishlist`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.delete(
  "/:tourId",
  removeWishlist
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `tourId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`, `wishlist`.

**Source-traced behavior:** See [Tenant wishlist API contracts](../API_DOMAIN_CONTRACTS/wishlist.md) for authenticated-owner isolation, public-tour filtering, duplicate handling, response envelopes and model behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


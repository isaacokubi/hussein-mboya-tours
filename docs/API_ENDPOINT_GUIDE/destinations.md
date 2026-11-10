# API endpoints: destinations

This guide contains 4 mounted method/path inventory entries in the **destinations** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-226 — GET /api/destinations/featured

**Contract status:** SOURCE-TRACED<br>
**Router:** [destinationRoutes.js](../../server/routes/destinationRoutes.js) · [route module explanation](../code-explanations/backend/routes/destinationRoutes.md)<br>
**Mounted inventory entry:** 226 of 629<br>
**Route declaration pipeline:** `getFeaturedDestinations`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get(

  "/featured",

  getFeaturedDestinations

)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.


**Source-traced contract:** See [customer and destination contracts](../API_DOMAIN_CONTRACTS/customer-directory.md) for the verified request, response and behavior.
## endpoint-227 — GET /api/destinations

**Contract status:** SOURCE-TRACED<br>
**Router:** [destinationRoutes.js](../../server/routes/destinationRoutes.js) · [route module explanation](../code-explanations/backend/routes/destinationRoutes.md)<br>
**Mounted inventory entry:** 227 of 629<br>
**Route declaration pipeline:** `getDestinations`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get(

  "/",

  getDestinations

)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`, `country`, `featured`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.


**Source-traced contract:** See [customer and destination contracts](../API_DOMAIN_CONTRACTS/customer-directory.md) for the verified request, response and behavior.
## endpoint-228 — GET /api/destinations/:slug

**Contract status:** SOURCE-TRACED<br>
**Router:** [destinationRoutes.js](../../server/routes/destinationRoutes.js) · [route module explanation](../code-explanations/backend/routes/destinationRoutes.md)<br>
**Mounted inventory entry:** 228 of 629<br>
**Route declaration pipeline:** `getDestination`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get(

  "/:slug",

  getDestination

)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `slug`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [customer and destination contracts](../API_DOMAIN_CONTRACTS/customer-directory.md) for the verified request, response and behavior.
## endpoint-229 — GET /api/destinations/slug/:slug

**Contract status:** SOURCE-TRACED<br>
**Router:** [destinationRoutes.js](../../server/routes/destinationRoutes.js) · [route module explanation](../code-explanations/backend/routes/destinationRoutes.md)<br>
**Mounted inventory entry:** 229 of 629<br>
**Route declaration pipeline:** `getDestination`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get(

  "/slug/:slug",

  getDestination

)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `slug`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [customer and destination contracts](../API_DOMAIN_CONTRACTS/customer-directory.md) for the verified request, response and behavior.
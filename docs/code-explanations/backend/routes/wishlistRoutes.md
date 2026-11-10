# Route module: wishlistRoutes.js

**Source:** [server/routes/wishlistRoutes.js](../../../../server/routes/wishlistRoutes.js)

Observed mount prefixes include `/api/wishlist`, `/api/wishlist/:tourId`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/wishlist`

Declared at source line 42. Route handler pipeline names: `getWishlist`.

```js
router.get(
  "/",
  getWishlist
)
```

- Imported handler/middleware `getWishlist`: [wishlistController.js](../../../../server/controllers/wishlistController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getWishlist`

Handler starts at [controller line 9](../../../../server/controllers/wishlistController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `wishlist`.
- Database operations detected: `Wishlist.findOne`, `Wishlist.create`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/wishlist'
```

### POST / → `/api/wishlist`

Declared at source line 56. Route handler pipeline names: `addWishlist`.

```js
router.post(
  "/",
  addWishlist
)
```

- Imported handler/middleware `addWishlist`: [wishlistController.js](../../../../server/controllers/wishlistController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `addWishlist`

Handler starts at [controller line 20](../../../../server/controllers/wishlistController.js#L20). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `tourId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`, `wishlist`.
- Literal messages include: “Tour ID is required”; “Invalid tour ID”; “Tour not found”; “Tour added to wishlist”.
- Database operations detected: `Tour.findOne`, `Wishlist.findOne`, `Wishlist.create`, `Wishlist.updateOne`.
- Input/validation source lines to inspect:
  - [Line 23](../../../../server/controllers/wishlistController.js#L23): `const { tourId } = req.body;`
  - [Line 24](../../../../server/controllers/wishlistController.js#L24): `if (!tourId) return res.status(400).json({ success: false, message: "Tour ID is required" });`
  - [Line 25](../../../../server/controllers/wishlistController.js#L25): `if (!mongoose.Types.ObjectId.isValid(tourId)) return res.status(400).json({ success: false, message: "Invalid tour ID" });`
  - [Line 28](../../../../server/controllers/wishlistController.js#L28): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/wishlist'
```

### DELETE /:tourId → `/api/wishlist/:tourId`

Declared at source line 65. Route handler pipeline names: `removeWishlist`.

```js
router.delete(
  "/:tourId",
  removeWishlist
)
```

- Imported handler/middleware `removeWishlist`: [wishlistController.js](../../../../server/controllers/wishlistController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `removeWishlist`

Handler starts at [controller line 43](../../../../server/controllers/wishlistController.js#L43). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `tourId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`, `wishlist`.
- Literal messages include: “Invalid tour ID”; “Wishlist not found”; “Tour removed from wishlist”.
- Database operations detected: `Wishlist.findOne`, `Wishlist.updateOne`.
- Input/validation source lines to inspect:
  - [Line 46](../../../../server/controllers/wishlistController.js#L46): `const { tourId } = req.params;`
  - [Line 47](../../../../server/controllers/wishlistController.js#L47): `if (!mongoose.Types.ObjectId.isValid(tourId)) return res.status(400).json({ success: false, message: "Invalid tour ID" });`
  - [Line 50](../../../../server/controllers/wishlistController.js#L50): `if (!wishlist) return res.status(404).json({ success: false, message: "Wishlist not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/wishlist/<tourId>'
```


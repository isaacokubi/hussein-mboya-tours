# Route module: adminReviewRoutes.js

**Source:** [server/routes/adminReviewRoutes.js](../../../../server/routes/adminReviewRoutes.js)

Observed mount prefixes include `/api/admin/reviews`, `/api/admin/reviews/:id/approve`, `/api/admin/reviews/:id/reject`, `/api/admin/reviews/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect, adminMiddleware);`
- `router.use(authorize("review.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/reviews`

Declared at source line 18. Route handler pipeline names: `getAdminReviews`.

```js
router.get("/", getAdminReviews)
```

- Imported handler/middleware `getAdminReviews`: [adminReviewController.js](../../../../server/controllers/adminReviewController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAdminReviews`

Handler starts at [controller line 25](../../../../server/controllers/adminReviewController.js#L25). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Review.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/reviews'
```

### PATCH /:id/approve → `/api/admin/reviews/:id/approve`

Declared at source line 19. Route handler pipeline names: `approveAdminReview`.

```js
router.patch("/:id/approve", approveAdminReview)
```

- Imported handler/middleware `approveAdminReview`: [adminReviewController.js](../../../../server/controllers/adminReviewController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `approveAdminReview`

Handler starts at [controller line 43](../../../../server/controllers/adminReviewController.js#L43). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Review not found”.
- Database operations detected: `Review.findOne`.
- Input/validation source lines to inspect:
  - [Line 45](../../../../server/controllers/adminReviewController.js#L45): `const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));`
  - [Line 46](../../../../server/controllers/adminReviewController.js#L46): `if (!review) return res.status(404).json({ success: false, message: "Review not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/reviews/<id>/approve'
```

### PATCH /:id/reject → `/api/admin/reviews/:id/reject`

Declared at source line 20. Route handler pipeline names: `rejectAdminReview`.

```js
router.patch("/:id/reject", rejectAdminReview)
```

- Imported handler/middleware `rejectAdminReview`: [adminReviewController.js](../../../../server/controllers/adminReviewController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `rejectAdminReview`

Handler starts at [controller line 58](../../../../server/controllers/adminReviewController.js#L58). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Review not found”.
- Database operations detected: `Review.findOne`.
- Input/validation source lines to inspect:
  - [Line 60](../../../../server/controllers/adminReviewController.js#L60): `const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));`
  - [Line 61](../../../../server/controllers/adminReviewController.js#L61): `if (!review) return res.status(404).json({ success: false, message: "Review not found" });`
  - [Line 64](../../../../server/controllers/adminReviewController.js#L64): `review.rejectionReason = req.body?.reason || "Rejected by administrator";`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/reviews/<id>/reject'
```

### DELETE /:id → `/api/admin/reviews/:id`

Declared at source line 21. Route handler pipeline names: `deleteAdminReview`.

```js
router.delete("/:id", deleteAdminReview)
```

- Imported handler/middleware `deleteAdminReview`: [adminReviewController.js](../../../../server/controllers/adminReviewController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteAdminReview`

Handler starts at [controller line 73](../../../../server/controllers/adminReviewController.js#L73). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Review not found”; “Review deleted”.
- Database operations detected: `Review.findOne`.
- Input/validation source lines to inspect:
  - [Line 75](../../../../server/controllers/adminReviewController.js#L75): `const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));`
  - [Line 76](../../../../server/controllers/adminReviewController.js#L76): `if (!review) return res.status(404).json({ success: false, message: "Review not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/reviews/<id>'
```


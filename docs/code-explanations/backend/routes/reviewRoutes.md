# Route module: reviewRoutes.js

**Source:** [server/routes/reviewRoutes.js](../../../../server/routes/reviewRoutes.js)

Observed mount prefixes include `/api/reviews/tour/:id`, `/api/reviews`, `/api/reviews/:id/helpful`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /tour/:id → `/api/reviews/tour/:id`

Declared at source line 30. Route handler pipeline names: `getTourReviews`.

```js
router.get(
  "/tour/:id",
  getTourReviews
)
```

- Imported handler/middleware `getTourReviews`: [reviewController.js](../../../../server/controllers/reviewController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getTourReviews`

Handler starts at [controller line 55](../../../../server/controllers/reviewController.js#L55). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Review.find`.
- Input/validation source lines to inspect:
  - [Line 58](../../../../server/controllers/reviewController.js#L58): `const reviews = await Review.find(mergeTenantFilter({ tour: req.params.id, approved: true, isDeleted: false }))`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/reviews/tour/<id>'
```

### POST / → `/api/reviews`

Declared at source line 45. Route handler pipeline names: `protect`, `createReview`.

```js
router.post(
  "/",
  protect,
  createReview
)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `createReview`: [reviewController.js](../../../../server/controllers/reviewController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createReview`

Handler starts at [controller line 18](../../../../server/controllers/reviewController.js#L18). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `tour`, `tourId`, `rating`, `title`, `comment`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tour, rating and comment are required.”; “Only completed tours can be reviewed.”; “You have already reviewed this tour.”; “Review submitted successfully and is awaiting approval.”.
- Database operations detected: `Booking.findOne`, `Review.findOne`, `Review.create`.
- Input/validation source lines to inspect:
  - [Line 21](../../../../server/controllers/reviewController.js#L21): `const { tour: requestedTour, tourId, rating, title, comment } = req.body;`
  - [Line 23](../../../../server/controllers/reviewController.js#L23): `if (!tour || !rating || !comment) return res.status(400).json({ success: false, message: "Tour, rating and comment are required." });`
  - [Line 34](../../../../server/controllers/reviewController.js#L34): `if (!booking) return res.status(400).json({ success: false, message: "Only completed tours can be reviewed." });`
  - [Line 37](../../../../server/controllers/reviewController.js#L37): `if (existingReview) return res.status(409).json({ success: false, message: "You have already reviewed this tour." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/reviews'
```

### PUT /:id/helpful → `/api/reviews/:id/helpful`

Declared at source line 55. Route handler pipeline names: `protect`, `voteHelpful`.

```js
router.put(
  "/:id/helpful",
  protect,
  voteHelpful
)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `voteHelpful`: [reviewController.js](../../../../server/controllers/reviewController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `voteHelpful`

Handler starts at [controller line 77](../../../../server/controllers/reviewController.js#L77). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `helpfulVotes`.
- Literal messages include: “Review not found.”.
- Database operations detected: `Review.findOne`.
- Input/validation source lines to inspect:
  - [Line 80](../../../../server/controllers/reviewController.js#L80): `const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 81](../../../../server/controllers/reviewController.js#L81): `if (!review) return res.status(404).json({ success: false, message: "Review not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/reviews/<id>/helpful'
```


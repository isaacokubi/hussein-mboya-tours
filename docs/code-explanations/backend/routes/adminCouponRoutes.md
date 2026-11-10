# Route module: adminCouponRoutes.js

**Source:** [server/routes/adminCouponRoutes.js](../../../../server/routes/adminCouponRoutes.js)

Observed mount prefixes include `/api/admin/coupons`, `/api/admin/coupons/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect, adminMiddleware);`
- `router.use(authorize("coupon.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/coupons`

Declared at source line 19. Route handler pipeline names: `getAdminCoupons`.

```js
router.get("/", getAdminCoupons)
```

- Imported handler/middleware `getAdminCoupons`: [adminCouponController.js](../../../../server/controllers/adminCouponController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAdminCoupons`

Handler starts at [controller line 66](../../../../server/controllers/adminCouponController.js#L66). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`, `coupons`.
- Database operations detected: `Coupon.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/coupons'
```

### POST / → `/api/admin/coupons`

Declared at source line 20. Route handler pipeline names: `createAdminCoupon`.

```js
router.post("/", createAdminCoupon)
```

- Imported handler/middleware `createAdminCoupon`: [adminCouponController.js](../../../../server/controllers/adminCouponController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createAdminCoupon`

Handler starts at [controller line 78](../../../../server/controllers/adminCouponController.js#L78). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`, `409`.
- JSON envelope keys observed: `success`, `message`, `coupon`.
- Literal messages include: “Coupon code already exists for this company”.
- Database operations detected: `Coupon.create`.
- Input/validation source lines to inspect:
  - [Line 81](../../../../server/controllers/adminCouponController.js#L81): `const payload = normalizeCouponPayload(req.body);`
  - [Line 83](../../../../server/controllers/adminCouponController.js#L83): `if (validationError) return res.status(400).json({ success: false, message: validationError });`
  - [Line 92](../../../../server/controllers/adminCouponController.js#L92): `return res.status(409).json({ success: false, message: "Coupon code already exists for this company" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/coupons'
```

### PUT /:id → `/api/admin/coupons/:id`

Declared at source line 21. Route handler pipeline names: `updateAdminCoupon`.

```js
router.put("/:id", updateAdminCoupon)
```

- Imported handler/middleware `updateAdminCoupon`: [adminCouponController.js](../../../../server/controllers/adminCouponController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateAdminCoupon`

Handler starts at [controller line 98](../../../../server/controllers/adminCouponController.js#L98). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `coupon`.
- Literal messages include: “Invalid coupon id”; “Coupon not found”; “Coupon code already exists for this company”.
- Database operations detected: `Coupon.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 101](../../../../server/controllers/adminCouponController.js#L101): `const payload = normalizeCouponPayload(req.body);`
  - [Line 103](../../../../server/controllers/adminCouponController.js#L103): `if (validationError) return res.status(400).json({ success: false, message: validationError });`
  - [Line 105](../../../../server/controllers/adminCouponController.js#L105): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 106](../../../../server/controllers/adminCouponController.js#L106): `return res.status(400).json({ success: false, message: "Invalid coupon id" });`
  - [Line 110](../../../../server/controllers/adminCouponController.js#L110): `mergeTenantFilter({ _id: req.params.id }),`
  - [Line 114](../../../../server/controllers/adminCouponController.js#L114): `if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });`
  - [Line 118](../../../../server/controllers/adminCouponController.js#L118): `return res.status(409).json({ success: false, message: "Coupon code already exists for this company" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/coupons/<id>'
```

### DELETE /:id → `/api/admin/coupons/:id`

Declared at source line 22. Route handler pipeline names: `deleteAdminCoupon`.

```js
router.delete("/:id", deleteAdminCoupon)
```

- Imported handler/middleware `deleteAdminCoupon`: [adminCouponController.js](../../../../server/controllers/adminCouponController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteAdminCoupon`

Handler starts at [controller line 124](../../../../server/controllers/adminCouponController.js#L124). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid coupon id”; “Coupon not found”; “Coupon deleted”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 127](../../../../server/controllers/adminCouponController.js#L127): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 128](../../../../server/controllers/adminCouponController.js#L128): `return res.status(400).json({ success: false, message: "Invalid coupon id" });`
  - [Line 132](../../../../server/controllers/adminCouponController.js#L132): `mergeTenantFilter({ _id: req.params.id })`
  - [Line 134](../../../../server/controllers/adminCouponController.js#L134): `if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/coupons/<id>'
```


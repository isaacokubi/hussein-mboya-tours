# Route module: couponRoutes.js

**Source:** [server/routes/couponRoutes.js](../../../../server/routes/couponRoutes.js)

Observed mount prefixes include `/api/coupons/validate`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /validate → `/api/coupons/validate`

Declared at source line 13. Route handler pipeline names: `validateCoupon`.

```js
router.post("/validate", validateCoupon)
```

- Imported handler/middleware `validateCoupon`: [couponController.js](../../../../server/controllers/couponController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `validateCoupon`

Handler starts at [controller line 21](../../../../server/controllers/couponController.js#L21). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `code`, `amount`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Coupon code is required.”; “A valid booking amount is required.”; “Coupon validated successfully.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 23](../../../../server/controllers/couponController.js#L23): `const { code, amount } = req.body;`
  - [Line 32](../../../../server/controllers/couponController.js#L32): `return res.status(400).json({`
  - [Line 44](../../../../server/controllers/couponController.js#L44): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/coupons/validate'
```


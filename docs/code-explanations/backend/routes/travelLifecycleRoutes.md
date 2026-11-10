# Route module: travelLifecycleRoutes.js

**Source:** [server/routes/travelLifecycleRoutes.js](../../../../server/routes/travelLifecycleRoutes.js)

Observed mount prefixes include `/api/travel/vouchers`, `/api/travel/vouchers/redeem`, `/api/travel/pricing/calculate`, `/api/travel/loyalty/:customerId`, `/api/travel/loyalty/earn`, `/api/travel/loyalty/redeem`.

## Router-wide middleware

- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /vouchers → `/api/travel/vouchers`

Declared at source line 7. Route handler pipeline names: `managerOnly`, `issueVoucher`.

```js
router.post("/vouchers", managerOnly, issueVoucher)
```

- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `issueVoucher`: [travelLifecycleController.js](../../../../server/controllers/travelLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `issueVoucher`

Handler starts at [controller line 9](../../../../server/controllers/travelLifecycleController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `bookingId`, `tourId`, `expiresAt`, `issuedFor`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `OperationalAsset.create`.
- Input/validation source lines to inspect:
  - [Line 12](../../../../server/controllers/travelLifecycleController.js#L12): `const voucher = await OperationalAsset.create({ tenantId: req.user.tenantId, type: "voucher", name: req.body.name || "Tour voucher", bookingId: req.body.bookingId, tourId`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/travel/vouchers'
```

### POST /vouchers/redeem → `/api/travel/vouchers/redeem`

Declared at source line 8. Route handler pipeline names: `redeemVoucher`.

```js
router.post("/vouchers/redeem", redeemVoucher)
```

- Imported handler/middleware `redeemVoucher`: [travelLifecycleController.js](../../../../server/controllers/travelLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `redeemVoucher`

Handler starts at [controller line 17](../../../../server/controllers/travelLifecycleController.js#L17). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `token`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `410`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Voucher is invalid, expired, or already redeemed.”; “Voucher has expired.”; “Voucher redemption limit reached.”.
- Database operations detected: `OperationalAsset.findOne`.
- Input/validation source lines to inspect:
  - [Line 19](../../../../server/controllers/travelLifecycleController.js#L19): `const hash = tokenHash(req.body.token);`
  - [Line 21](../../../../server/controllers/travelLifecycleController.js#L21): `if (!voucher) return res.status(404).json({ success: false, message: "Voucher is invalid, expired, or already redeemed." });`
  - [Line 23](../../../../server/controllers/travelLifecycleController.js#L23): `if (Number(voucher.metadata?.redeemedCount || 0) >= Number(voucher.metadata?.redemptionLimit || 1)) return res.status(409).json({ success: false, message: "Voucher redemp`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/travel/vouchers/redeem'
```

### POST /pricing/calculate → `/api/travel/pricing/calculate`

Declared at source line 9. Route handler pipeline names: `calculateDynamicPrice`.

```js
router.post("/pricing/calculate", calculateDynamicPrice)
```

- Imported handler/middleware `calculateDynamicPrice`: [travelLifecycleController.js](../../../../server/controllers/travelLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `calculateDynamicPrice`

Handler starts at [controller line 33](../../../../server/controllers/travelLifecycleController.js#L33). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `tourId`, `tour`, `travelDate`, `date`, `guests`, `numberOfGuests`, `basePrice`, `currency`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tour not found or not available.”; “basePrice must be a non-negative number.”; “guests must be a positive integer between 1 and 100.”; “travelDate must be a valid date.”.
- Database operations detected: `Tour.findOne`, `TravelCommercialRule.find`.
- Input/validation source lines to inspect:
  - [Line 35](../../../../server/controllers/travelLifecycleController.js#L35): `const requestedTourId = req.body.tourId || req.body.tour || null;`
  - [Line 36](../../../../server/controllers/travelLifecycleController.js#L36): `const requestedDate = req.body.travelDate || req.body.date || null;`
  - [Line 37](../../../../server/controllers/travelLifecycleController.js#L37): `const guests = Number(req.body.guests ?? req.body.numberOfGuests ?? 1);`
  - [Line 38](../../../../server/controllers/travelLifecycleController.js#L38): `let basePrice = Number(req.body.basePrice);`
  - [Line 42](../../../../server/controllers/travelLifecycleController.js#L42): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found or not available." });`
  - [Line 50](../../../../server/controllers/travelLifecycleController.js#L50): `if (!Number.isFinite(basePrice) || basePrice < 0) return res.status(400).json({ success: false, message: "basePrice must be a non-negative number." });`
  - [Line 51](../../../../server/controllers/travelLifecycleController.js#L51): `if (!Number.isInteger(guests) || guests <= 0 || guests > 100) return res.status(400).json({ success: false, message: "guests must be a positive integer between 1 and 100.`
  - [Line 52](../../../../server/controllers/travelLifecycleController.js#L52): `if (requestedDate && Number.isNaN(new Date(requestedDate).getTime())) return res.status(400).json({ success: false, message: "travelDate must be a valid date." });`
  - [Line 69](../../../../server/controllers/travelLifecycleController.js#L69): `res.json({ success: true, data: { basePrice, finalPrice: Math.round(price * 100) / 100, currency: req.body.currency || "KES", guests, travelDate: requestedDate || null, r`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/travel/pricing/calculate'
```

### GET /loyalty/:customerId → `/api/travel/loyalty/:customerId`

Declared at source line 10. Route handler pipeline names: `loyaltyBalance`.

```js
router.get("/loyalty/:customerId", loyaltyBalance)
```

- Imported handler/middleware `loyaltyBalance`: [travelLifecycleController.js](../../../../server/controllers/travelLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `loyaltyBalance`

Handler starts at [controller line 73](../../../../server/controllers/travelLifecycleController.js#L73). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `customerId`; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `LoyaltyAccount.findOne`.
- Input/validation source lines to inspect:
  - [Line 75](../../../../server/controllers/travelLifecycleController.js#L75): `const customerId = req.params.customerId || req.user._id;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/travel/loyalty/<customerId>'
```

### POST /loyalty/earn → `/api/travel/loyalty/earn`

Declared at source line 11. Route handler pipeline names: `managerOnly`, `earnLoyalty`.

```js
router.post("/loyalty/earn", managerOnly, earnLoyalty)
```

- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `earnLoyalty`: [travelLifecycleController.js](../../../../server/controllers/travelLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `earnLoyalty`

Handler starts at [controller line 81](../../../../server/controllers/travelLifecycleController.js#L81). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `points`, `customerId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “points must be a positive integer.”.
- Database operations detected: `LoyaltyAccount.findOne`, `LoyaltyAccount.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 83](../../../../server/controllers/travelLifecycleController.js#L83): `const points = Number(req.body.points);`
  - [Line 84](../../../../server/controllers/travelLifecycleController.js#L84): `if (!Number.isInteger(points) || points <= 0 || points > 1000000) return res.status(400).json({ success: false, message: "points must be a positive integer." });`
  - [Line 85](../../../../server/controllers/travelLifecycleController.js#L85): `const customerId = req.body.customerId || req.user._id;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/travel/loyalty/earn'
```

### POST /loyalty/redeem → `/api/travel/loyalty/redeem`

Declared at source line 12. Route handler pipeline names: `redeemLoyalty`.

```js
router.post("/loyalty/redeem", redeemLoyalty)
```

- Imported handler/middleware `redeemLoyalty`: [travelLifecycleController.js](../../../../server/controllers/travelLifecycleController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `redeemLoyalty`

Handler starts at [controller line 93](../../../../server/controllers/travelLifecycleController.js#L93). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `points`, `customerId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “points must be a positive integer.”; “Insufficient loyalty points.”.
- Database operations detected: `LoyaltyAccount.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 95](../../../../server/controllers/travelLifecycleController.js#L95): `const points = Number(req.body.points);`
  - [Line 96](../../../../server/controllers/travelLifecycleController.js#L96): `if (!Number.isInteger(points) || points <= 0) return res.status(400).json({ success: false, message: "points must be a positive integer." });`
  - [Line 97](../../../../server/controllers/travelLifecycleController.js#L97): `const customerId = req.body.customerId || req.user._id;`
  - [Line 99](../../../../server/controllers/travelLifecycleController.js#L99): `if (!account) return res.status(409).json({ success: false, message: "Insufficient loyalty points." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/travel/loyalty/redeem'
```


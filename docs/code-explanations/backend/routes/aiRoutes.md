# Route module: aiRoutes.js

**Source:** [server/routes/aiRoutes.js](../../../../server/routes/aiRoutes.js)

Observed mount prefixes include `/api/ai/admin/dashboard`, `/api/ai/admin/query`, `/api/ai/admin/analytics`, `/api/ai/admin/briefing`, `/api/ai/assistant`, `/api/ai/chat`, `/api/ai/booking/complete`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /admin/dashboard → `/api/ai/admin/dashboard`

Declared at source line 14. Route handler pipeline names: `protect`, `getAIDashboard`.

```js
router.get("/admin/dashboard", protect, getAIDashboard)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAIDashboard`: [adminAIController.js](../../../../server/controllers/adminAIController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAIDashboard`

Handler starts at [controller line 12](../../../../server/controllers/adminAIController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.countDocuments`, `Tour.countDocuments`, `User.countDocuments`, `Vehicle.countDocuments`, `Review.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/ai/admin/dashboard'
```

### POST /admin/query → `/api/ai/admin/query`

Declared at source line 15. Route handler pipeline names: `protect`, `adminAIQuery`.

```js
router.post("/admin/query", protect, adminAIQuery)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `adminAIQuery`: [adminAIController.js](../../../../server/controllers/adminAIController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `adminAIQuery`

Handler starts at [controller line 29](../../../../server/controllers/adminAIController.js#L29). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `message`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.countDocuments`, `Payment.countDocuments`, `Tour.countDocuments`, `Vehicle.countDocuments`, `Review.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 33](../../../../server/controllers/adminAIController.js#L33): `const { message } = req.body;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/ai/admin/query'
```

### GET /admin/analytics → `/api/ai/admin/analytics`

Declared at source line 16. Route handler pipeline names: `protect`, `getAIAnalytics`.

```js
router.get("/admin/analytics", protect, getAIAnalytics)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAIAnalytics`: [adminAIAnalyticsController.js](../../../../server/controllers/adminAIAnalyticsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAIAnalytics`

Handler starts at [controller line 7](../../../../server/controllers/adminAIAnalyticsController.js#L7). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Payment.aggregate`, `Booking.aggregate`, `Tour.countDocuments`, `Booking.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/ai/admin/analytics'
```

### GET /admin/briefing → `/api/ai/admin/briefing`

Declared at source line 17. Route handler pipeline names: `protect`, `getAIBriefing`.

```js
router.get("/admin/briefing", protect, getAIBriefing)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAIBriefing`: [adminAIBriefingController.js](../../../../server/controllers/adminAIBriefingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAIBriefing`

Handler starts at [controller line 9](../../../../server/controllers/adminAIBriefingController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.countDocuments`, `Review.aggregate`, `Tour.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/ai/admin/briefing'
```

### POST /assistant → `/api/ai/assistant`

Declared at source line 18. Route handler pipeline names: `protect`, `aiRateLimiter`, `askAI`.

```js
router.post("/assistant", protect, aiRateLimiter, askAI)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `aiRateLimiter`: [aiRateLimiter.js](../../../../server/middleware/aiRateLimiter.js)
- Imported handler/middleware `askAI`: [aiController.js](../../../../server/controllers/aiController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `askAI`

Handler starts at [controller line 33](../../../../server/controllers/aiController.js#L33). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `message`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `502`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Message must be a string.”; “Message is required.”; “AI service returned an empty response.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 41](../../../../server/controllers/aiController.js#L41): `let { message } = req.body;`
  - [Line 44](../../../../server/controllers/aiController.js#L44): `return res.status(400).json({`
  - [Line 53](../../../../server/controllers/aiController.js#L53): `return res.status(400).json({`
  - [Line 60](../../../../server/controllers/aiController.js#L60): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/ai/assistant'
```

### POST /chat → `/api/ai/chat`

Declared at source line 19. Route handler pipeline names: `protect`, `aiRateLimiter`, `askAI`.

```js
router.post("/chat", protect, aiRateLimiter, askAI)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `aiRateLimiter`: [aiRateLimiter.js](../../../../server/middleware/aiRateLimiter.js)
- Imported handler/middleware `askAI`: [aiController.js](../../../../server/controllers/aiController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `askAI`

Handler starts at [controller line 33](../../../../server/controllers/aiController.js#L33). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `message`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `502`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Message must be a string.”; “Message is required.”; “AI service returned an empty response.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 41](../../../../server/controllers/aiController.js#L41): `let { message } = req.body;`
  - [Line 44](../../../../server/controllers/aiController.js#L44): `return res.status(400).json({`
  - [Line 53](../../../../server/controllers/aiController.js#L53): `return res.status(400).json({`
  - [Line 60](../../../../server/controllers/aiController.js#L60): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/ai/chat'
```

### POST /booking/complete → `/api/ai/booking/complete`

Declared at source line 20. Route handler pipeline names: `protect`, `aiRateLimiter`, `completeBooking`.

```js
router.post("/booking/complete", protect, aiRateLimiter, completeBooking)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `aiRateLimiter`: [aiRateLimiter.js](../../../../server/middleware/aiRateLimiter.js)
- Imported handler/middleware `completeBooking`: [aiBookingController.js](../../../../server/controllers/aiBookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `completeBooking`

Handler starts at [controller line 5](../../../../server/controllers/aiBookingController.js#L5). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “AI booking created successfully”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 16](../../../../server/controllers/aiBookingController.js#L16): `...req.body,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/ai/booking/complete'
```


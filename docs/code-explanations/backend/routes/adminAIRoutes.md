# Route module: adminAIRoutes.js

**Source:** [server/routes/adminAIRoutes.js](../../../../server/routes/adminAIRoutes.js)

Observed mount prefixes include `/api/admin-ai/dashboard`, `/api/admin-ai/query`, `/api/admin-ai/analytics`, `/api/admin-ai/briefing`, `/api/admin-ai/intelligence`, `/api/admin-ai/alerts`, `/api/admin-ai/customer-support`, `/api/admin-ai/revenue-advice`, `/api/admin-ai/booking-risks`, `/api/admin-ai/tasks`, `/api/admin-ai/tasks/:id`, `/api/admin-ai/pricing-advice`, `/api/admin-ai/recommendations/:customerId`, `/api/admin-ai/fraud-monitoring`, `/api/admin-ai/sentiment`, `/api/admin-ai/marketing-campaigns`, `/api/admin-ai/financial-forecast`, `/api/admin-ai/operations-center`, `/api/admin-ai/sales-assistant`.

## Router-wide middleware

- `router.use(protect);`
- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /dashboard → `/api/admin-ai/dashboard`

Declared at source line 83. Route handler pipeline names: `checkPermission`, `getAIDashboard`.

```js
router.get("/dashboard", checkPermission("analytics.view"), getAIDashboard)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
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
curl -i -X GET 'http://localhost:5000/api/admin-ai/dashboard'
```

### POST /query → `/api/admin-ai/query`

Declared at source line 84. Route handler pipeline names: `checkPermission`, `adminAIQuery`.

```js
router.post("/query", checkPermission("analytics.view"), adminAIQuery)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
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
curl -i -X POST 'http://localhost:5000/api/admin-ai/query'
```

### GET /analytics → `/api/admin-ai/analytics`

Declared at source line 85. Route handler pipeline names: `checkPermission`, `getAIAnalytics`.

```js
router.get("/analytics", checkPermission("analytics.view"), getAIAnalytics)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
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
curl -i -X GET 'http://localhost:5000/api/admin-ai/analytics'
```

### GET /briefing → `/api/admin-ai/briefing`

Declared at source line 86. Route handler pipeline names: `checkPermission`, `getAIBriefing`.

```js
router.get("/briefing", checkPermission("analytics.view"), getAIBriefing)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
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
curl -i -X GET 'http://localhost:5000/api/admin-ai/briefing'
```

### GET /intelligence → `/api/admin-ai/intelligence`

Declared at source line 87. Route handler pipeline names: `checkPermission`, `getAIIntelligence`.

```js
router.get("/intelligence", checkPermission("analytics.view"), getAIIntelligence)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAIIntelligence`: [adminAIIntelligenceController.js](../../../../server/controllers/adminAIIntelligenceController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAIIntelligence`

Handler starts at [controller line 11](../../../../server/controllers/adminAIIntelligenceController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.countDocuments`, `Payment.countDocuments`, `Booking.aggregate`, `Review.aggregate`, `Tour.countDocuments`, `User.countDocuments`, `Vehicle.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/intelligence'
```

### GET /alerts → `/api/admin-ai/alerts`

Declared at source line 88. Route handler pipeline names: `checkPermission`, `getAIAlerts`.

```js
router.get("/alerts", checkPermission("analytics.view"), getAIAlerts)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAIAlerts`: [adminAIAlertsController.js](../../../../server/controllers/adminAIAlertsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAIAlerts`

Handler starts at [controller line 8](../../../../server/controllers/adminAIAlertsController.js#L8). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Vehicle availability is low. Check upcoming tours.”.
- Database operations detected: `Booking.countDocuments`, `Payment.countDocuments`, `Review.aggregate`, `Vehicle.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/alerts'
```

### POST /customer-support → `/api/admin-ai/customer-support`

Declared at source line 89. Route handler pipeline names: `checkPermission`, `generateCustomerReply`.

```js
router.post("/customer-support", checkPermission("analytics.view"), generateCustomerReply)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `generateCustomerReply`: [adminAICustomerSupportController.js](../../../../server/controllers/adminAICustomerSupportController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `generateCustomerReply`

Handler starts at [controller line 5](../../../../server/controllers/adminAICustomerSupportController.js#L5). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `customerMessage`, `tone`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Customer message required.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 16](../../../../server/controllers/adminAICustomerSupportController.js#L16): `} = req.body;`
  - [Line 21](../../../../server/controllers/adminAICustomerSupportController.js#L21): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin-ai/customer-support'
```

### GET /revenue-advice → `/api/admin-ai/revenue-advice`

Declared at source line 90. Route handler pipeline names: `checkPermission`, `getAIRevenueAdvice`.

```js
router.get("/revenue-advice", checkPermission("analytics.view"), getAIRevenueAdvice)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAIRevenueAdvice`: [adminAIRevenueController.js](../../../../server/controllers/adminAIRevenueController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAIRevenueAdvice`

Handler starts at [controller line 8](../../../../server/controllers/adminAIRevenueController.js#L8). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.countDocuments`, `Tour.countDocuments`, `Booking.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/revenue-advice'
```

### GET /booking-risks → `/api/admin-ai/booking-risks`

Declared at source line 91. Route handler pipeline names: `checkPermission`, `getBookingRiskAnalysis`.

```js
router.get("/booking-risks", checkPermission("analytics.view"), getBookingRiskAnalysis)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getBookingRiskAnalysis`: [adminAIBookingRiskController.js](../../../../server/controllers/adminAIBookingRiskController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getBookingRiskAnalysis`

Handler starts at [controller line 6](../../../../server/controllers/adminAIBookingRiskController.js#L6). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Cancelled bookings are higher than pending bookings. Review customer experience.”; “No major booking risks detected.”.
- Database operations detected: `Booking.countDocuments`, `Payment.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/booking-risks'
```

### GET /tasks → `/api/admin-ai/tasks`

Declared at source line 92. Route handler pipeline names: `checkPermission`, `generateAITasks`.

```js
router.get("/tasks", checkPermission("analytics.view"), generateAITasks)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `generateAITasks`: [adminAITaskController.js](../../../../server/controllers/adminAITaskController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `generateAITasks`

Handler starts at [controller line 10](../../../../server/controllers/adminAITaskController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `Booking.countDocuments`, `Payment.countDocuments`, `Review.countDocuments`, `AITask.findOneAndUpdate`, `AITask.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/tasks'
```

### PATCH /tasks/:id → `/api/admin-ai/tasks/:id`

Declared at source line 93. Route handler pipeline names: `checkPermission`, `updateAITask`.

```js
router.patch("/tasks/:id", checkPermission("analytics.view"), updateAITask)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `updateAITask`: [adminAITaskController.js](../../../../server/controllers/adminAITaskController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateAITask`

Handler starts at [controller line 165](../../../../server/controllers/adminAITaskController.js#L165). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `AITask.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 177](../../../../server/controllers/adminAITaskController.js#L177): `_id:req.params.id`
  - [Line 181](../../../../server/controllers/adminAITaskController.js#L181): `status:req.body.status`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin-ai/tasks/<id>'
```

### GET /pricing-advice → `/api/admin-ai/pricing-advice`

Declared at source line 94. Route handler pipeline names: `checkPermission`, `getTourPricingAdvice`.

```js
router.get("/pricing-advice", checkPermission("analytics.view"), getTourPricingAdvice)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getTourPricingAdvice`: [adminAITourPricingController.js](../../../../server/controllers/adminAITourPricingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourPricingAdvice`

Handler starts at [controller line 8](../../../../server/controllers/adminAITourPricingController.js#L8). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `Tour.find`, `Booking.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/pricing-advice'
```

### GET /recommendations/:customerId → `/api/admin-ai/recommendations/:customerId`

Declared at source line 95. Route handler pipeline names: `checkPermission`, `getTourRecommendations`.

```js
router.get("/recommendations/:customerId", checkPermission("analytics.view"), getTourRecommendations)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getTourRecommendations`: [adminAITourRecommendationController.js](../../../../server/controllers/adminAITourRecommendationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourRecommendations`

Handler starts at [controller line 7](../../../../server/controllers/adminAITourRecommendationController.js#L7). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `customerId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Customer not found”.
- Database operations detected: `User.findById`, `Booking.find`, `Tour.find`.
- Input/validation source lines to inspect:
  - [Line 19](../../../../server/controllers/adminAITourRecommendationController.js#L19): `}=req.params;`
  - [Line 34](../../../../server/controllers/adminAITourRecommendationController.js#L34): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/recommendations/<customerId>'
```

### GET /fraud-monitoring → `/api/admin-ai/fraud-monitoring`

Declared at source line 96. Route handler pipeline names: `checkPermission`, `getAIFraudMonitoring`.

```js
router.get("/fraud-monitoring", checkPermission("analytics.view"), getAIFraudMonitoring)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAIFraudMonitoring`: [adminAIFraudController.js](../../../../server/controllers/adminAIFraudController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAIFraudMonitoring`

Handler starts at [controller line 6](../../../../server/controllers/adminAIFraudController.js#L6). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “No suspicious payment activity detected.”.
- Database operations detected: `Payment.countDocuments`, `Payment.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/fraud-monitoring'
```

### GET /sentiment → `/api/admin-ai/sentiment`

Declared at source line 97. Route handler pipeline names: `checkPermission`, `getAISentimentAnalysis`.

```js
router.get("/sentiment", checkPermission("analytics.view"), getAISentimentAnalysis)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAISentimentAnalysis`: [adminAISentimentController.js](../../../../server/controllers/adminAISentimentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAISentimentAnalysis`

Handler starts at [controller line 6](../../../../server/controllers/adminAISentimentController.js#L6). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Review.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/sentiment'
```

### GET /marketing-campaigns → `/api/admin-ai/marketing-campaigns`

Declared at source line 98. Route handler pipeline names: `checkPermission`, `generateAIMarketingCampaign`.

```js
router.get("/marketing-campaigns", checkPermission("analytics.view"), generateAIMarketingCampaign)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `generateAIMarketingCampaign`: [adminAIMarketingController.js](../../../../server/controllers/adminAIMarketingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `generateAIMarketingCampaign`

Handler starts at [controller line 7](../../../../server/controllers/adminAIMarketingController.js#L7). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Explore unforgettable African destinations with our special travel offers.”; “Come back and discover another amazing African experience.”; “Enjoy premium tours at special seasonal prices.”.
- Database operations detected: `Tour.countDocuments`, `Booking.countDocuments`, `User.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/marketing-campaigns'
```

### GET /financial-forecast → `/api/admin-ai/financial-forecast`

Declared at source line 99. Route handler pipeline names: `checkPermission`, `getAIFinancialForecast`.

```js
router.get("/financial-forecast", checkPermission("analytics.view"), getAIFinancialForecast)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAIFinancialForecast`: [adminAIFinanceForecastController.js](../../../../server/controllers/adminAIFinanceForecastController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAIFinancialForecast`

Handler starts at [controller line 6](../../../../server/controllers/adminAIFinanceForecastController.js#L6). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Payment.aggregate`, `Booking.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/financial-forecast'
```

### GET /operations-center → `/api/admin-ai/operations-center`

Declared at source line 100. Route handler pipeline names: `checkPermission`, `getAIOperationsCenter`.

```js
router.get("/operations-center", checkPermission("analytics.view"), getAIOperationsCenter)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAIOperationsCenter`: [adminAIOperationsController.js](../../../../server/controllers/adminAIOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAIOperationsCenter`

Handler starts at [controller line 9](../../../../server/controllers/adminAIOperationsController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Vehicle capacity may affect upcoming tours.”; “Customer ratings require improvement.”; “No major operational risks detected.”.
- Database operations detected: `Booking.countDocuments`, `Payment.aggregate`, `Vehicle.countDocuments`, `Tour.countDocuments`, `Review.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/operations-center'
```

### GET /sales-assistant → `/api/admin-ai/sales-assistant`

Declared at source line 101. Route handler pipeline names: `checkPermission`, `getAISalesAssistant`.

```js
router.get("/sales-assistant", checkPermission("analytics.view"), getAISalesAssistant)
```

- Imported handler/middleware `checkPermission`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAISalesAssistant`: [adminAISalesController.js](../../../../server/controllers/adminAISalesController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAISalesAssistant`

Handler starts at [controller line 8](../../../../server/controllers/adminAISalesController.js#L8). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Literal messages include: “Thank you for your interest. We can help you choose the perfect African adventure based on your budget and travel dates.”; “We noticed you were interested in our tours. Would you like us to prepare a personalized travel package?”; “Enhance your experience with airport transfers, accommodation and guided activities.”.
- Database operations detected: `Booking.countDocuments`, `User.countDocuments`, `Tour.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin-ai/sales-assistant'
```


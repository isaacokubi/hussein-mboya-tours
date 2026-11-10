# API endpoints: admin-ai

This guide contains 19 mounted method/path inventory entries in the **admin-ai** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-1 — GET /api/admin-ai/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 1 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAIDashboard`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/dashboard", checkPermission("analytics.view"), getAIDashboard)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI dashboard contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Handler, tenant-scoped reads, revenue service, response shape and error delegation were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-2 — POST /api/admin-ai/query

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 2 of 629<br>
**Route declaration pipeline:** `checkPermission`, `adminAIQuery`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.post("/query", checkPermission("analytics.view"), adminAIQuery)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `message`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI dashboard and query contracts](../API_DOMAIN_CONTRACTS/admin-ai.md). The controller, prompt service, fallback path, and conditional booking draft write were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-3 — GET /api/admin-ai/analytics

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 3 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAIAnalytics`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/analytics", checkPermission("analytics.view"), getAIAnalytics)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI analytics contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Aggregation filters, output groups, populated references, and known query boundaries were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-4 — GET /api/admin-ai/briefing

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 4 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAIBriefing`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/briefing", checkPermission("analytics.view"), getAIBriefing)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI briefing contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Tenant-scoped counts, revenue/rating calculation, recommendation conditions, and response defaults were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-5 — GET /api/admin-ai/intelligence

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 5 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAIIntelligence`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/intelligence", checkPermission("analytics.view"), getAIIntelligence)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI intelligence contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Tenant aggregation scope, metric definitions, service dependency, joined tour reference and recommendation conditions were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-6 — GET /api/admin-ai/alerts

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 6 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAIAlerts`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/alerts", checkPermission("analytics.view"), getAIAlerts)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI alerts contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Query predicates confirm the handler omits tenant filters; alert thresholds and response shapes were traced from source.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-7 — POST /api/admin-ai/customer-support

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 7 of 629<br>
**Route declaration pipeline:** `checkPermission`, `generateCustomerReply`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.post("/customer-support", checkPermission("analytics.view"), generateCustomerReply)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `customerMessage`, `tone`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin AI customer-support contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Request defaults, prompt construction, provider fallback, and conditional booking-draft side effect were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-8 — GET /api/admin-ai/revenue-advice

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 8 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAIRevenueAdvice`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/revenue-advice", checkPermission("analytics.view"), getAIRevenueAdvice)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI revenue-advice contract](../API_DOMAIN_CONTRACTS/admin-ai.md). The tenant-scoped counts, revenue dependency, top-tour aggregation, recommendation thresholds and response fields were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-9 — GET /api/admin-ai/booking-risks

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 9 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getBookingRiskAnalysis`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/booking-risks", checkPermission("analytics.view"), getBookingRiskAnalysis)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI booking-risk contract](../API_DOMAIN_CONTRACTS/admin-ai.md). The route gate, four count queries, risk thresholds and output shape were inspected directly. The controller omits inline tenant predicates, and model query middleware applies the active tenant filter.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-10 — GET /api/admin-ai/tasks

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 10 of 629<br>
**Route declaration pipeline:** `checkPermission`, `generateAITasks`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/tasks", checkPermission("analytics.view"), generateAITasks)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin AI task contracts](../API_DOMAIN_CONTRACTS/admin-ai.md), section `GET /api/admin-ai/tasks`. Controller and tenant model middleware behavior were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-11 — PATCH /api/admin-ai/tasks/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 11 of 629<br>
**Route declaration pipeline:** `checkPermission`, `updateAITask`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.patch("/tasks/:id", checkPermission("analytics.view"), updateAITask)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin AI task contracts](../API_DOMAIN_CONTRACTS/admin-ai.md), section `PATCH /api/admin-ai/tasks/:id`. Controller and tenant model middleware behavior were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-12 — GET /api/admin-ai/pricing-advice

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 12 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getTourPricingAdvice`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/pricing-advice", checkPermission("analytics.view"), getTourPricingAdvice)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Source-traced contract:** See [Admin AI pricing-advice contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Tour projection, tenant aggregation middleware, threshold rules and response fields were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-13 — GET /api/admin-ai/recommendations/:customerId

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 13 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getTourRecommendations`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/recommendations/:customerId", checkPermission("analytics.view"), getTourRecommendations)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `customerId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Admin AI tour recommendation contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Customer lookup, tenant-scoped booking history/tour queries, response transformation, static ranking behavior and soft-delete omission were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-14 — GET /api/admin-ai/fraud-monitoring

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 14 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAIFraudMonitoring`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/fraud-monitoring", checkPermission("analytics.view"), getAIFraudMonitoring)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI fraud-monitoring contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Tenant model hooks, thresholds, duplicate grouping and response semantics were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-15 — GET /api/admin-ai/sentiment

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 15 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAISentimentAnalysis`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/sentiment", checkPermission("analytics.view"), getAISentimentAnalysis)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI sentiment contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Tenant review query, rating thresholds, response aggregation and unpopulated customer name behavior were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-16 — GET /api/admin-ai/marketing-campaigns

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 16 of 629<br>
**Route declaration pipeline:** `checkPermission`, `generateAIMarketingCampaign`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/marketing-campaigns", checkPermission("analytics.view"), generateAIMarketingCampaign)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI marketing-campaign contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Tenant-scoped count hooks, fixed campaign data and non-AI/read-only behavior were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-17 — GET /api/admin-ai/financial-forecast

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 17 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAIFinancialForecast`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/financial-forecast", checkPermission("analytics.view"), getAIFinancialForecast)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI financial-forecast contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Tenant-scoped monthly histories, averaging semantics, thresholds and response shapes were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-18 — GET /api/admin-ai/operations-center

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 18 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAIOperationsCenter`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/operations-center", checkPermission("analytics.view"), getAIOperationsCenter)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI operations-center contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Tenant model hooks, source counters, health formula, threshold rules and output shapes were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-19 — GET /api/admin-ai/sales-assistant

**Contract status:** SOURCE-TRACED<br>
**Router:** [adminAIRoutes.js](../../server/routes/adminAIRoutes.js) · [route module explanation](../code-explanations/backend/routes/adminAIRoutes.md)<br>
**Mounted inventory entry:** 19 of 629<br>
**Route declaration pipeline:** `checkPermission`, `getAISalesAssistant`
**Router-wide middleware:** protect; resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get("/sales-assistant", checkPermission("analytics.view"), getAISalesAssistant)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [Admin AI sales-assistant contract](../API_DOMAIN_CONTRACTS/admin-ai.md). Tenant-scoped counts, conversion calculation, static recommendations/scripts, and no-AI behavior were inspected directly.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


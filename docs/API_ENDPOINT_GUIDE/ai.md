# API endpoints: ai

This guide contains 7 mounted method/path inventory entries in the **ai** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-159 — GET /api/ai/admin/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [aiRoutes.js](../../server/routes/aiRoutes.js) · [route module explanation](../code-explanations/backend/routes/aiRoutes.md)<br>
**Mounted inventory entry:** 159 of 629<br>
**Route declaration pipeline:** `protect`, `getAIDashboard`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/admin/dashboard", protect, getAIDashboard)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [`/api/ai/admin` route contracts](../API_DOMAIN_CONTRACTS/ai-admin-aliases.md); authz differences from `/api/admin-ai` are documented there.

## endpoint-160 — POST /api/ai/admin/query

**Contract status:** SOURCE-TRACED<br>
**Router:** [aiRoutes.js](../../server/routes/aiRoutes.js) · [route module explanation](../code-explanations/backend/routes/aiRoutes.md)<br>
**Mounted inventory entry:** 160 of 629<br>
**Route declaration pipeline:** `protect`, `adminAIQuery`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/admin/query", protect, adminAIQuery)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `message`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [`/api/ai/admin` route contracts](../API_DOMAIN_CONTRACTS/ai-admin-aliases.md); authz differences from `/api/admin-ai` are documented there.

## endpoint-161 — GET /api/ai/admin/analytics

**Contract status:** SOURCE-TRACED<br>
**Router:** [aiRoutes.js](../../server/routes/aiRoutes.js) · [route module explanation](../code-explanations/backend/routes/aiRoutes.md)<br>
**Mounted inventory entry:** 161 of 629<br>
**Route declaration pipeline:** `protect`, `getAIAnalytics`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/admin/analytics", protect, getAIAnalytics)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [`/api/ai/admin` route contracts](../API_DOMAIN_CONTRACTS/ai-admin-aliases.md); authz differences from `/api/admin-ai` are documented there.

## endpoint-162 — GET /api/ai/admin/briefing

**Contract status:** SOURCE-TRACED<br>
**Router:** [aiRoutes.js](../../server/routes/aiRoutes.js) · [route module explanation](../code-explanations/backend/routes/aiRoutes.md)<br>
**Mounted inventory entry:** 162 of 629<br>
**Route declaration pipeline:** `protect`, `getAIBriefing`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/admin/briefing", protect, getAIBriefing)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Source-traced contract:** See [`/api/ai/admin` route contracts](../API_DOMAIN_CONTRACTS/ai-admin-aliases.md); authz differences from `/api/admin-ai` are documented there.

## endpoint-163 — POST /api/ai/assistant

**Contract status:** SOURCE-TRACED<br>
**Router:** [aiRoutes.js](../../server/routes/aiRoutes.js) · [route module explanation](../code-explanations/backend/routes/aiRoutes.md)<br>
**Mounted inventory entry:** 163 of 629<br>
**Route declaration pipeline:** `protect`, `aiRateLimiter`, `askAI`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/assistant", protect, aiRateLimiter, askAI)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `message`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `502`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [AI assistant and booking contracts](../API_DOMAIN_CONTRACTS/ai-assistant-booking.md); exact route differences and side effects are documented there.

## endpoint-164 — POST /api/ai/chat

**Contract status:** SOURCE-TRACED<br>
**Router:** [aiRoutes.js](../../server/routes/aiRoutes.js) · [route module explanation](../code-explanations/backend/routes/aiRoutes.md)<br>
**Mounted inventory entry:** 164 of 629<br>
**Route declaration pipeline:** `protect`, `aiRateLimiter`, `askAI`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/chat", protect, aiRateLimiter, askAI)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `message`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `502`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [AI assistant and booking contracts](../API_DOMAIN_CONTRACTS/ai-assistant-booking.md); exact route differences and side effects are documented there.

## endpoint-165 — POST /api/ai/booking/complete

**Contract status:** SOURCE-TRACED<br>
**Router:** [aiRoutes.js](../../server/routes/aiRoutes.js) · [route module explanation](../code-explanations/backend/routes/aiRoutes.md)<br>
**Mounted inventory entry:** 165 of 629<br>
**Route declaration pipeline:** `protect`, `aiRateLimiter`, `completeBooking`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/booking/complete", protect, aiRateLimiter, completeBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [AI assistant and booking contracts](../API_DOMAIN_CONTRACTS/ai-assistant-booking.md); exact route differences and side effects are documented there.


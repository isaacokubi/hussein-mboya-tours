# API endpoints: integrations

This guide contains 11 mounted method/path inventory entries in the **integrations** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-301 — POST /api/integrations/keys

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 301 of 629<br>
**Route declaration pipeline:** `protect`, `authorize`, `createIntegrationKey`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.post("/keys", protect, authorize("settings.manage"), createIntegrationKey)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `allowedOrigins`, `permissions`, `environment`, `name`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `400`, `201`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
## endpoint-302 — GET /api/integrations/keys

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 302 of 629<br>
**Route declaration pipeline:** `protect`, `authorize`, `listIntegrationKeys`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/keys", protect, authorize("settings.manage"), listIntegrationKeys)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
## endpoint-303 — DELETE /api/integrations/keys/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 303 of 629<br>
**Route declaration pipeline:** `protect`, `authorize`, `revokeIntegrationKey`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.delete("/keys/:id", protect, authorize("settings.manage"), revokeIntegrationKey)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `404`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
## endpoint-304 — GET /api/integrations/v1/config

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 304 of 629<br>
**Route declaration pipeline:** `requirePublicIntegrationKey`, `requireIntegrationPermission`, `getIntegrationConfig`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/v1/config", requirePublicIntegrationKey, requireIntegrationPermission("tour:read"), getIntegrationConfig)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
## endpoint-305 — GET /api/integrations/v1/tours

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 305 of 629<br>
**Route declaration pipeline:** `requirePublicIntegrationKey`, `requireIntegrationPermission`, `listIntegrationTours`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/v1/tours", requirePublicIntegrationKey, requireIntegrationPermission("tour:read"), listIntegrationTours)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `limit`, `search`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
## endpoint-306 — GET /api/integrations/v1/widget.js

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 306 of 629<br>
**Route declaration pipeline:** `requirePublicIntegrationKey`, `requireIntegrationPermission`, `getIntegrationWidget`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/v1/widget.js", requirePublicIntegrationKey, requireIntegrationPermission("booking:create"), getIntegrationWidget)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `siteKey`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
## endpoint-307 — POST /api/integrations/v1/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 307 of 629<br>
**Route declaration pipeline:** `requirePublicIntegrationKey`, `requireIntegrationPermission`, `createExternalBooking`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/v1/bookings", requirePublicIntegrationKey, requireIntegrationPermission("booking:create"), createExternalBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `externalBookingId`, `bookingId`, `reference`, `source`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `duplicate`, `booking`.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
## endpoint-308 — POST /api/integrations/v1/leads

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 308 of 629<br>
**Route declaration pipeline:** `requirePublicIntegrationKey`, `requireIntegrationPermission`, `createWebsiteLead`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/v1/leads", requirePublicIntegrationKey, requireIntegrationPermission("lead:create"), createWebsiteLead)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
## endpoint-309 — POST /api/integrations/v1/server/bookings

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 309 of 629<br>
**Route declaration pipeline:** `requireIntegrationKey`, `requireIntegrationPermission`, `createExternalBooking`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/v1/server/bookings", requireIntegrationKey, requireIntegrationPermission("booking:create"), createExternalBooking)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `externalBookingId`, `bookingId`, `reference`, `source`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `duplicate`, `booking`.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
## endpoint-310 — GET /api/integrations/leads

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 310 of 629<br>
**Route declaration pipeline:** `protect`, `authorize`, `listWebsiteLeads`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/leads", protect, authorize("settings.manage"), listWebsiteLeads)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `limit`, `status`, `search`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
## endpoint-311 — PATCH /api/integrations/leads/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [integrationRoutes.js](../../server/routes/integrationRoutes.js) · [route module explanation](../code-explanations/backend/routes/integrationRoutes.md)<br>
**Mounted inventory entry:** 311 of 629<br>
**Route declaration pipeline:** `protect`, `authorize`, `updateWebsiteLead`
**Router-wide middleware:** "/v1", integrationLimiter
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.patch("/leads/:id", protect, authorize("settings.manage"), updateWebsiteLead)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [website integration contracts](../API_DOMAIN_CONTRACTS/website-integrations.md) for key, origin, permission and handler details.
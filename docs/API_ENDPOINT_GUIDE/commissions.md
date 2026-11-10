# API endpoints: commissions

This guide contains 4 mounted method/path inventory entries in the **commissions** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-200 — GET /api/commissions

**Contract status:** SOURCE-TRACED<br>
**Router:** [commissionRoutes.js](../../server/routes/commissionRoutes.js) · [route module explanation](../code-explanations/backend/routes/commissionRoutes.md)<br>
**Mounted inventory entry:** 200 of 629<br>
**Route declaration pipeline:** `getCommissions`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("commission.view")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("commission.view"

**Source declaration:**

```js
router.get(
"/",
getCommissions
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`, `message`.

**Source-traced contract:** See [Administrative commission APIs](../API_DOMAIN_CONTRACTS/commission-admin.md), including manual payout and partial-failure behavior.

## endpoint-201 — GET /api/commissions/agent/:agentId

**Contract status:** SOURCE-TRACED<br>
**Router:** [commissionRoutes.js](../../server/routes/commissionRoutes.js) · [route module explanation](../code-explanations/backend/routes/commissionRoutes.md)<br>
**Mounted inventory entry:** 201 of 629<br>
**Route declaration pipeline:** `getAgentCommissions`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("commission.view")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("commission.view"

**Source declaration:**

```js
router.get(
"/agent/:agentId",
getAgentCommissions
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `agentId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Administrative commission APIs](../API_DOMAIN_CONTRACTS/commission-admin.md), including manual payout and partial-failure behavior.

## endpoint-202 — PATCH /api/commissions/:id/approve

**Contract status:** SOURCE-TRACED<br>
**Router:** [commissionRoutes.js](../../server/routes/commissionRoutes.js) · [route module explanation](../code-explanations/backend/routes/commissionRoutes.md)<br>
**Mounted inventory entry:** 202 of 629<br>
**Route declaration pipeline:** `adminMiddleware`, `approveCommission`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("commission.view")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("commission.view"

**Source declaration:**

```js
router.patch("/:id/approve", adminMiddleware, approveCommission)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Source-traced contract:** See [Administrative commission APIs](../API_DOMAIN_CONTRACTS/commission-admin.md), including manual payout and partial-failure behavior.

## endpoint-203 — POST /api/commissions/:id/pay

**Contract status:** SOURCE-TRACED<br>
**Router:** [commissionRoutes.js](../../server/routes/commissionRoutes.js) · [route module explanation](../code-explanations/backend/routes/commissionRoutes.md)<br>
**Mounted inventory entry:** 203 of 629<br>
**Route declaration pipeline:** `adminMiddleware`, `payCommission`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("commission.view")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("commission.view"

**Source declaration:**

```js
router.post("/:id/pay", adminMiddleware, payCommission)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `paymentMethod`, `paymentReference`, `transactionId`, `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `code`, `data`.

**Source-traced contract:** See [Administrative commission APIs](../API_DOMAIN_CONTRACTS/commission-admin.md), including manual payout and partial-failure behavior.


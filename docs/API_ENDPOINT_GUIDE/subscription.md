# API endpoints: subscription

This guide contains 3 mounted method/path inventory entries in the **subscription** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-512 — GET /api/subscription

**Contract status:** SOURCE-TRACED<br>
**Router:** [tenantSubscriptionRoutes.js](../../server/routes/tenantSubscriptionRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantSubscriptionRoutes.md)<br>
**Mounted inventory entry:** 512 of 629<br>
**Route declaration pipeline:** `getTenantSubscription`
**Router-wide middleware:** protect, resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", getTenantSubscription)
```

**Source-traced behavior:** See [Tenant subscription and M-Pesa checkout API contracts](../API_DOMAIN_CONTRACTS/tenant-subscriptions.md) for tenant authorization, subscription data, STK Push initiation, provider credential scope and payment status lookup.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-513 — POST /api/subscription/mpesa

**Contract status:** SOURCE-TRACED<br>
**Router:** [tenantSubscriptionRoutes.js](../../server/routes/tenantSubscriptionRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantSubscriptionRoutes.md)<br>
**Mounted inventory entry:** 513 of 629<br>
**Route declaration pipeline:** `startTenantSubscriptionPayment`
**Router-wide middleware:** protect, resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/mpesa", startTenantSubscriptionPayment)
```

**Source-traced behavior:** See [Tenant subscription and M-Pesa checkout API contracts](../API_DOMAIN_CONTRACTS/tenant-subscriptions.md) for tenant authorization, subscription data, STK Push initiation, provider credential scope and payment status lookup.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-514 — GET /api/subscription/payment/:checkoutRequestId

**Contract status:** SOURCE-TRACED<br>
**Router:** [tenantSubscriptionRoutes.js](../../server/routes/tenantSubscriptionRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantSubscriptionRoutes.md)<br>
**Mounted inventory entry:** 514 of 629<br>
**Route declaration pipeline:** `getTenantSubscriptionPaymentStatus`
**Router-wide middleware:** protect, resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/payment/:checkoutRequestId", getTenantSubscriptionPaymentStatus)
```

**Source-traced behavior:** See [Tenant subscription and M-Pesa checkout API contracts](../API_DOMAIN_CONTRACTS/tenant-subscriptions.md) for tenant authorization, subscription data, STK Push initiation, provider credential scope and payment status lookup.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.


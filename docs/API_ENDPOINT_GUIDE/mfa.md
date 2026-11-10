# API endpoints: mfa

This guide contains 2 mounted method/path inventory entries in the **mfa** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-316 — POST /api/mfa/customer/send-pin

**Contract status:** SOURCE-TRACED<br>
**Router:** [mfaRoutes.js](../../server/routes/mfaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mfaRoutes.md)<br>
**Mounted inventory entry:** 316 of 629<br>
**Route declaration pipeline:** `mfaSendRateLimiter`, `sendCustomerLoginPin`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post(
  "/customer/send-pin",
  mfaSendRateLimiter,
  sendCustomerLoginPin
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `userId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `401`, `200`, `429`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [customer login PIN contracts](../API_DOMAIN_CONTRACTS/customer-mfa.md) for throttles, persistence and failure handling.
## endpoint-317 — POST /api/mfa/customer/verify-pin

**Contract status:** SOURCE-TRACED<br>
**Router:** [mfaRoutes.js](../../server/routes/mfaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mfaRoutes.md)<br>
**Mounted inventory entry:** 317 of 629<br>
**Route declaration pipeline:** `mfaVerifyRateLimiter`, `verifyCustomerLoginPin`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post(
  "/customer/verify-pin",
  mfaVerifyRateLimiter,
  verifyCustomerLoginPin
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `userId`, `pin`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `401`, `429`, `200`.
- JSON envelope keys observed: `success`, `message`, `attemptsRemaining`.


**Source-traced contract:** See [customer login PIN contracts](../API_DOMAIN_CONTRACTS/customer-mfa.md) for throttles, persistence and failure handling.
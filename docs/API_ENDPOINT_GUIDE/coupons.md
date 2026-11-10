# API endpoints: coupons

This guide contains 1 mounted method/path inventory entries in the **coupons** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-209 — POST /api/coupons/validate

**Contract status:** SOURCE-TRACED<br>
**Router:** [couponRoutes.js](../../server/routes/couponRoutes.js) · [route module explanation](../code-explanations/backend/routes/couponRoutes.md)<br>
**Mounted inventory entry:** 209 of 629<br>
**Route declaration pipeline:** `validateCoupon`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/validate", validateCoupon)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `code`, `amount`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Coupon validation contract](../API_DOMAIN_CONTRACTS/coupon-validation.md); model/service field mismatches are recorded there.


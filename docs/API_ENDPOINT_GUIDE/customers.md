# API endpoints: customers

This guide contains 2 mounted method/path inventory entries in the **customers** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-222 — GET /api/customers

**Contract status:** SOURCE-TRACED<br>
**Router:** [customerRoutes.js](../../server/routes/customerRoutes.js) · [route module explanation](../code-explanations/backend/routes/customerRoutes.md)<br>
**Mounted inventory entry:** 222 of 629<br>
**Route declaration pipeline:** `getCustomers`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("manage_customers")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("manage_customers"

**Source declaration:**

```js
router.get(
  "/",
  getCustomers
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `search`, `page`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.


**Source-traced contract:** See [customer and destination contracts](../API_DOMAIN_CONTRACTS/customer-directory.md) for the verified request, response and behavior.
## endpoint-224 — GET /api/customers/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [customerRoutes.js](../../server/routes/customerRoutes.js) · [route module explanation](../code-explanations/backend/routes/customerRoutes.md)<br>
**Mounted inventory entry:** 224 of 629<br>
**Route declaration pipeline:** `getCustomerProfile`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("manage_customers")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("manage_customers"

**Source declaration:**

```js
router.get(
  "/:id",
  getCustomerProfile
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [customer and destination contracts](../API_DOMAIN_CONTRACTS/customer-directory.md) for the verified request, response and behavior.
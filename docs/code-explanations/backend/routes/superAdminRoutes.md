# Route module: superAdminRoutes.js

**Source:** [server/routes/superAdminRoutes.js](../../../../server/routes/superAdminRoutes.js)

Observed mount prefixes include `/api/superadmin/dashboard/metrics`, `/api/superadmin/dashboard`, `/api/superadmin/tenant-plans`, `/api/superadmin/tenants`, `/api/superadmin/tenants/:id`, `/api/superadmin/tenants/:tenantId/mpesa`, `/api/superadmin/tenants/:tenantId/mpesa/validate`, `/api/superadmin/tenants/:id/status`, `/api/superadmin/tenants/:id/subscription/activate`, `/api/superadmin/tenants/:id/subscription/plan`, `/api/superadmin/subscription-payments`, `/api/superadmin/billing/config`, `/api/superadmin/billing/features`, `/api/superadmin/users`, `/api/superadmin/users/accounts`, `/api/superadmin/users/:id/status`, `/api/superadmin/users/:id`, `/api/superadmin/audit`, `/api/superadmin/security`, `/api/superadmin/database`, `/api/superadmin/system`, `/api/superadmin/api-monitor`, `/api/superadmin/settings`, `/api/superadmin/maintenance/backup`, `/api/superadmin/database/backup`, `/api/superadmin/maintenance/cache`, `/api/superadmin/database/cache-clear`, `/api/superadmin/database/backups`, `/api/superadmin/maintenance/backups`, `/api/superadmin/maintenance/backups/:id`, `/api/superadmin/database/backups/:id`, `/api/superadmin/database/backup/:id/download`.

## Router-wide middleware

- `router.use(protect, superAdminOnly);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /dashboard/metrics → `/api/superadmin/dashboard/metrics`

Declared at source line 20. Route handler pipeline names: `getSuperAdminDashboardMetrics`.

```js
router.get("/dashboard/metrics", getSuperAdminDashboardMetrics)
```

- Imported handler/middleware `getSuperAdminDashboardMetrics`: [superAdminDashboardMetricsController.js](../../../../server/controllers/superAdminDashboardMetricsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getSuperAdminDashboardMetrics`

Handler starts at [controller line 11](../../../../server/controllers/superAdminDashboardMetricsController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Database connection is not ready.”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/dashboard/metrics'
```

### GET /dashboard → `/api/superadmin/dashboard`

Declared at source line 21. Route handler pipeline names: `getSuperAdminDashboardMetrics`.

```js
router.get("/dashboard", getSuperAdminDashboardMetrics)
```

- Imported handler/middleware `getSuperAdminDashboardMetrics`: [superAdminDashboardMetricsController.js](../../../../server/controllers/superAdminDashboardMetricsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getSuperAdminDashboardMetrics`

Handler starts at [controller line 11](../../../../server/controllers/superAdminDashboardMetricsController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Database connection is not ready.”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/dashboard'
```

### GET /tenant-plans → `/api/superadmin/tenant-plans`

Declared at source line 22. Route handler pipeline names: `getTenantPlans`.

```js
router.get("/tenant-plans", getTenantPlans)
```

- Imported handler/middleware `getTenantPlans`: [superAdminTenantController.js](../../../../server/controllers/superAdminTenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTenantPlans`

Handler starts at [controller line 45](../../../../server/controllers/superAdminTenantController.js#L45). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/tenant-plans'
```

### GET /tenants → `/api/superadmin/tenants`

Declared at source line 23. Route handler pipeline names: `listTenants`.

```js
router.get("/tenants", listTenants)
```

- Imported handler/middleware `listTenants`: [superAdminTenantController.js](../../../../server/controllers/superAdminTenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listTenants`

Handler starts at [controller line 133](../../../../server/controllers/superAdminTenantController.js#L133). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`, `pages`.
- Database operations detected: `Organization.find`, `Organization.countDocuments`, `User.findOne`.
- Input/validation source lines to inspect:
  - [Line 135](../../../../server/controllers/superAdminTenantController.js#L135): `const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100), search = String(req.query.search || "").trim();`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/tenants'
```

### POST /tenants → `/api/superadmin/tenants`

Declared at source line 24. Route handler pipeline names: `createTenantWithAdmin`.

```js
router.post("/tenants", createTenantWithAdmin)
```

- Imported handler/middleware `createTenantWithAdmin`: [superAdminTenantController.js](../../../../server/controllers/superAdminTenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createTenantWithAdmin`

Handler starts at [controller line 47](../../../../server/controllers/superAdminTenantController.js#L47). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `companyName`, `legalName`, `slug`, `companyEmail`, `companyPhone`, `domain`, `country`, `timezone`, `currency`, `plan`, `seats`, `websiteUrl`, `logoUrl`, `adminName`, `adminEmail`, `adminPhone`, `adminPassword`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `code`, `field`.
- Literal messages include: “Company name is required.”; “A valid company email is required.”; “Company phone must contain exactly 10 digits.”; “Primary administrator name and valid email are required.”; “Administrator phone must contain exactly 10 digits.”; “Administrator password must be at least 12 characters and include uppercase, lowercase and a number.”; “Invalid subscription plan.”; “User seats cannot exceed 10,000.”; “Enter a valid custom domain, for example www.example.com.”; “That custom domain is already assigned to another company.”.
- Database operations detected: `Organization.create`, `Role.findOne`, `User.create`, `SystemSetting.create`, `User.findById`.
- Input/validation source lines to inspect:
  - [Line 50](../../../../server/controllers/superAdminTenantController.js#L50): `const { companyName, legalName = "", slug: requestedSlug = "", companyEmail, companyPhone, domain: requestedDomain = "", country = "Kenya", timezone = "Africa/Nairobi", c`
  - [Line 51](../../../../server/controllers/superAdminTenantController.js#L51): `if (!String(companyName || "").trim()) return res.status(400).json({ success: false, message: "Company name is required." });`
  - [Line 52](../../../../server/controllers/superAdminTenantController.js#L52): `if (!/^\S+@\S+\.\S+$/.test(String(companyEmail || "").trim())) return res.status(400).json({ success: false, message: "A valid company email is required." });`
  - [Line 53](../../../../server/controllers/superAdminTenantController.js#L53): `if (!/^\d{10}$/.test(String(companyPhone || "").trim())) return res.status(400).json({ success: false, message: "Company phone must contain exactly 10 digits." });`
  - [Line 54](../../../../server/controllers/superAdminTenantController.js#L54): `if (!String(adminName || "").trim() || !/^\S+@\S+\.\S+$/.test(String(adminEmail || "").trim())) return res.status(400).json({ success: false, message: "Primary administra`
  - [Line 55](../../../../server/controllers/superAdminTenantController.js#L55): `if (!/^\d{10}$/.test(String(adminPhone || "").trim())) return res.status(400).json({ success: false, message: "Administrator phone must contain exactly 10 digits." });`
  - [Line 56](../../../../server/controllers/superAdminTenantController.js#L56): `if (!validateAdminPassword(adminPassword)) return res.status(400).json({ success: false, message: "Administrator password must be at least 12 characters and include upper`
  - [Line 58](../../../../server/controllers/superAdminTenantController.js#L58): `if (!selectedPlan) return res.status(400).json({ success: false, message: "Invalid subscription plan." });`
  - [Line 61](../../../../server/controllers/superAdminTenantController.js#L61): `if (effectiveSeats < selectedPlan.seats) return res.status(400).json({ success: false, code: "SEAT_LIMIT_BELOW_PLAN_MINIMUM", message: \`${selectedPlan.label} includes a `
  - [Line 62](../../../../server/controllers/superAdminTenantController.js#L62): `if (effectiveSeats > 10000) return res.status(400).json({ success: false, message: "User seats cannot exceed 10,000." });`
  - [Line 73](../../../../server/controllers/superAdminTenantController.js#L73): `if (requestedDomain && !domain) return res.status(400).json({ success: false, message: "Enter a valid custom domain, for example www.example.com." });`
  - [Line 74](../../../../server/controllers/superAdminTenantController.js#L74): `if (domain && await Organization.exists({ domain })) return res.status(409).json({ success: false, message: "That custom domain is already assigned to another company." }`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/tenants'
```

### GET /tenants/:id → `/api/superadmin/tenants/:id`

Declared at source line 25. Route handler pipeline names: `getTenant`.

```js
router.get("/tenants/:id", getTenant)
```

- Imported handler/middleware `getTenant`: [superAdminTenantController.js](../../../../server/controllers/superAdminTenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTenant`

Handler starts at [controller line 148](../../../../server/controllers/superAdminTenantController.js#L148). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tenant ID”; “Company not found”.
- Database operations detected: `Organization.findById`, `User.findOne`.
- Input/validation source lines to inspect:
  - [Line 150](../../../../server/controllers/superAdminTenantController.js#L150): `if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });`
  - [Line 151](../../../../server/controllers/superAdminTenantController.js#L151): `const tenant = await Organization.findById(req.params.id).lean();`
  - [Line 152](../../../../server/controllers/superAdminTenantController.js#L152): `if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/tenants/<id>'
```

### GET /tenants/:tenantId/mpesa → `/api/superadmin/tenants/:tenantId/mpesa`

Declared at source line 26. Route handler pipeline names: `getSuperAdminTenantMpesa`.

```js
router.get("/tenants/:tenantId/mpesa", getSuperAdminTenantMpesa)
```

- Imported handler/middleware `getSuperAdminTenantMpesa`: [superAdminMpesaGatewayController.js](../../../../server/controllers/superAdminMpesaGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/tenants/<tenantId>/mpesa'
```

### PUT /tenants/:tenantId/mpesa → `/api/superadmin/tenants/:tenantId/mpesa`

Declared at source line 27. Route handler pipeline names: `saveSuperAdminTenantMpesa`.

```js
router.put("/tenants/:tenantId/mpesa", saveSuperAdminTenantMpesa)
```

- Imported handler/middleware `saveSuperAdminTenantMpesa`: [superAdminMpesaGatewayController.js](../../../../server/controllers/superAdminMpesaGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/superadmin/tenants/<tenantId>/mpesa'
```

### POST /tenants/:tenantId/mpesa/validate → `/api/superadmin/tenants/:tenantId/mpesa/validate`

Declared at source line 28. Route handler pipeline names: `rateLimit`, `validateSuperAdminTenantMpesa`.

```js
router.post("/tenants/:tenantId/mpesa/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many configuration checks. Try again later." } }), validateSuperAdminTenantMpesa)
```

- Imported handler/middleware `rateLimit`: external dependency `express-rate-limit`
- Imported handler/middleware `validateSuperAdminTenantMpesa`: [superAdminMpesaGatewayController.js](../../../../server/controllers/superAdminMpesaGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/tenants/<tenantId>/mpesa/validate'
```

### DELETE /tenants/:tenantId/mpesa → `/api/superadmin/tenants/:tenantId/mpesa`

Declared at source line 29. Route handler pipeline names: `disableSuperAdminTenantMpesa`.

```js
router.delete("/tenants/:tenantId/mpesa", disableSuperAdminTenantMpesa)
```

- Imported handler/middleware `disableSuperAdminTenantMpesa`: [superAdminMpesaGatewayController.js](../../../../server/controllers/superAdminMpesaGatewayController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/superadmin/tenants/<tenantId>/mpesa'
```

### PATCH /tenants/:id/status → `/api/superadmin/tenants/:id/status`

Declared at source line 30. Route handler pipeline names: `updateTenantStatus`.

```js
router.patch("/tenants/:id/status", updateTenantStatus)
```

- Imported handler/middleware `updateTenantStatus`: [superAdminTenantController.js](../../../../server/controllers/superAdminTenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTenantStatus`

Handler starts at [controller line 158](../../../../server/controllers/superAdminTenantController.js#L158). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`, `plan`, `periodDays`, `transactionReference`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tenant ID”; “Invalid company status”; “Company not found”; “Invalid subscription plan.”.
- Database operations detected: `Organization.findById`, `Organization.findByIdAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 160](../../../../server/controllers/superAdminTenantController.js#L160): `const { status, plan, periodDays, transactionReference } = req.body || {};`
  - [Line 161](../../../../server/controllers/superAdminTenantController.js#L161): `if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });`
  - [Line 162](../../../../server/controllers/superAdminTenantController.js#L162): `if (!["active", "suspended", "trial", "cancelled"].includes(status)) return res.status(400).json({ success: false, message: "Invalid company status" });`
  - [Line 163](../../../../server/controllers/superAdminTenantController.js#L163): `const existingTenant = await Organization.findById(req.params.id).lean();`
  - [Line 164](../../../../server/controllers/superAdminTenantController.js#L164): `if (!existingTenant) return res.status(404).json({ success: false, message: "Company not found" });`
  - [Line 168](../../../../server/controllers/superAdminTenantController.js#L168): `if (!TENANT_PLANS[selectedPlan]) return res.status(400).json({ success: false, message: "Invalid subscription plan." });`
  - [Line 192](../../../../server/controllers/superAdminTenantController.js#L192): `const tenant = await Organization.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true }).lean();`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/superadmin/tenants/<id>/status'
```

### POST /tenants/:id/subscription/activate → `/api/superadmin/tenants/:id/subscription/activate`

Declared at source line 31. Route handler pipeline names: `approveTenantSubscription`.

```js
router.post("/tenants/:id/subscription/activate", approveTenantSubscription)
```

- Imported handler/middleware `approveTenantSubscription`: [tenantSubscriptionController.js](../../../../server/controllers/tenantSubscriptionController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `approveTenantSubscription`

Handler starts at [controller line 47](../../../../server/controllers/tenantSubscriptionController.js#L47). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `plan`, `periodDays`, `reference`, `note`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `404`, `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Only the platform SuperAdmin can manually activate subscriptions.”; “Company not found.”; “The selected plan price is not configured by the platform owner.”; “A verified payment reference is required for manual activation.”.
- Database operations detected: `Organization.findById`, `SubscriptionPayment.create`.
- Input/validation source lines to inspect:
  - [Line 49](../../../../server/controllers/tenantSubscriptionController.js#L49): `if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can manually activate subscriptions." });`
  - [Line 50](../../../../server/controllers/tenantSubscriptionController.js#L50): `const tenantId = req.params.id;`
  - [Line 52](../../../../server/controllers/tenantSubscriptionController.js#L52): `if (!tenant) return res.status(404).json({ success: false, message: "Company not found." });`
  - [Line 53](../../../../server/controllers/tenantSubscriptionController.js#L53): `const plan = String(req.body?.plan || tenant.subscription?.plan || "starter").toLowerCase();`
  - [Line 54](../../../../server/controllers/tenantSubscriptionController.js#L54): `const days = Math.max(1, Math.min(Number(req.body?.periodDays) || 30, 3660));`
  - [Line 56](../../../../server/controllers/tenantSubscriptionController.js#L56): `if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ success: false, message: "The selected plan price is not configured by the platform owner." });`
  - [Line 57](../../../../server/controllers/tenantSubscriptionController.js#L57): `const reference = String(req.body?.reference || "").trim();`
  - [Line 58](../../../../server/controllers/tenantSubscriptionController.js#L58): `if (!reference) return res.status(400).json({ success: false, message: "A verified payment reference is required for manual activation." });`
  - [Line 59](../../../../server/controllers/tenantSubscriptionController.js#L59): `const payment = await SubscriptionPayment.create({ tenantId, userId: req.user._id, plan, amount, provider: "manual", status: "pending", periodDays: days, transactionRefer`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/tenants/<id>/subscription/activate'
```

### PATCH /tenants/:id/subscription/plan → `/api/superadmin/tenants/:id/subscription/plan`

Declared at source line 32. Route handler pipeline names: `switchTenantSubscription`.

```js
router.patch("/tenants/:id/subscription/plan", switchTenantSubscription)
```

- Imported handler/middleware `switchTenantSubscription`: [tenantSubscriptionController.js](../../../../server/controllers/tenantSubscriptionController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `switchTenantSubscription`

Handler starts at [controller line 65](../../../../server/controllers/tenantSubscriptionController.js#L65). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `plan`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Only the platform SuperAdmin can switch tenant subscription plans.”; “A subscription plan is required.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 67](../../../../server/controllers/tenantSubscriptionController.js#L67): `if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can switch tenant subscription plans." });`
  - [Line 68](../../../../server/controllers/tenantSubscriptionController.js#L68): `const tenantId = req.params.id;`
  - [Line 69](../../../../server/controllers/tenantSubscriptionController.js#L69): `const plan = String(req.body?.plan || "").toLowerCase();`
  - [Line 70](../../../../server/controllers/tenantSubscriptionController.js#L70): `if (!plan) return res.status(400).json({ success: false, message: "A subscription plan is required." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/superadmin/tenants/<id>/subscription/plan'
```

### DELETE /tenants/:id → `/api/superadmin/tenants/:id`

Declared at source line 33. Route handler pipeline names: `deleteTenant`.

```js
router.delete("/tenants/:id", deleteTenant)
```

- Imported handler/middleware `deleteTenant`: [superAdminTenantController.js](../../../../server/controllers/superAdminTenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteTenant`

Handler starts at [controller line 197](../../../../server/controllers/superAdminTenantController.js#L197). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `confirmation`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `403`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tenant ID”; “Permanent company deletion requires confirmation=”; “Only a SuperAdmin can permanently delete a company.”; “Company not found”; “The platform/system organization cannot be deleted.”.
- Database operations detected: `Organization.findById`, `Organization.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 200](../../../../server/controllers/superAdminTenantController.js#L200): `const { id } = req.params;`
  - [Line 201](../../../../server/controllers/superAdminTenantController.js#L201): `const confirmation = String(req.body?.confirmation || "").trim();`
  - [Line 202](../../../../server/controllers/superAdminTenantController.js#L202): `if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });`
  - [Line 203](../../../../server/controllers/superAdminTenantController.js#L203): `if (confirmation !== "DELETE") return res.status(400).json({ success: false, message: 'Permanent company deletion requires confirmation="DELETE".' });`
  - [Line 205](../../../../server/controllers/superAdminTenantController.js#L205): `if (!req.user || !["superadmin", "super_admin"].includes(requesterRole)) return res.status(403).json({ success: false, message: "Only a SuperAdmin can permanently delete `
  - [Line 207](../../../../server/controllers/superAdminTenantController.js#L207): `if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });`
  - [Line 210](../../../../server/controllers/superAdminTenantController.js#L210): `if (isPlatformOrganization) return res.status(403).json({ success: false, message: "The platform/system organization cannot be deleted." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/superadmin/tenants/<id>'
```

### GET /subscription-payments → `/api/superadmin/subscription-payments`

Declared at source line 34. Route handler pipeline names: `listSubscriptionPayments`.

```js
router.get("/subscription-payments", listSubscriptionPayments)
```

- Imported handler/middleware `listSubscriptionPayments`: [tenantSubscriptionController.js](../../../../server/controllers/tenantSubscriptionController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listSubscriptionPayments`

Handler starts at [controller line 76](../../../../server/controllers/tenantSubscriptionController.js#L76). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Only the platform SuperAdmin can view all subscription payments.”.
- Database operations detected: `SubscriptionPayment.find`.
- Input/validation source lines to inspect:
  - [Line 78](../../../../server/controllers/tenantSubscriptionController.js#L78): `if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can view all subscription payments." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/subscription-payments'
```

### GET /billing/config → `/api/superadmin/billing/config`

Declared at source line 35. Route handler pipeline names: `getPlatformBillingConfig`.

```js
router.get("/billing/config", getPlatformBillingConfig)
```

- Imported handler/middleware `getPlatformBillingConfig`: [platformBillingController.js](../../../../server/controllers/platformBillingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPlatformBillingConfig`

Handler starts at [controller line 12](../../../../server/controllers/platformBillingController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/billing/config'
```

### PUT /billing/config → `/api/superadmin/billing/config`

Declared at source line 36. Route handler pipeline names: `updatePlatformBillingConfig`.

```js
router.put("/billing/config", updatePlatformBillingConfig)
```

- Imported handler/middleware `updatePlatformBillingConfig`: [platformBillingController.js](../../../../server/controllers/platformBillingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updatePlatformBillingConfig`

Handler starts at [controller line 22](../../../../server/controllers/platformBillingController.js#L22). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `features`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `message`, `prices`, `features`, `currency`, `mpesa`.
- Literal messages include: “Subscription pricing and plan features saved successfully.”.
- Database operations detected: `SystemSetting.findOne`.
- Input/validation source lines to inspect:
  - [Line 29](../../../../server/controllers/platformBillingController.js#L29): `const value = Number(req.body?.[plan]);`
  - [Line 37](../../../../server/controllers/platformBillingController.js#L37): `const rawFeatures = req.body?.features;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/superadmin/billing/config'
```

### GET /billing/features → `/api/superadmin/billing/features`

Declared at source line 37. Route handler pipeline names: `getPlatformPlanFeatureCatalog`.

```js
router.get("/billing/features", getPlatformPlanFeatureCatalog)
```

- Imported handler/middleware `getPlatformPlanFeatureCatalog`: [platformBillingController.js](../../../../server/controllers/platformBillingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPlatformPlanFeatureCatalog`

Handler starts at [controller line 48](../../../../server/controllers/platformBillingController.js#L48). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/billing/features'
```

### GET /users → `/api/superadmin/users`

Declared at source line 38. Route handler pipeline names: `getSuperAdminUsers`.

```js
router.get("/users", getSuperAdminUsers)
```

- Imported handler/middleware `getSuperAdminUsers`: [superAdminUserController.js](../../../../server/controllers/superAdminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getSuperAdminUsers`

Handler starts at [controller line 11](../../../../server/controllers/superAdminUserController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `search`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `pages`, `count`, `users`.
- Database operations detected: `User.find`, `User.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 11](../../../../server/controllers/superAdminUserController.js#L11): `async (req, res, next) => { try { const page = Math.max(Number(req.query.page) || 1, 1); const limit = SUPERADMIN_USER_PAGE_SIZE; const search = String(req.query.search |`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/users'
```

### POST /users/accounts → `/api/superadmin/users/accounts`

Declared at source line 39. Route handler pipeline names: `createSuperAdminCompanyAccount`.

```js
router.post("/users/accounts", createSuperAdminCompanyAccount)
```

- Imported handler/middleware `createSuperAdminCompanyAccount`: [superAdminUserController.js](../../../../server/controllers/superAdminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/users/accounts'
```

### PATCH /users/:id/status → `/api/superadmin/users/:id/status`

Declared at source line 40. Route handler pipeline names: `updateSuperAdminUserStatus`.

```js
router.patch("/users/:id/status", updateSuperAdminUserStatus)
```

- Imported handler/middleware `updateSuperAdminUserStatus`: [superAdminUserController.js](../../../../server/controllers/superAdminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateSuperAdminUserStatus`

Handler starts at [controller line 14](../../../../server/controllers/superAdminUserController.js#L14). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid user ID”; “Invalid user status”; “User not found”.
- Database operations detected: `User.findByIdAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 14](../../../../server/controllers/superAdminUserController.js#L14): `async (req, res, next) => { try { const { id } = req.params; const { status } = req.body || {}; if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ su`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/superadmin/users/<id>/status'
```

### PUT /users/:id/status → `/api/superadmin/users/:id/status`

Declared at source line 41. Route handler pipeline names: `updateSuperAdminUserStatus`.

```js
router.put("/users/:id/status", updateSuperAdminUserStatus)
```

- Imported handler/middleware `updateSuperAdminUserStatus`: [superAdminUserController.js](../../../../server/controllers/superAdminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateSuperAdminUserStatus`

Handler starts at [controller line 14](../../../../server/controllers/superAdminUserController.js#L14). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid user ID”; “Invalid user status”; “User not found”.
- Database operations detected: `User.findByIdAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 14](../../../../server/controllers/superAdminUserController.js#L14): `async (req, res, next) => { try { const { id } = req.params; const { status } = req.body || {}; if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ su`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/superadmin/users/<id>/status'
```

### DELETE /users/:id → `/api/superadmin/users/:id`

Declared at source line 42. Route handler pipeline names: `deleteSuperAdminUser`.

```js
router.delete("/users/:id", deleteSuperAdminUser)
```

- Imported handler/middleware `deleteSuperAdminUser`: [superAdminUserController.js](../../../../server/controllers/superAdminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteSuperAdminUser`

Handler starts at [controller line 15](../../../../server/controllers/superAdminUserController.js#L15). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`, `deleted`.
- Literal messages include: “Invalid user ID”; “You cannot delete your own account.”; “User not found”; “SuperAdmin accounts cannot be deleted.”; “User account deleted successfully.”.
- Database operations detected: `User.findById`, `Staff.deleteMany`, `Agent.deleteMany`, `User.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 15](../../../../server/controllers/superAdminUserController.js#L15): `async (req, res, next) => { try { const { id } = req.params; if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid use`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/superadmin/users/<id>'
```

### GET /audit → `/api/superadmin/audit`

Declared at source line 43. Route handler pipeline names: `getAuditLogs`.

```js
router.get("/audit", getAuditLogs)
```

- Imported handler/middleware `getAuditLogs`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAuditLogs`

Handler starts at [controller line 20](../../../../server/controllers/superAdminOperationsController.js#L20). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `search`, `action`, `resource`, `status`, `severity`.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Database operations detected: `AuditLog.find`, `AuditLog.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 20](../../../../server/controllers/superAdminOperationsController.js#L20): `async (req, res) => { try { const { page = 1, search = "", action = "", resource = "", status = "", severity = "" } = req.query; const currentPage = Math.max(Number(page)`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/audit'
```

### GET /security → `/api/superadmin/security`

Declared at source line 44. Route handler pipeline names: inline callback.

```js
router.get("/security", async (req, res) => { try { const data = await securityService.getSecurityStatus(); return res.json({ success: true, data }); } catch (error) { console.error("SuperAdmin security status error:", error); return res.status(500).json({ success: false, message: error.message }); } })
```

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/security'
```

### GET /database → `/api/superadmin/database`

Declared at source line 45. Route handler pipeline names: `getDatabaseStatus`.

```js
router.get("/database", getDatabaseStatus)
```

- Imported handler/middleware `getDatabaseStatus`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getDatabaseStatus`

Handler starts at [controller line 23](../../../../server/controllers/superAdminOperationsController.js#L23). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Unable to read database status”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/database'
```

### GET /system → `/api/superadmin/system`

Declared at source line 46. Route handler pipeline names: `getSystemHealth`.

```js
router.get("/system", getSystemHealth)
```

- Imported handler/middleware `getSystemHealth`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getSystemHealth`

Handler starts at [controller line 25](../../../../server/controllers/superAdminOperationsController.js#L25). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Unable to read system health”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/system'
```

### GET /api-monitor → `/api/superadmin/api-monitor`

Declared at source line 47. Route handler pipeline names: `getApiMonitor`.

```js
router.get("/api-monitor", getApiMonitor)
```

- Imported handler/middleware `getApiMonitor`: [apiMonitorController.js](../../../../server/controllers/apiMonitorController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getApiMonitor`

Handler starts at [controller line 11](../../../../server/controllers/apiMonitorController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Unable to load API monitor status.”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/api-monitor'
```

### GET /settings → `/api/superadmin/settings`

Declared at source line 48. Route handler pipeline names: `getSettings`.

```js
router.get("/settings", getSettings)
```

- Imported handler/middleware `getSettings`: [settingsController.js](../../../../server/controllers/settingsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getSettings`

Handler starts at [controller line 68](../../../../server/controllers/settingsController.js#L68). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `data`, `scope`.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/settings'
```

### PUT /settings → `/api/superadmin/settings`

Declared at source line 49. Route handler pipeline names: `updateSettings`.

```js
router.put("/settings", updateSettings)
```

- Imported handler/middleware `updateSettings`: [settingsController.js](../../../../server/controllers/settingsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateSettings`

Handler starts at [controller line 70](../../../../server/controllers/settingsController.js#L70). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Database operations detected: `SystemSetting.findOne`, `Organization.findById`, `Organization.findByIdAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 75](../../../../server/controllers/settingsController.js#L75): `const updates = normalizeUpdates(req.body); if (req.file?.path) updates.companyLogo = req.file.path; const validationError = validateUpdates(updates, settings); if (valid`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/superadmin/settings'
```

### POST /maintenance/backup → `/api/superadmin/maintenance/backup`

Declared at source line 50. Route handler pipeline names: `createPlatformDatabaseBackup`.

```js
router.post("/maintenance/backup", createPlatformDatabaseBackup)
```

- Imported handler/middleware `createPlatformDatabaseBackup`: [superAdminBackupController.js](../../../../server/controllers/superAdminBackupController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createPlatformDatabaseBackup`

Handler starts at [controller line 16](../../../../server/controllers/superAdminBackupController.js#L16). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `500`.
- JSON envelope keys observed: `success`, `message`, `file`, `backup`.
- Literal messages include: “Database connection unavailable”; “Platform database backup created successfully”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/maintenance/backup'
```

### POST /database/backup → `/api/superadmin/database/backup`

Declared at source line 51. Route handler pipeline names: `createPlatformDatabaseBackup`.

```js
router.post("/database/backup", createPlatformDatabaseBackup)
```

- Imported handler/middleware `createPlatformDatabaseBackup`: [superAdminBackupController.js](../../../../server/controllers/superAdminBackupController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createPlatformDatabaseBackup`

Handler starts at [controller line 16](../../../../server/controllers/superAdminBackupController.js#L16). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `500`.
- JSON envelope keys observed: `success`, `message`, `file`, `backup`.
- Literal messages include: “Database connection unavailable”; “Platform database backup created successfully”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/database/backup'
```

### POST /maintenance/cache → `/api/superadmin/maintenance/cache`

Declared at source line 52. Route handler pipeline names: `clearSystemCache`.

```js
router.post("/maintenance/cache", clearSystemCache)
```

- Imported handler/middleware `clearSystemCache`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `clearSystemCache`

Handler starts at [controller line 63](../../../../server/controllers/superAdminOperationsController.js#L63). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`, `timestamp`.
- Literal messages include: “System cache cleared successfully”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/maintenance/cache'
```

### POST /database/cache-clear → `/api/superadmin/database/cache-clear`

Declared at source line 53. Route handler pipeline names: `clearSystemCache`.

```js
router.post("/database/cache-clear", clearSystemCache)
```

- Imported handler/middleware `clearSystemCache`: [superAdminOperationsController.js](../../../../server/controllers/superAdminOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `clearSystemCache`

Handler starts at [controller line 63](../../../../server/controllers/superAdminOperationsController.js#L63). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`, `timestamp`.
- Literal messages include: “System cache cleared successfully”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/database/cache-clear'
```

### GET /database/backups → `/api/superadmin/database/backups`

Declared at source line 56. Route handler pipeline names: `listPlatformDatabaseBackups`.

```js
router.get("/database/backups", listPlatformDatabaseBackups)
```

- Imported handler/middleware `listPlatformDatabaseBackups`: [superAdminBackupController.js](../../../../server/controllers/superAdminBackupController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listPlatformDatabaseBackups`

Handler starts at [controller line 83](../../../../server/controllers/superAdminBackupController.js#L83). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `backups`, `count`, `scope`, `message`.
- Literal messages include: “Unable to read platform backup records”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/database/backups'
```

### GET /maintenance/backups → `/api/superadmin/maintenance/backups`

Declared at source line 57. Route handler pipeline names: `listPlatformDatabaseBackups`.

```js
router.get("/maintenance/backups", listPlatformDatabaseBackups)
```

- Imported handler/middleware `listPlatformDatabaseBackups`: [superAdminBackupController.js](../../../../server/controllers/superAdminBackupController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listPlatformDatabaseBackups`

Handler starts at [controller line 83](../../../../server/controllers/superAdminBackupController.js#L83). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `backups`, `count`, `scope`, `message`.
- Literal messages include: “Unable to read platform backup records”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/maintenance/backups'
```

### DELETE /maintenance/backups/:id → `/api/superadmin/maintenance/backups/:id`

Declared at source line 58. Route handler pipeline names: `deletePlatformDatabaseBackup`.

```js
router.delete("/maintenance/backups/:id", deletePlatformDatabaseBackup)
```

- Imported handler/middleware `deletePlatformDatabaseBackup`: [superAdminBackupController.js](../../../../server/controllers/superAdminBackupController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deletePlatformDatabaseBackup`

Handler starts at [controller line 126](../../../../server/controllers/superAdminBackupController.js#L126). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid backup identifier”; “Backup not found”; “Backup deleted successfully”; “Unable to delete the selected backup”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 128](../../../../server/controllers/superAdminBackupController.js#L128): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 129](../../../../server/controllers/superAdminBackupController.js#L129): `return res.status(400).json({ success: false, message: "Invalid backup identifier" });`
  - [Line 133](../../../../server/controllers/superAdminBackupController.js#L133): `_id: new mongoose.Types.ObjectId(req.params.id),`
  - [Line 137](../../../../server/controllers/superAdminBackupController.js#L137): `if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/superadmin/maintenance/backups/<id>'
```

### DELETE /database/backups/:id → `/api/superadmin/database/backups/:id`

Declared at source line 59. Route handler pipeline names: `deletePlatformDatabaseBackup`.

```js
router.delete("/database/backups/:id", deletePlatformDatabaseBackup)
```

- Imported handler/middleware `deletePlatformDatabaseBackup`: [superAdminBackupController.js](../../../../server/controllers/superAdminBackupController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deletePlatformDatabaseBackup`

Handler starts at [controller line 126](../../../../server/controllers/superAdminBackupController.js#L126). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid backup identifier”; “Backup not found”; “Backup deleted successfully”; “Unable to delete the selected backup”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 128](../../../../server/controllers/superAdminBackupController.js#L128): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 129](../../../../server/controllers/superAdminBackupController.js#L129): `return res.status(400).json({ success: false, message: "Invalid backup identifier" });`
  - [Line 133](../../../../server/controllers/superAdminBackupController.js#L133): `_id: new mongoose.Types.ObjectId(req.params.id),`
  - [Line 137](../../../../server/controllers/superAdminBackupController.js#L137): `if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/superadmin/database/backups/<id>'
```

### GET /database/backup/:id/download → `/api/superadmin/database/backup/:id/download`

Declared at source line 60. Route handler pipeline names: `downloadPlatformDatabaseBackup`.

```js
router.get("/database/backup/:id/download", downloadPlatformDatabaseBackup)
```

- Imported handler/middleware `downloadPlatformDatabaseBackup`: [superAdminBackupController.js](../../../../server/controllers/superAdminBackupController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `downloadPlatformDatabaseBackup`

Handler starts at [controller line 103](../../../../server/controllers/superAdminBackupController.js#L103). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `500`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid backup identifier”; “Backup not found”; “Backup file missing”; “Unable to download the selected backup”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 105](../../../../server/controllers/superAdminBackupController.js#L105): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 106](../../../../server/controllers/superAdminBackupController.js#L106): `return res.status(400).json({ success: false, message: "Invalid backup identifier" });`
  - [Line 110](../../../../server/controllers/superAdminBackupController.js#L110): `_id: new mongoose.Types.ObjectId(req.params.id),`
  - [Line 114](../../../../server/controllers/superAdminBackupController.js#L114): `if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });`
  - [Line 117](../../../../server/controllers/superAdminBackupController.js#L117): `if (!fs.existsSync(filepath)) return res.status(404).json({ success: false, message: "Backup file missing" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/superadmin/database/backup/<id>/download'
```


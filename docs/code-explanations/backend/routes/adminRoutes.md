# Route module: adminRoutes.js

**Source:** [server/routes/adminRoutes.js](../../../../server/routes/adminRoutes.js)

Observed mount prefixes include `/api/admin/bookings/analytics`, `/api/admin/revenue/analytics`, `/api/admin/bookings/:id/refund`, `/api/admin/refunds/:id/process`, `/api/admin/users`, `/api/admin/users/staff`, `/api/admin/users/analytics`, `/api/admin/users/:id/status`, `/api/admin/users/:id`, `/api/admin/reports/daily`, `/api/admin/reports/monthly`, `/api/admin/reports/tours`, `/api/admin/reports/agents`.

## Router-wide middleware

- `router.use(protect);`
- `router.use(resolveTenant);`
- `router.use(adminMiddleware);`
- `router.use("/users", checkPermission("user.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /bookings/analytics → `/api/admin/bookings/analytics`

Declared at source line 20. Route handler pipeline names: `getBookingAnalytics`.

```js
router.get("/bookings/analytics", getBookingAnalytics)
```

- Imported handler/middleware `getBookingAnalytics`: [adminDashboardTenantController.js](../../../../server/controllers/adminDashboardTenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getBookingAnalytics`

Handler starts at [controller line 73](../../../../server/controllers/adminDashboardTenantController.js#L73). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/bookings/analytics'
```

### GET /revenue/analytics → `/api/admin/revenue/analytics`

Declared at source line 21. Route handler pipeline names: `getRevenueAnalytics`.

```js
router.get("/revenue/analytics", getRevenueAnalytics)
```

- Imported handler/middleware `getRevenueAnalytics`: [adminDashboardTenantController.js](../../../../server/controllers/adminDashboardTenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getRevenueAnalytics`

Handler starts at [controller line 74](../../../../server/controllers/adminDashboardTenantController.js#L74). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/revenue/analytics'
```

### PUT /bookings/:id/refund → `/api/admin/bookings/:id/refund`

Declared at source line 24. Route handler pipeline names: `refundBooking`.

```js
router.put("/bookings/:id/refund", refundBooking)
```

- Imported handler/middleware `refundBooking`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `refundBooking`

Handler starts at [controller line 241](../../../../server/controllers/adminPaymentController.js#L241). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `501`, `200`.
- JSON envelope keys observed: `success`, `message`, `payment`.
- Literal messages include: “Booking not found”; “No completed payment found for this booking”; “Customer phone number missing”; “Automated refunds are not available for this payment method. Use the authorized reconciliation workflow.”; “Refund request submitted”.
- Database operations detected: `Booking.findOne`, `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 244](../../../../server/controllers/adminPaymentController.js#L244): `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 245](../../../../server/controllers/adminPaymentController.js#L245): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });`
  - [Line 248](../../../../server/controllers/adminPaymentController.js#L248): `if (!payment) return res.status(404).json({ success: false, message: "No completed payment found for this booking" });`
  - [Line 251](../../../../server/controllers/adminPaymentController.js#L251): `if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });`
  - [Line 260](../../../../server/controllers/adminPaymentController.js#L260): `amount: req.body?.amount ?? (Number(payment.amount) - Number(payment.refundedAmount || 0)),`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/bookings/<id>/refund'
```

### POST /bookings/:id/refund → `/api/admin/bookings/:id/refund`

Declared at source line 25. Route handler pipeline names: `refundBooking`.

```js
router.post("/bookings/:id/refund", refundBooking)
```

- Imported handler/middleware `refundBooking`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `refundBooking`

Handler starts at [controller line 241](../../../../server/controllers/adminPaymentController.js#L241). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `501`, `200`.
- JSON envelope keys observed: `success`, `message`, `payment`.
- Literal messages include: “Booking not found”; “No completed payment found for this booking”; “Customer phone number missing”; “Automated refunds are not available for this payment method. Use the authorized reconciliation workflow.”; “Refund request submitted”.
- Database operations detected: `Booking.findOne`, `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 244](../../../../server/controllers/adminPaymentController.js#L244): `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 245](../../../../server/controllers/adminPaymentController.js#L245): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });`
  - [Line 248](../../../../server/controllers/adminPaymentController.js#L248): `if (!payment) return res.status(404).json({ success: false, message: "No completed payment found for this booking" });`
  - [Line 251](../../../../server/controllers/adminPaymentController.js#L251): `if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });`
  - [Line 260](../../../../server/controllers/adminPaymentController.js#L260): `amount: req.body?.amount ?? (Number(payment.amount) - Number(payment.refundedAmount || 0)),`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/bookings/<id>/refund'
```

### PUT /refunds/:id/process → `/api/admin/refunds/:id/process`

Declared at source line 26. Route handler pipeline names: `processRefund`.

```js
router.put("/refunds/:id/process", processRefund)
```

- Imported handler/middleware `processRefund`: [adminPaymentController.js](../../../../server/controllers/adminPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `processRefund`

Handler starts at [controller line 270](../../../../server/controllers/adminPaymentController.js#L270). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`, `mpesaReference`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Refund not found”; “Invalid refund status”; “Refund updated successfully”.
- Database operations detected: `Refund.findOne`, `Payment.findOne`, `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 273](../../../../server/controllers/adminPaymentController.js#L273): `const refund = await Refund.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 274](../../../../server/controllers/adminPaymentController.js#L274): `if (!refund) return res.status(404).json({ success: false, message: "Refund not found" });`
  - [Line 276](../../../../server/controllers/adminPaymentController.js#L276): `const status = String(req.body.status || "processing").trim().toLowerCase();`
  - [Line 278](../../../../server/controllers/adminPaymentController.js#L278): `if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid refund status" });`
  - [Line 281](../../../../server/controllers/adminPaymentController.js#L281): `if (req.body.mpesaReference) refund.mpesaReference = req.body.mpesaReference;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/refunds/<id>/process'
```

### GET /users → `/api/admin/users`

Declared at source line 30. Route handler pipeline names: `getUsers`.

```js
router.get("/users", getUsers)
```

- Imported handler/middleware `getUsers`: [adminUserController.js](../../../../server/controllers/adminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getUsers`

Handler starts at [controller line 46](../../../../server/controllers/adminUserController.js#L46). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `User.find`, `User.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 49](../../../../server/controllers/adminUserController.js#L49): `const page = Math.max(Number(req.query.page) || 1, 1);`
  - [Line 50](../../../../server/controllers/adminUserController.js#L50): `const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);`
  - [Line 51](../../../../server/controllers/adminUserController.js#L51): `const search = String(req.query.search || "").trim();`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/users'
```

### POST /users/staff → `/api/admin/users/staff`

Declared at source line 31. Route handler pipeline names: `createStaffAccount`.

```js
router.post("/users/staff", createStaffAccount)
```

- Imported handler/middleware `createStaffAccount`: [adminUserController.js](../../../../server/controllers/adminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createStaffAccount`

Handler starts at [controller line 66](../../../../server/controllers/adminUserController.js#L66). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `companyName`, `name`, `email`, `phone`, `password`, `role`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `403`, `201`.
- JSON envelope keys observed: `success`, `message`, `repaired`.
- Literal messages include: “Select a company before creating a staff account.”; “Choose admin, manager, agent, guide or driver.”; “Name, email and a 10-digit phone are required.”; “Password must be at least 12 characters and include an uppercase letter and a number.”; “Agent company name is required when creating an agent account.”; “Agent company name must be 150 characters or fewer.”; “SuperAdmin accounts can only be created through the one-time platform bootstrap process.”.
- Database operations detected: `User.findOne`, `Staff.findOne`, `Role.findOne`, `Permission.findOneAndUpdate`, `User.findById`, `Staff.deleteOne`, `Agent.deleteOne`, `User.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 70](../../../../server/controllers/adminUserController.js#L70): `if (!tenantId) return res.status(400).json({ success: false, message: "Select a company before creating a staff account." });`
  - [Line 71](../../../../server/controllers/adminUserController.js#L71): `const { name, email, phone, password, role } = req.body || {};`
  - [Line 75](../../../../server/controllers/adminUserController.js#L75): `if (!canonicalRole) return res.status(400).json({ success: false, message: "Choose admin, manager, agent, guide or driver." });`
  - [Line 76](../../../../server/controllers/adminUserController.js#L76): `if (!name?.trim() || !email?.trim() || !/^\d{10}$/.test(String(phone || ""))) return res.status(400).json({ success: false, message: "Name, email and a 10-digit phone are`
  - [Line 77](../../../../server/controllers/adminUserController.js#L77): `if (String(password || "").length < 12 || !/[A-Z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ success: false, message: "Password must be at lea`
  - [Line 78](../../../../server/controllers/adminUserController.js#L78): `const agentCompanyName = String(req.body?.companyName || "").trim();`
  - [Line 79](../../../../server/controllers/adminUserController.js#L79): `if (canonicalRole === "agent" && !agentCompanyName) return res.status(400).json({ success: false, message: "Agent company name is required when creating an agent account.`
  - [Line 80](../../../../server/controllers/adminUserController.js#L80): `if (canonicalRole === "agent" && agentCompanyName.length > 150) return res.status(400).json({ success: false, message: "Agent company name must be 150 characters or fewer`
  - [Line 83](../../../../server/controllers/adminUserController.js#L83): `if (existingUser) { const field = existingUser.email === normalizedEmail ? "email" : "phone number"; return res.status(409).json({ success: false, message: \`A user with `
  - [Line 85](../../../../server/controllers/adminUserController.js#L85): `if (existingStaff) { const field = existingStaff.email === normalizedEmail ? "email" : "phone number"; return res.status(409).json({ success: false, message: \`A staff pr`
  - [Line 100](../../../../server/controllers/adminUserController.js#L100): `if (["super_admin", "superadmin"].includes(roleDoc.name)) return res.status(403).json({ success: false, message: "SuperAdmin accounts can only be created through the one-`
  - [Line 109](../../../../server/controllers/adminUserController.js#L109): `if (isDuplicateKeyError(error)) return res.status(409).json({ success: false, message: duplicateMessage(error), repaired: isTenantIndexConflict(error) });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/users/staff'
```

### GET /users/analytics → `/api/admin/users/analytics`

Declared at source line 32. Route handler pipeline names: `getUserAnalytics`.

```js
router.get("/users/analytics", getUserAnalytics)
```

- Imported handler/middleware `getUserAnalytics`: [adminDashboardTenantController.js](../../../../server/controllers/adminDashboardTenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getUserAnalytics`

Handler starts at [controller line 72](../../../../server/controllers/adminDashboardTenantController.js#L72). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `User.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/users/analytics'
```

### PATCH /users/:id/status → `/api/admin/users/:id/status`

Declared at source line 33. Route handler pipeline names: `updateUserStatus`.

```js
router.patch("/users/:id/status", updateUserStatus)
```

- Imported handler/middleware `updateUserStatus`: [adminUserController.js](../../../../server/controllers/adminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateUserStatus`

Handler starts at [controller line 114](../../../../server/controllers/adminUserController.js#L114). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid user ID”; “Invalid user status”; “User not found”.
- Database operations detected: `User.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 117](../../../../server/controllers/adminUserController.js#L117): `const { id } = req.params; const { status } = req.body;`
  - [Line 118](../../../../server/controllers/adminUserController.js#L118): `if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });`
  - [Line 119](../../../../server/controllers/adminUserController.js#L119): `if (!STATUS_VALUES.includes(status)) return res.status(400).json({ success: false, message: "Invalid user status" });`
  - [Line 121](../../../../server/controllers/adminUserController.js#L121): `if (!user) return res.status(404).json({ success: false, message: "User not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/users/<id>/status'
```

### PUT /users/:id/status → `/api/admin/users/:id/status`

Declared at source line 34. Route handler pipeline names: `updateUserStatus`.

```js
router.put("/users/:id/status", updateUserStatus)
```

- Imported handler/middleware `updateUserStatus`: [adminUserController.js](../../../../server/controllers/adminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateUserStatus`

Handler starts at [controller line 114](../../../../server/controllers/adminUserController.js#L114). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid user ID”; “Invalid user status”; “User not found”.
- Database operations detected: `User.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 117](../../../../server/controllers/adminUserController.js#L117): `const { id } = req.params; const { status } = req.body;`
  - [Line 118](../../../../server/controllers/adminUserController.js#L118): `if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });`
  - [Line 119](../../../../server/controllers/adminUserController.js#L119): `if (!STATUS_VALUES.includes(status)) return res.status(400).json({ success: false, message: "Invalid user status" });`
  - [Line 121](../../../../server/controllers/adminUserController.js#L121): `if (!user) return res.status(404).json({ success: false, message: "User not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/users/<id>/status'
```

### PUT /users/:id → `/api/admin/users/:id`

Declared at source line 35. Route handler pipeline names: `updateUserProfile`.

```js
router.put("/users/:id", updateUserProfile)
```

- Imported handler/middleware `updateUserProfile`: [adminUserProfileController.js](../../../../server/controllers/adminUserProfileController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateUserProfile`

Handler starts at [controller line 12](../../../../server/controllers/adminUserProfileController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `email`, `phone`, `role`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `409`.
- JSON envelope keys observed: `success`, `message`, `user`, `data`.
- Literal messages include: “Invalid user ID.”; “User not found.”; “SuperAdmin accounts cannot be edited here.”; “Name, email and a 10-digit phone are required.”; “This account is linked to a customer profile. Keep the role as Customer or convert the customer through the dedicated customer workflow.”; “Invalid role.”; “The selected role is not configured.”; “User updated successfully.”; “A user or staff account with these details already exists for this company.”.
- Database operations detected: `User.findOne`, `Customer.findOne`, `Staff.findOne`, `Agent.findOne`, `Role.findOne`, `User.findById`.
- Input/validation source lines to inspect:
  - [Line 15](../../../../server/controllers/adminUserProfileController.js#L15): `const { id } = req.params;`
  - [Line 16](../../../../server/controllers/adminUserProfileController.js#L16): `if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID." });`
  - [Line 18](../../../../server/controllers/adminUserProfileController.js#L18): `if (!user) return res.status(404).json({ success: false, message: "User not found." });`
  - [Line 19](../../../../server/controllers/adminUserProfileController.js#L19): `if (["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase())) return res.status(403).json({ success: false, message: "SuperAdmin accounts cannot be e`
  - [Line 21](../../../../server/controllers/adminUserProfileController.js#L21): `const name = String(req.body?.name ?? user.name).trim();`
  - [Line 22](../../../../server/controllers/adminUserProfileController.js#L22): `const email = String(req.body?.email ?? user.email).trim().toLowerCase();`
  - [Line 23](../../../../server/controllers/adminUserProfileController.js#L23): `const phone = String(req.body?.phone ?? user.phone).trim();`
  - [Line 24](../../../../server/controllers/adminUserProfileController.js#L24): `if (!name || !email || !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: "Name, email and a 10-digit phone are required." });`
  - [Line 26](../../../../server/controllers/adminUserProfileController.js#L26): `if (duplicate) return res.status(409).json({ success: false, message: \`Another user with this ${duplicate.email === email ? "email" : "phone number"} already exists for `
  - [Line 36](../../../../server/controllers/adminUserProfileController.js#L36): `if (req.body?.role !== undefined) {`
  - [Line 37](../../../../server/controllers/adminUserProfileController.js#L37): `const requested = normalizeRole(req.body.role);`
  - [Line 38](../../../../server/controllers/adminUserProfileController.js#L38): `if (customerOnly && requested !== "customer") return res.status(409).json({ success: false, message: "This account is linked to a customer profile. Keep the role as Custo`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/users/<id>'
```

### DELETE /users/:id → `/api/admin/users/:id`

Declared at source line 36. Route handler pipeline names: `deleteUser`.

```js
router.delete("/users/:id", deleteUser)
```

- Imported handler/middleware `deleteUser`: [adminUserController.js](../../../../server/controllers/adminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteUser`

Handler starts at [controller line 126](../../../../server/controllers/adminUserController.js#L126). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`, `deleted`.
- Literal messages include: “Invalid user ID”; “You cannot delete your own account.”; “User not found”; “SuperAdmin accounts cannot be deleted.”; “User account deleted successfully.”.
- Database operations detected: `User.findOne`, `Staff.deleteMany`, `Agent.deleteMany`, `User.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 129](../../../../server/controllers/adminUserController.js#L129): `const { id } = req.params;`
  - [Line 130](../../../../server/controllers/adminUserController.js#L130): `if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });`
  - [Line 131](../../../../server/controllers/adminUserController.js#L131): `if (String(req.user?._id) === String(id)) return res.status(400).json({ success: false, message: "You cannot delete your own account." });`
  - [Line 133](../../../../server/controllers/adminUserController.js#L133): `if (!user) return res.status(404).json({ success: false, message: "User not found" });`
  - [Line 134](../../../../server/controllers/adminUserController.js#L134): `if (["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase())) return res.status(403).json({ success: false, message: "SuperAdmin accounts cannot be d`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/users/<id>'
```

### GET /reports/daily → `/api/admin/reports/daily`

Declared at source line 39. Route handler pipeline names: `dailyBookingReport`.

```js
router.get("/reports/daily", dailyBookingReport)
```

- Imported handler/middleware `dailyBookingReport`: [bookingReportController.js](../../../../server/controllers/bookingReportController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `dailyBookingReport`

Handler starts at [controller line 57](../../../../server/controllers/bookingReportController.js#L57). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Booking.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/reports/daily'
```

### GET /reports/monthly → `/api/admin/reports/monthly`

Declared at source line 40. Route handler pipeline names: `monthlyBookingReport`.

```js
router.get("/reports/monthly", monthlyBookingReport)
```

- Imported handler/middleware `monthlyBookingReport`: [bookingReportController.js](../../../../server/controllers/bookingReportController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `monthlyBookingReport`

Handler starts at [controller line 79](../../../../server/controllers/bookingReportController.js#L79). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `year`, `month`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Booking.find`.
- Input/validation source lines to inspect:
  - [Line 83](../../../../server/controllers/bookingReportController.js#L83): `const yearValue = Number(req.query.year);`
  - [Line 84](../../../../server/controllers/bookingReportController.js#L84): `const monthValue = Number(req.query.month);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/reports/monthly'
```

### GET /reports/tours → `/api/admin/reports/tours`

Declared at source line 41. Route handler pipeline names: `tourBookingReport`.

```js
router.get("/reports/tours", tourBookingReport)
```

- Imported handler/middleware `tourBookingReport`: [bookingReportController.js](../../../../server/controllers/bookingReportController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `tourBookingReport`

Handler starts at [controller line 104](../../../../server/controllers/bookingReportController.js#L104). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Booking.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/reports/tours'
```

### GET /reports/agents → `/api/admin/reports/agents`

Declared at source line 42. Route handler pipeline names: `agentBookingReport`.

```js
router.get("/reports/agents", agentBookingReport)
```

- Imported handler/middleware `agentBookingReport`: [bookingReportController.js](../../../../server/controllers/bookingReportController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `agentBookingReport`

Handler starts at [controller line 229](../../../../server/controllers/bookingReportController.js#L229). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Booking.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/reports/agents'
```


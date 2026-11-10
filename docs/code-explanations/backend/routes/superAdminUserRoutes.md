# Route module: superAdminUserRoutes.js

**Source:** [server/routes/superAdminUserRoutes.js](../../../../server/routes/superAdminUserRoutes.js)

Observed mount prefixes include `/api/superadmin/users/accounts`.

## Router-wide middleware

- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /accounts → `/api/superadmin/users/accounts`

Declared at source line 9. Route handler pipeline names: `createCompanyAccount`.

```js
router.post("/accounts", createCompanyAccount)
```

- Imported handler/middleware `createCompanyAccount`: [superAdminUserController.js](../../../../server/controllers/superAdminUserController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCompanyAccount`

Handler starts at [controller line 12](../../../../server/controllers/superAdminUserController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `email`, `phone`, `password`, `role`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `user`.
- Literal messages include: “Choose a valid company account role.”; “Name, email and a 10-digit phone are required.”; “Password must be at least 12 characters and include an uppercase letter and a number.”; “A user with this email already exists.”; “Company account created successfully.”.
- Database operations detected: `Role.findOne`, `User.create`, `Staff.create`, `Agent.create`, `User.findById`.
- Input/validation source lines to inspect:
  - [Line 12](../../../../server/controllers/superAdminUserController.js#L12): `async (req, res, next) => { try { const { name, email, phone, password, role } = req.body || {}; const canonicalRole = normalizeRole(role); if (!canonicalRole) return res`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/superadmin/users/accounts'
```


# Route module: commissionRoutes.js

**Source:** [server/routes/commissionRoutes.js](../../../../server/routes/commissionRoutes.js)

Observed mount prefixes include `/api/commissions`, `/api/commissions/agent/:agentId`, `/api/commissions/:id/approve`, `/api/commissions/:id/pay`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(adminMiddleware);`
- `router.use(authorize("commission.view"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/commissions`

Declared at source line 30. Route handler pipeline names: `getCommissions`.

```js
router.get(
"/",
getCommissions
)
```

- Imported handler/middleware `getCommissions`: [commissionController.js](../../../../server/controllers/commissionController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getCommissions`

Handler starts at [controller line 63](../../../../server/controllers/commissionController.js#L63). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`, `message`.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/commissions'
```

### GET /agent/:agentId → `/api/commissions/agent/:agentId`

Declared at source line 37. Route handler pipeline names: `getAgentCommissions`.

```js
router.get(
"/agent/:agentId",
getAgentCommissions
)
```

- Imported handler/middleware `getAgentCommissions`: [commissionController.js](../../../../server/controllers/commissionController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentCommissions`

Handler starts at [controller line 74](../../../../server/controllers/commissionController.js#L74). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `agentId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Invalid agent ID.”.
- Database operations detected: `Commission.find`.
- Input/validation source lines to inspect:
  - [Line 77](../../../../server/controllers/commissionController.js#L77): `if (!mongoose.isValidObjectId(req.params.agentId)) {`
  - [Line 78](../../../../server/controllers/commissionController.js#L78): `return res.status(400).json({ success: false, message: "Invalid agent ID." });`
  - [Line 81](../../../../server/controllers/commissionController.js#L81): `mergeTenantFilter({ agent: new mongoose.Types.ObjectId(req.params.agentId) })`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/commissions/agent/<agentId>'
```

### PATCH /:id/approve → `/api/commissions/:id/approve`

Declared at source line 42. Route handler pipeline names: `adminMiddleware`, `approveCommission`.

```js
router.patch("/:id/approve", adminMiddleware, approveCommission)
```

- Imported handler/middleware `adminMiddleware`: [adminMiddleware.js](../../../../server/middleware/adminMiddleware.js)
- Imported handler/middleware `approveCommission`: [commissionController.js](../../../../server/controllers/commissionController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `approveCommission`

Handler starts at [controller line 106](../../../../server/controllers/commissionController.js#L106). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Commission not found.”; “Commission is already paid.”; “Only pending commissions can be approved.”; “Commission approved.”.
- Database operations detected: `Commission.findOne`.
- Input/validation source lines to inspect:
  - [Line 108](../../../../server/controllers/commissionController.js#L108): `const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 109](../../../../server/controllers/commissionController.js#L109): `if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });`
  - [Line 110](../../../../server/controllers/commissionController.js#L110): `if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });`
  - [Line 112](../../../../server/controllers/commissionController.js#L112): `return res.status(400).json({ success: false, message: "Only pending commissions can be approved." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/commissions/<id>/approve'
```

### POST /:id/pay → `/api/commissions/:id/pay`

Declared at source line 43. Route handler pipeline names: `adminMiddleware`, `payCommission`.

```js
router.post("/:id/pay", adminMiddleware, payCommission)
```

- Imported handler/middleware `adminMiddleware`: [adminMiddleware.js](../../../../server/middleware/adminMiddleware.js)
- Imported handler/middleware `payCommission`: [commissionController.js](../../../../server/controllers/commissionController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `payCommission`

Handler starts at [controller line 127](../../../../server/controllers/commissionController.js#L127). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `paymentMethod`, `paymentReference`, `transactionId`, `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `code`, `data`.
- Literal messages include: “Invalid commission payment method.”; “A payment reference or transaction ID is required.”; “Commission not found.”; “Commission is already paid.”; “Only an approved or processing commission can be paid.”; “That payment reference or transaction ID has already been recorded for another commission.”; “Commission payment confirmed and recorded.”.
- Database operations detected: `Commission.findOne`, `Agent.findOne`.
- Input/validation source lines to inspect:
  - [Line 129](../../../../server/controllers/commissionController.js#L129): `const { paymentMethod = "MPESA", paymentReference = "", transactionId = "", notes = "" } = req.body || {};`
  - [Line 132](../../../../server/controllers/commissionController.js#L132): `return res.status(400).json({ success: false, message: "Invalid commission payment method." });`
  - [Line 136](../../../../server/controllers/commissionController.js#L136): `return res.status(400).json({ success: false, message: "A payment reference or transaction ID is required." });`
  - [Line 139](../../../../server/controllers/commissionController.js#L139): `const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 140](../../../../server/controllers/commissionController.js#L140): `if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });`
  - [Line 141](../../../../server/controllers/commissionController.js#L141): `if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });`
  - [Line 143](../../../../server/controllers/commissionController.js#L143): `return res.status(400).json({ success: false, message: "Only an approved or processing commission can be paid." });`
  - [Line 158](../../../../server/controllers/commissionController.js#L158): `return res.status(409).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/commissions/<id>/pay'
```


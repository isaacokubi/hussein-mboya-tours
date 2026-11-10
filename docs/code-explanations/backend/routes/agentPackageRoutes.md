# Route module: agentPackageRoutes.js

**Source:** [server/routes/agentPackageRoutes.js](../../../../server/routes/agentPackageRoutes.js)

Observed mount prefixes include `/api/agents/packages`, `/api/agent/packages`, `/api/agents/packages/:id`, `/api/agent/packages/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(agentMiddleware);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/agents/packages`, `/api/agent/packages`

Declared at source line 16. Route handler pipeline names: `getAgentPackages`.

```js
router.get("/", getAgentPackages)
```

- Imported handler/middleware `getAgentPackages`: [agentPackageController.js](../../../../server/controllers/agentPackageController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentPackages`

Handler starts at [controller line 28](../../../../server/controllers/agentPackageController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `search`, `category`, `destination`, `featured`, `page`, `limit`, `sort`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `TourPackage.find`, `TourPackage.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 39](../../../../server/controllers/agentPackageController.js#L39): `} = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/packages'
```

### GET /:id → `/api/agents/packages/:id`, `/api/agent/packages/:id`

Declared at source line 17. Route handler pipeline names: `getPackageDetails`.

```js
router.get("/:id", getPackageDetails)
```

- Imported handler/middleware `getPackageDetails`: [agentPackageController.js](../../../../server/controllers/agentPackageController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPackageDetails`

Handler starts at [controller line 201](../../../../server/controllers/agentPackageController.js#L201). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `package`.
- Literal messages include: “Invalid package ID.”; “Tour package not found.”.
- Database operations detected: `TourPackage.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 209](../../../../server/controllers/agentPackageController.js#L209): `if (!isValidId(req.params.id)) {`
  - [Line 210](../../../../server/controllers/agentPackageController.js#L210): `return res.status(400).json({`
  - [Line 224](../../../../server/controllers/agentPackageController.js#L224): `_id: req.params.id,`
  - [Line 238](../../../../server/controllers/agentPackageController.js#L238): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/packages/<id>'
```


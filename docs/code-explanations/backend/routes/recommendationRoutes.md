# Route module: recommendationRoutes.js

**Source:** [server/routes/recommendationRoutes.js](../../../../server/routes/recommendationRoutes.js)

Observed mount prefixes include `/api/recommendations`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST / → `/api/recommendations`

Declared at source line 41. Route handler pipeline names: `getRecommendations`.

```js
router.post(
  "/",
  getRecommendations
)
```

- Imported handler/middleware `getRecommendations`: [recommendationController.js](../../../../server/controllers/recommendationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getRecommendations`

Handler starts at [controller line 12](../../../../server/controllers/recommendationController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`, `recommendations`.
- Literal messages include: “Recommendation criteria are required.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 14](../../../../server/controllers/recommendationController.js#L14): `const preferences = req.body;`
  - [Line 17](../../../../server/controllers/recommendationController.js#L17): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/recommendations'
```


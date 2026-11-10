# Route module: destinationRoutes.js

**Source:** [server/routes/destinationRoutes.js](../../../../server/routes/destinationRoutes.js)

Observed mount prefixes include `/api/destinations/featured`, `/api/destinations`, `/api/destinations/:slug`, `/api/destinations/slug/:slug`.

## Router-wide middleware

No router.use declaration was found at module scope.

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /featured → `/api/destinations/featured`

Declared at source line 41. Route handler pipeline names: `getFeaturedDestinations`.

```js
router.get(

  "/featured",

  getFeaturedDestinations

)
```

- Imported handler/middleware `getFeaturedDestinations`: [destinationController.js](../../../../server/controllers/destinationController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getFeaturedDestinations`

Handler starts at [controller line 120](../../../../server/controllers/destinationController.js#L120). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `Destination.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/destinations/featured'
```

### GET / → `/api/destinations`

Declared at source line 60. Route handler pipeline names: `getDestinations`.

```js
router.get(

  "/",

  getDestinations

)
```

- Imported handler/middleware `getDestinations`: [destinationController.js](../../../../server/controllers/destinationController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getDestinations`

Handler starts at [controller line 28](../../../../server/controllers/destinationController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`, `country`, `featured`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Destination.find`, `Destination.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 31](../../../../server/controllers/destinationController.js#L31): `const { page = 1, limit = 12, search, country, featured } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/destinations'
```

### GET /:slug → `/api/destinations/:slug`

Declared at source line 79. Route handler pipeline names: `getDestination`.

```js
router.get(

  "/:slug",

  getDestination

)
```

- Imported handler/middleware `getDestination`: [destinationController.js](../../../../server/controllers/destinationController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getDestination`

Handler starts at [controller line 63](../../../../server/controllers/destinationController.js#L63). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `slug`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Destination slug is required.”; “Destination not found.”.
- Database operations detected: `Destination.findOne`, `Tour.find`, `Destination.find`.
- Input/validation source lines to inspect:
  - [Line 66](../../../../server/controllers/destinationController.js#L66): `const slug = req.params.slug?.trim().toLowerCase();`
  - [Line 67](../../../../server/controllers/destinationController.js#L67): `if (!slug) return res.status(400).json({ success: false, message: "Destination slug is required." });`
  - [Line 92](../../../../server/controllers/destinationController.js#L92): `if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/destinations/<slug>'
```

### GET /slug/:slug → `/api/destinations/slug/:slug`

Declared at source line 87. Route handler pipeline names: `getDestination`.

```js
router.get(

  "/slug/:slug",

  getDestination

)
```

- Imported handler/middleware `getDestination`: [destinationController.js](../../../../server/controllers/destinationController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getDestination`

Handler starts at [controller line 63](../../../../server/controllers/destinationController.js#L63). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `slug`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Destination slug is required.”; “Destination not found.”.
- Database operations detected: `Destination.findOne`, `Tour.find`, `Destination.find`.
- Input/validation source lines to inspect:
  - [Line 66](../../../../server/controllers/destinationController.js#L66): `const slug = req.params.slug?.trim().toLowerCase();`
  - [Line 67](../../../../server/controllers/destinationController.js#L67): `if (!slug) return res.status(400).json({ success: false, message: "Destination slug is required." });`
  - [Line 92](../../../../server/controllers/destinationController.js#L92): `if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/destinations/slug/<slug>'
```


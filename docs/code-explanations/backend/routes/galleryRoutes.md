# Route module: galleryRoutes.js

**Source:** [server/routes/galleryRoutes.js](../../../../server/routes/galleryRoutes.js)

Observed mount prefixes include `/api/gallery/featured`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /featured → `/api/gallery/featured`

Declared at source line 21. Route handler pipeline names: `getFeaturedGallery`.

```js
router.get(

"/featured",

getFeaturedGallery

)
```

- Imported handler/middleware `getFeaturedGallery`: [galleryController.js](../../../../server/controllers/galleryController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getFeaturedGallery`

Handler starts at [controller line 37](../../../../server/controllers/galleryController.js#L37). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `Gallery.find`, `Tour.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/gallery/featured'
```


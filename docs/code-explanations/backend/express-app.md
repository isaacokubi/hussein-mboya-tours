# `server/app.js` — Express middleware and route composition

## Configuration and initialization

Imports bring Express, Helmet, CORS, compression, cookie parsing, Morgan, Mongoose, tenant models/plugin loader, request context, public error formatting, readiness and origin policy. `loadTenantPlugin()` runs before route models are used. The app sets `trust proxy` to one hop so Express can interpret forwarded client/protocol information behind a proxy; this setting assumes the deployment proxy topology is correct.

In production, console methods are wrapped with a recursive redactor. Sensitive property names (including body, phone, password, token and provider secrets) are replaced before logging. This is a defense-in-depth logging control, not a guarantee that arbitrary secrets under unexpected property names are redacted.

## Early middleware and health

`requestContext` runs first to establish request identity. Static destination uploads are served from a local directory. Helmet configures security headers, CSP image/media sources and production HSTS behavior. `databaseStatus` maps Mongoose states; `readinessPayload` combines startup phase and DB connection, returns a safe DB name/version/timestamp, and never returns the URI.

`/api/live` reports process liveness independent of DB; `/api/health` and `/api/ready` report readiness and return 503 when startup/DB is not ready. These distinctions let an orchestrator detect a live process without falsely considering it ready to serve DB routes.

## Request controls

The global limiter allows a bounded number of requests per client IP over 15 minutes, with standard rate headers and health skip. CORS first permits configured origins. Dynamic tenant and integration origins are resolved against organization domain/slug or active website integration key, then cached for 60 seconds up to a bounded number of entries. Production rejects non-HTTPS dynamic origins. CORS uses credentials and explicitly lists allowed headers, including tenant, idempotency and CSRF-related headers.

After CORS, the DB gate blocks ordinary requests when Mongo is disconnected. Compression, JSON parser (1 MB; preserves raw body for webhook verification), URL-encoded parser, cookie parser and Morgan follow. Morgan skips temporary staging routes to avoid logging reset/trigger query data. Internal staging routes are mounted before tenant resolution, then normal tenant resolution runs before tenant and API routes.

## Route order and error handling

Subscription routes are mounted before the consolidated `/api` router because the consolidated SEO catch-all could otherwise answer them. The API router and separately mounted settings/database/system/super-admin routers follow. A JSON 404 catches unmatched paths. The terminal error handler logs a redacted structured error in production and detailed error in development, normalizes status codes, maps Mongoose validation/cast to 400 and duplicate-key 11000 to 409, then returns a sanitized public message and request ID. Development validation errors may include field messages.

## Important reading lesson

Express executes middleware in registration order. Moving tenant resolution, CORS, parsers, webhook raw-body capture, readiness gate or catch-all changes behavior. When tracing an endpoint, account for both this global order and the router's own middleware chain.

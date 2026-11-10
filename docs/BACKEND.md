# Backend

## Startup

Run `npm start` (or `npm run dev`) in `server/`. `server.js` loads tenant/bootstrap hooks, constructs HTTP and Socket.IO, starts listening, then asynchronously connects MongoDB. Startup tracks readiness and retries critical DB initialization. Once ready it runs the invoice-index migration and starts lifecycle, retention, subscription, customer communication, compliance, payment cleanup and job-worker tasks. SIGINT/SIGTERM trigger shutdown, close listeners/workers and MongoDB.

## Middleware order and request lifecycle

In `app.js`, request context is established early; Helmet headers, CORS, global rate limiting, compression, parsers, cookies and Morgan logging are installed before API dispatch. Sensitive production console fields are redacted. CORS allows configured origins plus validated tenant domains/integration origins, with a short in-memory decision cache. The app resolves tenant context before mounting the main API routers. Routers add authentication, roles, permissions, validation and feature gates. The final handlers produce JSON 404/error responses and request IDs.

The database connectivity check blocks ordinary API routes while Mongo is disconnected; `/api/live`, `/api/health` and `/api/ready` are defined before that gate. The readiness response intentionally omits credentials and reports connection/database metadata.

## Routes, controllers and services

Routes declare method/path and compose middleware. Controllers translate HTTP inputs into domain operations and responses. Services hold reusable business/provider operations. Models implement persistence shape and some hooks. This is a layered convention rather than strict separation: inspect each operation's actual call chain. The router mount prefix is applied in `routes/index.js` or `app.js`.

## Persistence and tenant access

MongoDB is connected with Mongoose (`config/database.js`). Models live in `models/`. Tenant context is initialized by `tenancy/bootstrap.js` and request middleware; helpers such as `requireTenantId` and `mergeTenantFilter`, plus schema plugins, scope database operations. Background jobs must establish tenant context explicitly when using tenant-protected models.

## Authentication and errors

`middleware/authMiddleware.js` accepts a Bearer token or auth cookie, validates JWT issuer/audience, reloads the user and role/permissions, checks active status, verifies tenant consistency, then sets request/AsyncLocalStorage identity. Role helpers and permission checks follow. Input validation is distributed among middleware, controllers, and Mongoose validators. `app.js` maps Mongoose validation/cast errors to 400, duplicate-key errors to 409, and other failures to sanitized public messages; request IDs aid log correlation.

## Security and operations

Observed controls include Helmet, explicit CORS policy, request and auth/payment rate limiters, bounded JSON bodies, cookie CSRF checks for unsafe cookie-authenticated requests, role/permission checks, tenant filters, production error sanitization, security/audit middleware and webhook/callback validation. These controls need feature-specific review. Logging uses Morgan and application console calls with production redaction; no centralized external monitoring provider is evidenced by the source files alone.

## HTTP request sequence

For a route: browser request → base middleware → tenant resolver → route guards/validators → controller → service/model/provider → response. If an error is thrown through `next(error)`, the final error middleware normalizes status/message and returns a request ID. Some controllers handle errors locally, so inspect their response behavior too.

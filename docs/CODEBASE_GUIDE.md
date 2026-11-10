# Codebase guide

The source tree is broad. This guide explains the responsibility of each first-party area; the [source file index](SOURCE_FILE_INDEX.md) links every first-party JS/JSX file. `node_modules`, built output and generated assets are excluded.

| Path | Responsibility and relationships |
| --- | --- |
| `client/src/main.jsx` | Browser entry point; mounts React and top-level providers. |
| `client/src/App.jsx`, `routes/` | App shell and URL-to-page mapping; pages are lazy-loaded and route guards gate role-specific views. |
| `client/src/pages/` | Route-level customer, agent, guide, driver, manager, admin and super-admin screens. They compose components and call API modules. |
| `client/src/components/`, `layouts/` | Reusable UI, role-specific dashboard shells and domain widgets. |
| `client/src/context/` | Cross-page auth, tenant, settings, cart and notification state. |
| `client/src/api/` | Axios endpoint wrappers grouped by domain; these call Express routes and return response data. `axios.js`/`apiUrls.js` configure transport. |
| `client/src/hooks/`, `utils/`, `lib/`, `config/` | Reusable query/UI behavior, formatting and role/permission configuration. |
| `client/e2e/` | Playwright browser scenarios. Some dated `.bak` files in the working tree are backups and are not executable test inventory. |
| `server/server.js` | HTTP/Socket.IO entry, database retry/readiness, background schedulers and graceful shutdown. |
| `server/app.js` | Express middleware order, CORS, readiness endpoints, route registration, 404 and error handling. |
| `server/routes/` | HTTP method/path declarations and middleware composition. [Route module explanations](code-explanations/backend/routes/INDEX.md) show source excerpts and mounts; the route inventory distinguishes observed mounted modules from unmounted declarations. `routes/index.js` mounts many routers under `/api`; several modules are mounted separately in `app.js`. |
| `server/controllers/` | HTTP request parsing, validation/authorization coordination, domain operations and response construction. |
| `server/services/` | Reusable domain, lifecycle, provider and background-job operations used by controllers, hooks and schedulers. |
| `server/models/` | Mongoose schemas, validation, indexes, references, virtuals, hooks and tenant plugin installation. |
| `server/middleware/` | Cross-cutting tenant, authentication/permission, request validation, payment callback, upload, rate limit, audit and error behavior. |
| `server/tenancy/` | Tenant context, AsyncLocalStorage/query scoping, plugins and tenant-safe query helpers. |
| `server/config/`, `server/constants/` | Environment validation, Mongo/CORS/provider setup and stable domain constants. |
| `server/utils/` | Shared token, response, pricing, ownership, tenant and payment helpers. |
| `server/bootstrap/`, `server/startup/` | Startup hooks/migrations and readiness phase state. |
| `server/scripts/`, `server/seeds/` | Operational repair/audit/migration/seed commands. Many require explicit environment flags; read each script before use. |
| `server/tests/`, `client/e2e/` | Node test-runner and Playwright checks. The codebase also includes opt-in database/integration tests. |
| `server/socket/` | Socket.IO server initialization and event handling. |
| `docs/` | Existing runbooks/readiness evidence plus this documentation package. |
| `render.yaml`, `vercel.json` | Render API/static service and Vercel static SPA build/rewrite configuration. |

## How files connect

For a typical feature, start at a client page, identify its `client/src/api/*` call, find the matching backend router, then follow middleware to the controller, services and Mongoose models. For booking creation, the representative path is `Checkout.jsx` or another booking page → `bookingApi.js` → `bookingRoutes.js` → customer booking controller/service → `Booking` and `Tour` models. For M-Pesa, follow the payment UI → `mpesaApi.js` → `mpesaRoutes.js` → `mpesaController.js` → `mpesaService.js` and payment lifecycle services → `Payment`/`Booking`.

The route module's path is often relative to a prefix applied in `server/routes/index.js`; do not assume `router.get('/x')` means the externally visible path is `/x`. Use [API reference](API_REFERENCE.md) and inspect the mount site.

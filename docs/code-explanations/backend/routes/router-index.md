# `server/routes/index.js` — API mount graph

## Role

This module builds one Express router and mounts domain routers below path prefixes. `server/app.js` attaches that router at `/api`, so a route declared as `/bookings/:id` in `bookingRoutes.js` is publicly `/api/bookings/:id`.

## Imports and dependencies

The imports bring tenant resolution and plan-feature enforcement, tenancy bootstrap side effects, Express, authentication/permission middleware, then route modules for identity, travel catalog, bookings, payment, admin, finance, operations, hospitality, integrations, AI, staff and platform management. Controller imports support a small number of inline handlers. The `superAdminRoutes` import is reused with additional super-admin router modules.

## Registration order and runtime

The first mounts are `/integrations`, `/packages`, and `/tenant`; these are intentionally registered before the router-wide `resolveTenant` and `enforcePlanFeature` calls. Subsequent route groups pass through those router-wide middleware before matching feature routers. Order is significant because Express takes the first matching handler that ends the response; the SEO router mounted at `/` is a broad catch-all and appears near the end so it does not mask business APIs.

The mount table and literal paths are maintained in [API_ROUTE_INVENTORY.md](../../../API_ROUTE_INVENTORY.md). Several feature routers have aliases (for example `/tourmanager` and `/tour-manager`, `/agent` and `/agents`). Aliases expose the same router handlers and therefore share their guards and controller behavior.

## Inline endpoints

- `GET /admin/system-health` first calls `protect` and `checkPermission("system.security")`, then dynamically imports Mongoose and returns process/runtime/database/memory metadata. It does not return database credentials.
- `GET /settings/public` delegates to `getPublicSettings`.
- `GET /health` returns a simple API-router health response. App-level `/api/live`, `/api/health`, and `/api/ready` are registered earlier in `app.js` and provide more complete liveness/readiness status.

## Security and failure behavior

`resolveTenant` and plan-feature middleware are broad router-level guards for the later feature mounts, while each feature router adds its own authentication/role/permission and validation. The early integration/package/tenant branding mounts have their own route-level protections and special public behavior. Never infer that a route is public solely because its prefix appears before `resolveTenant`; inspect the concrete route module. Errors generally flow to `app.js`'s final error handler unless a route/controller responds locally.

## How to trace a URL

Start at the browser API wrapper, map its relative path to the mount here, then append the route-local path. Read any router-wide middleware in this file, the module's `router.use` guards, the matching method/path, and its imported controller. See [route module explanations](INDEX.md) and the generated [route inventory](../../../API_ROUTE_INVENTORY.md).

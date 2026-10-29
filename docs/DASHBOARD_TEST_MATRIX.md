# Dashboard and workflow test matrix — 2026-10-29

Routes and roles below were discovered in `client/src/routes/AppRoutes.jsx`, `client/src/App.jsx`, protected-route wrappers and `client/e2e/production-smoke.spec.js`. Current run results refer only to this work session; historical README evidence is not reused as a current pass.

| Area / role | Direct routes and workflows | Current outcome |
|---|---|---|
| Public customer | `/`, `/tours`, `/tours/:slug`, `/destinations`, `/destinations/:slug`, public catalogue APIs, images, internal links | **PASS, earlier run** — public smoke and desktop/mobile performance tests, read-only; both detail APIs returned HTTP 200. **FAIL, later rerun** — `/tours` rendered no tour links in both viewports. This production inconsistency needs investigation before release. |
| Search, filters, pagination | Tour list and search APIs; client filter controls | **NOT TESTED** end-to-end this session; no live performance sample result captured. |
| Booking / checkout / payment | `/checkout/:type/:id`, `/payment-status/:id`, hospitality payment; booking creation and payment provider callbacks | **NOT TESTED**; no sandbox/provider credentials. No payment was initiated. |
| Customer account | `/dashboard`, `/my-bookings`, `/bookings/:id`, `/profile`, `/notifications`, `/wishlist`, custom tours | Existing `production-smoke.spec.js` includes customer dashboard/profile/bookings navigation, but authenticated cases were **SKIPPED** because no demo password was configured. |
| Tenant administrator | `/admin/*`: dashboard, tours, destinations, bookings, customers, staff, finance, payments, settings, reports, hospitality, compliance and operations | Direct unauthenticated `/admin/dashboard` redirect **PASS** in public smoke. Authenticated dashboard and CRUD actions **NOT TESTED** (credentials absent). |
| Super administrator | `/superadmin/*`: dashboard, tenants, users, roles, system, audit, security, settings, database, API monitor | Authenticated dashboard and restricted cross-tenant workflows **NOT TESTED** (credentials absent). |
| Agent | `/agent/*`: dashboard, bookings, customers, commission, quotes, packages | Authenticated navigation **NOT TESTED** (credentials absent). |
| Tour manager | `/tour-manager/*`: dashboard, tours, creation/edit, assignments, availability, calendar, bookings, guides, itineraries, settings | Authenticated navigation/mutations **NOT TESTED** (credentials absent). |
| Guide | `/guide/dashboard`, `/guide/assigned-tours` | Authenticated navigation **NOT TESTED** (credentials absent). |
| Driver | `/driver/dashboard` | Authenticated navigation **NOT TESTED** (credentials absent). |
| Finance/admin specialist pages | `/admin/finance/*`, payments, tax/compliance and reports | **NOT TESTED** in browser this session. |
| Mobile layouts | Customer, admin, agent, manager, guide and driver responsive navigation | **NOT TESTED** in browser this session; existing `client/e2e/dashboard-mobile` specs are available. |

The smoke test `client/e2e/production-smoke.spec.js` defines seeded customer, super-admin, tenant-admin, tour-manager, agent, guide and driver role checks, but those checks require `DEMO_SMOKE_PASSWORD` (or the documented equivalents). Passing the public test does not count as dashboard authorization or mutation coverage.

## Repeatable local / staging verification

Use a disposable staging tenant and sandbox payments. Do not place credentials in source control. Exact commands and environment requirements are in [Performance testing](PERFORMANCE_TESTING.md). Before approving production, exercise create/edit/delete and role-denial cases for each matrix row, verify account/tenant separation, and cover payment callback replay/idempotency without charging a real customer.

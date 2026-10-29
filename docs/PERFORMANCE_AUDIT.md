# Performance audit — 2026-10-29

## Scope and evidence

Reviewed the React/Vite client, route setup, React Query defaults, public tour and destination controllers, request logging, Mongoose catalogue models, route mounts, and the existing public/customer/staff Playwright smoke tests. The worktree already contained uncommitted edits in `client/src/pages/Home.jsx`, `server/controllers/tourController.js`, and a new `DeferredSection.jsx` before this audit began. Those edits are preserved and included in the inspected current implementation.

The server route tree contains **773 route declarations** across mounted route modules (including the nested declarations counted in `server/routes`). Route groups are classified below by their primary traffic and dependencies; per-endpoint production frequency and latency cannot be ranked without request-log/APM data. `requestLogger` already records method, path, status, request ID and duration without request bodies.

The repository's Playwright public catalogue smoke test ran against production with system Chrome: **1 passed**, covering homepage, tours, a tour detail, destinations, a destination detail, image completion, same-origin links, public catalogue APIs, and an unauthenticated admin redirect. The repeatable performance test also ran against production with detail API responses asserted successful: **1 passed**. The deployed commit SHA was not exposed, so this is a baseline for the observed deployment, not verification of this worktree.

No production database URI, MongoDB query profiler, APM trace, field Core Web Vitals, or staging credentials were available. Consequently there are no measured database timings, production p50/p95 API latencies, or historical before-change browser metrics in this audit. Do not interpret local bundle sizes or one live smoke run as field performance or a before/after performance claim.

## Findings ranked by impact

1. **Tour detail data was repeatedly refreshed every 15 seconds.** The detail query polled public catalogue data that changes infrequently. This generated background requests and could refresh while the user was reading. Removed the polling and reused the five-minute in-memory query cache; the request is now cancelled when React Query abandons it.
2. **Homepage sections mounted together despite route-level lazy chunks.** Lazy imports were inside one shared Suspense boundary, so the homepage could pull in every below-fold section as soon as the page mounted. Existing worktree changes defer those sections until near the viewport and provide reserved-height placeholders. The hero/search remain in the first view.
3. **Public catalogue responses returned broad tour records and search was unbounded.** Existing worktree edits select list fields, limit pages to 24, add pagination to search, escape literal search terms, populate only selected destination fields, and run independent list/count/settings reads concurrently. These changes were syntax-checked and covered only indirectly by the available focused tests; no database plan or live response-size comparison was available.
4. **Destination detail read every matching tour and awaited related destinations afterward.** Capped the related tour cards at 24 and now query related destinations in parallel. Destination detail still returns a combined payload, and primary destination resolution can issue a second lookup for legacy canonical aliases.
5. **Tenant settings were fetched redundantly after authentication and on unrelated dashboard changes.** Auth preloading dispatched settings that caused SettingsContext to issue the same request again. SettingsContext now applies supplied event data directly; the redundant dashboard-change listener and 60-second all-user poll were removed. Explicit setting-change events and cross-tab storage changes continue to update settings.
6. **The client has substantial code, but route-level splitting is already present.** Current production build transformed 3,227 modules. Output includes a 443.16 kB raw / 141.86 kB gzip entry JS chunk and a 125.66 kB / 40.18 kB gzip Home route chunk; individual dashboard routes are separate chunks. These are current build outputs, not a measured reduction from baseline. `recharts` exports include a 361.19 kB raw / 106.52 kB gzip chart chunk, loaded for chart-using routes.

## API route inventory and classification

This is a source inventory by mounted route family, not an assertion that every route received production latency or database-plan measurement.

| Route family (mounted in `server/routes/index.js`) | Function / expected traffic | Main dependencies | Review status |
|---|---|---|---|
| `/tours`, `/destinations`, `/categories`, `/packages`, `/reviews`, `/gallery`, `/hero`, `/tenant`, `/recommendations`, SEO/sitemap | Public catalogue and content; high for browsing, with only three homepage API paths observed in the single startup trace | MongoDB, tenant resolution, settings; external image host for media | Tour list/search/detail and destination list/detail inspected and changed as described. No production query plans. |
| `/auth`, `/mfa`, `/users`, `/customers`, `/staff`, `/notifications`, `/wishlist`, `/documents`, `/invoices` | Identity and customer/staff account data; authenticated or session-check traffic | MongoDB, auth cookies/JWT, permissions, tenant context; email/PDF for selected actions | Route mount/auth boundary reviewed; account dashboard workflows not run without credentials. Never shared-cache. |
| `/bookings`, `/payments/*`, `/mpesa`, `/stripe`, `/paypal`, `/payment-links`, `/hospitality-payments`, `/cash` | Booking and money mutations/status; critical correctness and provider callbacks | MongoDB transactions, provider APIs/webhooks, idempotency, tenant config | Payment/booking tests are in the backend suite; no sandbox callback or real payment was run for this audit. No public caching added. |
| `/admin/*`, `/tourmanager`, `/tour-manager`, `/agent*`, `/guide`, `/driver`, `/tour-assignments`, `/tour-reports`, `/operations`, `/travel`, `/operational-assets`, `/hotels`, `/airport-transfers`, hospitality routes | Role dashboards and operational CRUD; frequency depends on active staff and existing polling | MongoDB, role/permission middleware, integrations, selected external services | Route families and client dashboards discovered; only unauthenticated admin denial verified in browser. Polling exists on selected live-status widgets. |
| `/analytics`, `/admin/finance`, `/admin/compliance`, `/admin/tax`, `/admin/credit-debit-notes`, `/commissions`, `/crm`, `/coupons`, `/privacy` | Reporting, financial/compliance operations; generally lower traffic but expensive/high impact | MongoDB aggregations, accounting/payment records, tenant isolation, selected external systems | Security/payment backend regressions included in full suite; dashboards not browser exercised. No aggregation explain plans. |
| `/superadmin/*`, `/tenants`, `/integrations`, `/developer`, `/api-monitor`, `/system`, `/security`, `/health`, `/ai`, `/admin-ai` | Platform operations, integrations, monitoring and AI; admin/specialist traffic | MongoDB, auth/permissions, provider APIs, OpenAI/other services | Mounts reviewed; dashboard role actions and external dependency timings not measured. |

No index changes were made: query plans and representative production cardinalities were unavailable, and existing models define numerous indexes including tenant slug and catalogue fields. Add or alter indexes only after capturing `explain("executionStats")` on representative tenant-scoped filters/sorts.

## Implemented changes and validation

- Public tour list/search fields are projected, page limits are capped at 24, and search results are paginated. Destination detail tour cards are capped at 24.
- Homepage below-fold modules mount near the viewport with pulse placeholders (pre-existing worktree edit).
- Tour and destination detail requests use encoded slugs, query cancellation, and five-minute client cache freshness.
- Destination related reads run in parallel.
- Tenant settings preloads are consumed directly instead of refetched; unrelated dashboard events no longer cause a settings fetch.
- Added a Playwright public performance sample that attaches startup LCP/CLS/navigation timing, usable time, route transition times, and API request timing to test results.

Validation evidence in this work session:

| Check | Result | Boundary |
|---|---|---|
| Client ESLint | PASS | Local source. |
| Client production build | PASS | Local build; see output sizes above. |
| Focused backend tests | PASS, 4/4 | `publicTourCategoryFilter`, `tourDomainIntegrity`, `tenantDashboardCacheIsolation`, `bookingPaymentAccess`; no connected database integration was involved in these tests. |
| Production public Playwright smoke | PASS, 1/1 | Read-only public customer/navigation flow on 2026-10-29; not a controlled benchmark. |
| Production performance sample | PASS, 1/1 | One desktop lab run at 1280×720 on 2026-10-29; values below. No throttling or repeated percentile sample. |
| API/database query plans and response timings | NOT TESTED | No database access, APM, or profiler evidence. |
| Production booking/payment, authenticated dashboards | NOT TESTED | No sandbox/provider credentials used; no charges initiated. |
| Production deployment SHA | NOT VERIFIED | No deployment metadata was exposed by the inspected endpoints. |

## Before/after measurements

| Metric | Before | After/current evidence |
|---|---|---|
| LCP / CLS | No earlier run | Desktop **2.176 s / 0.275**; mobile **1.836 s / 0.409**. LCP is within the recommended 2.5 s threshold in these runs; CLS exceeds the 0.1 good threshold on both layouts. INP is not measured by this lab test. |
| Document response start / DOM ready | No earlier run | Desktop **0.734 s / 1.210 s**; mobile **0.327 s / 0.741 s**. Browser `transferSize` for the document was 764 bytes; it does not represent the full page transfer. |
| Usable content and route transitions | No earlier run | Desktop: homepage **2.892 s**, tour list **4.776 s**, tour detail after click **3.702 s**, destination list **3.591 s**, destination detail after click **4.304 s**. Mobile: homepage **2.428 s**, tour list **5.190 s**, tour detail **3.459 s**, destination list **3.452 s**, destination detail **3.781 s**. One run per layout; these are not medians. |
| API request count and timing | No earlier trace | Homepage issued `/settings/public`, `/auth/me`, `/hero` (3 requests). Desktop: tour list **3.306 s**, tour detail **3.020 s**, destination list **2.635 s**, destination detail **3.776 s**. Mobile: **3.934 s**, **2.990 s**, **2.725 s**, **3.343 s** respectively. Each is one browser-observed request-to-response interval including network/cold-start effects, not database time. Full test reloads pages between list scenarios and repeats shared startup requests. |
| Tour detail polling | 1 request every 15 seconds while mounted (configured behavior) | No interval; detail data is cached for five minutes and cancellation is forwarded. |
| Destination detail tour records | Unbounded query | At most 24 tour cards. |
| Public list/search page limit | Tours 24; destinations 100 | Both capped at 24; search is paginated (existing tour-controller worktree edit). |
| JS build output | No same-commit baseline artifact | Current entry 443.27 kB raw / 141.88 kB gzip; Home 125.63 kB / 40.16 kB gzip. |

These measurements are the current observed production deployment before the local worktree changes are deployed. They are single-run, unthrottled lab observations, not field Core Web Vitals or a controlled before/after comparison. The API durations show that API response latency materially affects list/detail usefulness; without server traces they cannot be attributed to database time versus Render cold start, network, middleware or external services. Capture multiple runs over equivalent networks and report median/p75/p95 before setting numeric performance budgets.

## Remaining risks

- Tour search uses escaped case-insensitive regular expressions over title, description, and location. This avoids regex injection but may still scan large catalogues; use query plans and real cardinalities before introducing a text-search migration.
- Public tour/destination responses are tenant-contextual. No shared CDN/browser cache policy was added because hostname, tenant and invalidation behavior need production verification.
- Dashboard components contain polling intervals by design (health, notifications, payment status, and operational updates). Review each against its freshness requirement; payment status polling must retain timely confirmation.
- Image variants, CDN cache headers, third-party scripts, API cold starts, Mongo connection behavior and real mobile-network performance remain unmeasured.
- Do not deploy these changes until the configured CI/release checks pass and the live deployment SHA can be verified.

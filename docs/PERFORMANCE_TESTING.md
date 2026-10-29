# Performance and regression testing

## Local source checks

```bash
cd client
npm run lint
npm run build
npx playwright test e2e/performance-smoke.spec.js
```

The Playwright config defaults to the production frontend. For an isolated local or staging environment set `DEMO_FRONTEND_URL` and `DEMO_API_ORIGIN`. The performance test attaches `public-performance-sample.json` with browser startup navigation timing, LCP/CLS observer results, time until useful homepage content, tour/destination click-to-heading time, and API request statuses/durations. Run at least five times on the same browser, viewport and network profile; compare medians and p75/p95. Run separate desktop and mobile contexts when collecting release evidence. These browser numbers are lab measurements, not field Core Web Vitals.

Initial provisional regression budgets, based on the single desktop/mobile production samples recorded on 2026-10-29:

| Measurement | Provisional guard | Good field target |
|---|---:|---:|
| Homepage API requests | At most 3 (asserted in the browser test) | At most 3 |
| Initial JavaScript entry chunk | At most 150 kB gzip (current local build: 141.86 kB) | Reduce further where practical |
| LCP | At most 3.0 s in these unthrottled lab contexts | ≤2.5 s at the 75th percentile |
| CLS | At most 0.45 as a lab regression ceiling (current sample is 0.275 desktop / 0.409 mobile) | ≤0.1 at the 75th percentile |
| Useful tour/destination list and detail content | At most 5.5 s in the same unthrottled lab context | Set tighter limits after repeated network-profile runs |

The timing ceilings are provisional regression guards, not acceptable final experience targets. The current measured CLS already misses the recommended good field range; INP must be measured from real-user data. Update guards after repeated runs and a representative Kenyan mobile-network profile.

For the existing public smoke and role matrix:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npx playwright test e2e/production-smoke.spec.js
```

Provide `DEMO_SMOKE_PASSWORD` (or the supported demo password environment name) only in a protected local/staging environment for role checks. Without it, authenticated role tests skip. Do not run mutation/payment workflows against production; use the staging payment sandbox.

## Backend checks

```bash
cd server
node --check controllers/tourController.js
node --check controllers/destinationController.js
node --test tests/publicTourCategoryFilter.test.js tests/tourDomainIntegrity.test.js tests/tenantDashboardCacheIsolation.test.js tests/bookingPaymentAccess.test.js
npm test
```

The full suite may skip database-backed integration cases when MongoDB replica-set or provider sandbox prerequisites are unavailable. Report skipped tests separately from passes. Never run seed/repair scripts against an unknown or production database for performance measurement.

## Baseline protocol

1. Record deployed commit SHA, frontend/API URLs, timestamp, viewport, browser version, network throttling profile and cache state.
2. On a fresh browser context capture homepage transfer/request count, API statuses and durations, navigation response start/DOM ready/load, LCP, CLS and usable-content time.
3. Repeat for homepage-to-tour, homepage-to-destination, search/filter/pagination, and each authenticated dashboard role. Record click-to-useful-content separately from full document timing for SPA navigation.
4. Use a disposable staging database with representative catalogue cardinality to capture MongoDB slow-query logs and `explain("executionStats")` for the actual filtered/sorted/paginated list queries. Record documents examined/returned and query latency. Do not infer query plans from schema indexes.
5. Repeat each scenario at least five times for medians and p75/p95. Keep field Core Web Vitals separate from lab measurements. Set budgets only after a repeatable baseline exists.

No before/after production baseline, database plan, field metric or payment sandbox run was available for the 2026-10-29 audit; see [Performance audit](PERFORMANCE_AUDIT.md) and [Dashboard test matrix](DASHBOARD_TEST_MATRIX.md).

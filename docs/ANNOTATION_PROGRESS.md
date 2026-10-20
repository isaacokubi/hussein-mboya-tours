# Code Annotation Progress

This tracker prevents us from claiming that the entire repository has been annotated before every file has been reviewed.

## Batch 1 — offline and payment lifecycle changes

- [x] `client/src/App.jsx` — route selection, shared shell, subscription gate, offline banner and notifications explained.
- [x] `client/src/api/mpesaApi.js` — initiation, status polling, provider reconciliation and booking verification explained.
- [x] `client/src/api/tourApi.js` — public cache boundary versus private operational endpoints explained.
- [x] `client/src/lib/publicOfflineCache.js` — cache namespace, TTL, best-effort storage and network fallback explained.
- [x] `client/src/lib/publicOfflineCache.test.js` — cache fallback, tenant separation and HTTP-error behavior tested.
- [x] `client/src/components/layout/OfflineStatusBanner.jsx` — connectivity event handling and user-facing limitations explained.
- [x] `client/src/pages/Checkout.jsx` — input validation, STK initiation, response unwrapping, polling and explicit reconciliation explained.
- [x] `client/vite.config.js` — service-worker generation, static asset caching and public image allowlist explained.
- [x] `server/controllers/mpesaController.js` — tenant/booking checks, callback lifecycle and status response boundaries annotated.
- [x] `server/controllers/tenantSubscriptionController.js` — subscription payment and reconciliation endpoint behavior annotated.
- [x] `server/models/SubscriptionPayment.js` — tenant ownership, payment states, reconciliation fields and indexes annotated.
- [x] `server/tests/mpesaCallbackLifecycleContract.test.js` — payment lifecycle/status contracts documented by tests.
- [x] `.github/workflows/ci.yml` — client unit-test gate added.
- [x] `docs/SYSTEM_FROM_SCRATCH_GUIDE.md` — creation order, test commands, offline boundaries and M-Pesa lifecycle documented.

## Batch 2 — M-Pesa callback, reconciliation and ledger path

- [x] `server/routes/mpesaRoutes.js` — route/middleware order and endpoint responsibilities annotated.
- [x] `server/middleware/resolveMpesaCallbackTenant.js` — callback tenant resolution boundary annotated.
- [x] `server/middleware/mpesaCallbackIntegrity.js` — provider-state verification and rejection conditions annotated.
- [x] `server/controllers/mpesaStatusController.js` — explicit provider query behavior and terminal-state rules annotated.
- [x] `server/controllers/subscriptionMpesaCallbackController.js` — subscription callback validation and activation boundary annotated.
- [x] `server/controllers/mpesaRefundController.js` — refund result and timeout handling annotated.
- [x] `server/services/mpesaQueryService.js` — server-side provider query and result classification annotated.
- [x] `server/services/paymentLifecycleService.js` — booking payment/failure/refund lifecycle boundaries annotated.
- [x] `server/services/hospitalityPaymentLifecycleService.js` — hotel/transfer payment lifecycle boundaries annotated.
- [x] `server/models/Payment.js` — charge/refund state separation, provider evidence and indexes annotated.
- [x] `docs/SYSTEM_FROM_SCRATCH_GUIDE.md` — exact file order and subscription reconciliation updated.

## Remaining batches

The repository also contains many other controllers, models, services, routes, React pages/components, configuration files, scripts and tests. They must be reviewed and annotated in dependency order. Generated files, lockfiles, binary assets, environment files and JSON files that do not support comments must not be corrupted by adding comment syntax. This tracker will be updated after each verified batch.

## Current limitations

- Offline support currently covers the app shell, public images and public tour/destination read-only catalogue data. Authenticated operational modules still require additional tenant/user-scoped offline storage and sync work.
- M-Pesa success remains callback/receipt verified. Provider-query failures/cancellations can update persisted state; an accepted STK prompt or a successful query without receipt metadata is not proof of payment.
- No production database writes or live M-Pesa transactions are used for these changes.

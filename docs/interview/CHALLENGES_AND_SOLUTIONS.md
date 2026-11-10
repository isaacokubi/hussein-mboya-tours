# Challenges and solutions

## Verified engineering changes in repository evidence

The recent Git history contains commits for settled-payment polling behavior, feature-gate release after subscription-check failure, bounded booking-list pagination, stale query refresh after route remount, and avoiding unrelated admin dashboard writes. These commit subjects verify that those code changes were made; they do not prove they were personally experienced or authored by the presenter. Inspect the relevant commit diff before claiming personal ownership.

| Evidence in Git history | Problem addressed | Implementation area |
|---|---|---|
| `fix(client): release feature gate when subscription check fails` | A failed subscription check could leave feature-gated UI blocked | Client plan feature gate |
| `perf(client): stop polling settled hospitality payments` | Continued polling after hospitality payment settled wasted requests | Hospitality payment status UI |
| `perf(client): stop polling settled payment status` | Continued polling after final booking status | Payment status UI |
| `fix(api): bound booking list pagination inputs` | Unbounded/invalid page size could increase API/database work | Booking list controller |
| `fix(client): refresh stale queries after route remount` | Cached server data could remain stale on route return | React Query/cache behavior |

## Inferred engineering challenges (not historical claims)

- **Tenant isolation across a large code surface.** Root cause risk: many models/routes plus multiple query styles. Existing solution: tenant middleware/context, helper filters and model plugins; maintain with cross-tenant tests, especially aggregate and background code.
- **Asynchronous payment correctness.** Root cause: provider request response and later callback are separate events. Existing solution: persisted attempts, callback verification and payment lifecycle services. Improve with controlled sandbox evidence, idempotency replay tests and reconciliation monitoring.
- **Capacity races during booking.** Root cause: concurrent customers can observe the same availability. Existing solution: transaction-based slot reservation/booking in the atomic service where that flow uses it. Alternative: atomic conditional update/hold with expiry, depending on Mongo topology and workload.
- **Large module navigation.** Root cause: many routes/controllers/models and feature folders. Current approach: route/service/model structure and domain-specific client API modules. Alternative: smaller bounded feature packages and generated API docs.
- **Readiness during startup.** Root cause: DB/index work takes time and services have critical/noncritical work. Existing solution: live/readiness endpoints, retrying DB startup and delayed background services.

Do not present inferred items as challenges you personally encountered. Use “the code addresses” unless you can substantiate personal history.

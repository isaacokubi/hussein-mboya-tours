# Engineering decisions and tradeoffs

## Decisions evidenced by current implementation

- **React SPA and Express JSON API:** separate browser bundle and server API allow independent builds/deployment; two manifests exist for frontend hosting.
- **MongoDB/Mongoose:** domain entities are represented as schemas/documents with nested structures, references, indexes and lifecycle hooks. This favors flexible travel/operations records but requires deliberate index and tenant-query discipline.
- **Tenant-aware design:** tenant IDs, host/header resolution, request context, query helpers and plugins are used to scope a shared application. This supports multiple organizations in one service/database, with cross-tenant isolation as a critical risk area.
- **Route/controller/service layering:** cross-cutting middleware is composed at the route; reusable lifecycle/provider logic is placed in services. Some domain responsibilities remain in controllers/models.
- **JWT plus cookie and Bearer support:** guards support browser cookies and API-style bearer requests; CSRF checks apply to unsafe cookie-authenticated requests.
- **Provider-specific payment adapters:** M-Pesa, Stripe and PayPal have separate integration code. The complexity of asynchronous callbacks makes persisted payment lifecycle state and verification necessary.
- **Background jobs and readiness retries:** server remains listening while critical DB initialization retries, with distinct readiness endpoint state; non-critical scheduled operations retry.
- **Transactions for booking/inventory path:** `bookingCreationService.js` groups slot reservation and booking insertion in Mongo session transaction where used.

These explain code structure, not necessarily the original author's documented motivation. No alternatives are attributed to historical decisions without commit/issue evidence.

## Repository history

Git history is available and contains frequent performance, correctness and payment/security changes. This document does not reconstruct a complete origin story. Use `git log` and dated readiness reports when describing a specific change. Existing docs include explicit test/deployment evidence for the dates named in their titles.

## Tradeoffs and technical debt visible from source

- Large, numerous route/controller/model files increase navigation and review cost.
- Tenant scoping has multiple mechanisms; consistency across raw queries, background workers and aggregates requires continual testing.
- Provider lifecycle complexity and manual payment operations create reconciliation burden.
- A large route surface is not represented by one current OpenAPI schema.
- Existing status/readiness markdown can become stale; dated evidence should be read with its timestamp.
- `check:all` combines syntax/contract checks with readiness logic, so a green command may depend on environment and is not equivalent to all behavior being tested.

## Retrospective improvements (recommendations, not implemented claims)

Add maintained OpenAPI request/response schemas, split large feature modules where useful, build cross-tenant security tests around every repository/query pattern, establish provider sandbox certification evidence and reproducible fixtures, centralize production observability, and record decision rationale in ADRs as changes are made.

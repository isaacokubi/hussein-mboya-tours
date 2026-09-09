# Frontend / Backend Coverage Audit

## Purpose

Every production-critical backend capability must have an intentional frontend surface where a permitted operator or customer can view, configure, execute, or monitor it. Backend-only functionality is not considered complete product functionality.

## Coverage matrix

| Capability | Backend foundation | Frontend surface | Coverage |
|---|---|---|---|
| Customer authentication + MFA | auth/mfa routes and services | Login + CustomerMfa | Covered |
| Customer bookings + checkout | booking/payment routes | Checkout, BookingDetails, PaymentStatus, MyBookings | Covered |
| M-Pesa | tenant gateway + M-Pesa services/routes | Checkout, M-Pesa Transactions, Payment Gateway Center | Covered |
| Other payment gateways | tenant payment gateway config/routes | Payment Gateway Center | Covered |
| Tax/VAT | tax routes/engine | Compliance Centre + finance | Covered |
| KRA/eTIMS | tax profile, credentials, durable submission jobs | Compliance Centre | Covered |
| Invoices | invoice/finance lifecycle | Accounting & Finance + Finance Lifecycle Center | Covered |
| Credit/debit notes | credit-debit-note routes/services | Compliance Centre + Finance Lifecycle Center | Covered |
| Payment links | payment-link routes | Finance Lifecycle Center + public payment-link flow | Covered |
| Accounting / GL / reconciliation | finance, journal and reconciliation services | Accounting & Finance, Reports, Reconciliation | Covered |
| Supplier/procurement | operations and supplier/AP services | Operations & Procurement / Service Desk | Covered |
| Corporate accounts | corporate account and booking controls | Operations dashboard + finance | Covered |
| Accommodation inventory | room inventory services/routes | Operations dashboard | Covered |
| Travel service desk | travel operations services/routes | Travel Service Desk | Covered |
| Fleet / vehicles | vehicle and operational asset services | Admin Vehicles + manager vehicle screens | Covered |
| Guides / drivers / assignments | guide/driver/assignment routes | Guide, Driver and Tour Manager screens | Covered |
| CRM / customers | CRM/customer routes | Admin Customers, agent customers, manager customers | Covered |
| Privacy policy | public policy route/page | Privacy Policy page | Covered |
| Data-subject requests | privacy request API/model | Public privacy-rights form + Privacy Requests management UI | Covered |
| Compliance records / retention governance | compliance model/service | Compliance Centre | Covered |
| RBAC / permissions | role/permission services | Roles & Permissions UI | Covered |
| Tenant branding/settings | tenant settings/branding | Admin Settings + public tenant presentation | Covered |
| SaaS billing | tenant billing routes/services | Tenant Billing | Covered |
| External website booking capture | authorized integration keys/routes/controller | Admin Settings connector + Developer Platform controls | Covered |
| Outbound webhooks | signed webhook service/durable jobs | Developer Platform webhook management | Covered |
| Audit/security | audit/security services/routes | SuperAdmin Audit + Security | Covered |
| System health | health/system endpoints | Admin System Health | Covered |
| AI/recommendations | AI/recommendation services | Customer AI widget + Admin AI Tools | Covered |
| SEO/public discovery | SEO routes/services | Public website pages and metadata | Covered |

## Deliberate backend-only infrastructure

The following are intentionally not exposed as raw controls because they are infrastructure implementation details rather than business workflows:

- tenant query enforcement and AsyncLocalStorage context;
- encryption/decryption internals;
- idempotency indexes and duplicate-race handling;
- job-worker polling/retry internals;
- retention scheduler internals;
- request correlation middleware;
- webhook signing/encryption internals;
- database connection/runtime internals.

They are still represented by user-facing status, audit, configuration or workflow screens where operational action is appropriate.

## Guardrail

`server/tests/frontendCoverageContract.test.js` is part of the normal Node test suite. It fails CI when a production-critical frontend surface is removed or when the required route/component contract disappears. This prevents future backend-only feature additions from silently shipping without UI coverage.

## Important boundary

External website capture remains opt-in and authorized. The platform must never silently scrape or ingest unrelated third-party websites. The UI is therefore based on explicit tenant-owned connector credentials, allowed origins and documented integration flows.

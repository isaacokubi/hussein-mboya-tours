# Global Tours — Multi-Tenant Travel & Hospitality Platform

Global Tours is a multi-tenant platform for tour operators and hospitality businesses. It brings public travel catalogues, bookings, customer management and operational administration together with tenant-scoped finance, payment and reporting workflows.

## Platform capabilities

- **Travel operations:** tour catalogues, itineraries, reservations, booking lifecycle management and customer records.
- **Multi-tenant workspaces:** organisation-specific data, users, roles, permissions and tenant-aware public websites.
- **Finance and accounting:** payment records, invoices, expenses, supplier workflows, reconciliation, reporting and compliance controls.
- **Payment integrations:** Safaricom Daraja, Stripe, PayPal, bank transfer and cash workflows, subject to tenant configuration and provider verification.
- **Hospitality operations:** hotels, room types, room inventory, rate plans, room blocks and airport transfers.
- **Administration and governance:** user management, subscription controls, audit records, privacy workflows and operational dashboards.
- **Operational tooling:** notifications, scheduled jobs and AI-assisted workflows where configured.

The application is designed so that an accepted payment request is not treated as proof of settlement. Provider callbacks, transaction details and authorised manual confirmations must be verified before payment records are marked complete.

## Technology

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Data | MongoDB and Mongoose |
| Realtime | Socket.IO |
| Authentication and security | JWT, HTTP security middleware, tenant-scoped authorization and rate limiting |
| Media and messaging | Cloudinary, Resend, Africa's Talking |
| Integrations | Safaricom Daraja, Stripe, PayPal and OpenAI API |

## Repository structure

- `client/` — React application and browser end-to-end tests.
- `server/` — API, domain models, controllers, services, jobs, scripts and automated tests.
- `docs/` — architecture, tenant isolation, operations, finance, security, testing and release runbooks.
- `.github/` — CI and repository automation.

## Local development

Use separate terminals for the API and web client.

**Backend**
```bash
cd server
npm ci
cp .env.example .env
# Configure MongoDB, JWT, CORS and optional provider integrations.
npm run dev
```

**Frontend**
```bash
cd client
npm ci
cp .env.example .env
npm run dev
```

## Verification

**Backend**
```bash
cd server
npm test
npm run check:all
```

**Frontend**
```bash
cd client
npm run lint
npm run build
```

Browser end-to-end checks are available through the Playwright configuration in `client/`. Run them against an explicitly configured test or staging environment.

## Key documentation

- [System architecture and implementation guide](docs/SYSTEM_FROM_SCRATCH_GUIDE.md)
- [Multi-tenancy and data isolation](docs/MULTITENANCY.md)
- [Tenant payment configuration](docs/TENANT_PAYMENT_CONFIGURATION.md)
- [M-Pesa sandbox readiness and acceptance limits](docs/MPESA_DARAJA_SANDBOX_READINESS.md)
- [Production readiness](docs/PRODUCTION_READINESS.md)
- [Production go-live checklist](docs/PRODUCTION_GO_LIVE_CHECKLIST.md)
- [Kenya production runbook](docs/KENYA_PRODUCTION_RUNBOOK.md)
- [Documentation index](docs/DOCUMENTATION_INDEX.md)

## Configuration and release discipline

Keep credentials in local environment files or the deployment provider's secret manager. Never commit database URIs, JWT secrets, payment credentials, API keys or customer data.

A successful automated test suite or frontend build is not proof of live provider acceptance. Before production use, verify tenant-specific gateway configuration, real sandbox callback lifecycles, deployment health, authenticated role access, backups and restore procedures. Do not describe eTIMS/OSCU as KRA-certified without the relevant formal certification evidence.

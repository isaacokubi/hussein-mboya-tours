# Hussein Mboya Tours — Full Project Documentation

## 1. Purpose and scope

Hussein Mboya Tours is a full-stack travel and safari operations platform. It combines a public travel experience with authenticated customer, agent, guide, driver, finance, administration, and platform-management workflows.

The system is designed for organizations that need to manage the complete journey from destination and tour configuration through booking, pickup planning, staffing, vehicle assignment, payment, communication, reporting, and post-trip operations.

This document is the engineering and operations reference for developers, system administrators, deployment engineers, testers, and future maintainers.

---

## 2. System architecture

The application is split into three principal layers:

```text
Browser / Mobile Web
        |
        v
React + Vite frontend (client/)
        |
        | HTTPS / JSON / Socket.IO
        v
Express API (server/)
        |
        +--------------------+
        |                    |
        v                    v
MongoDB / Mongoose       External services
                         - M-Pesa
                         - Stripe
                         - Cloudinary
                         - SMTP
                         - OpenAI
```

### Frontend

The `client/` application is a React 19 + Vite application. It provides public pages and role-aware dashboards. Client data fetching uses Axios and TanStack Query; routing is handled with React Router; real-time functionality uses Socket.IO Client.

The frontend package defines `dev`, `lint`, `build`, and `preview` workflows. fileciteturn74file0

### Backend

The `server/` application is a Node.js ES-module Express service. It owns authentication, authorization, business rules, database access, payments, notifications, documents, AI features, scheduled lifecycle tasks, and tenant isolation.

The backend package includes production, controller, model, RBAC, security, and multi-tenancy validation scripts as well as repair/migration utilities. fileciteturn75file0

### Database

MongoDB is accessed through Mongoose. Application models are tenant-aware through the tenancy bootstrap/plugin system. Platform-global models are explicitly treated as global rather than receiving ordinary organization scoping.

---

## 3. Repository structure

```text
.
├── client/
│   ├── src/
│   │   ├── components/       # reusable UI
│   │   ├── context/          # authentication, cart, notifications, etc.
│   │   ├── layouts/          # role-specific layouts
│   │   ├── pages/            # public and dashboard pages
│   │   └── ...
│   └── package.json
│
├── server/
│   ├── config/               # environment/database configuration
│   ├── controllers/          # request/business controllers
│   ├── middleware/           # auth, tenancy, security, validation
│   ├── models/               # Mongoose models
│   ├── routes/               # API route modules
│   ├── scripts/              # validation, migration, repair, seed utilities
│   ├── seeds/                # development/demo seed utilities
│   ├── services/              # business services and scheduled workflows
│   ├── socket/               # Socket.IO integration
│   ├── tenancy/              # tenant context/plugin/bootstrap
│   ├── utils/                # shared backend utilities
│   └── package.json
│
├── docs/
│   ├── MULTITENANCY.md
│   └── PROJECT_DOCUMENTATION.md
│
├── .github/                  # CI/CD workflows
├── render.yaml               # Render deployment definition
├── vercel.json               # Vercel frontend definition
└── SECURITY.md               # security reporting policy
```

---

## 4. Business modules

### 4.1 Public travel experience

The public application exposes travel discovery and conversion functionality:

- destinations
- tours and tour packages
- categories
- tour availability
- galleries and hero media
- reviews
- wishlist
- recommendations
- SEO and sitemap generation
- custom-tour requests

The public experience should be usable without exposing private administrative information.

### 4.2 Customer management

Customer functionality includes:

- account registration and authentication
- profile management
- booking history
- tour selection
- travel-date validation
- pickup location and pickup time
- payment history
- invoices/vouchers/documents
- notifications
- reviews and wishlist

### 4.3 Booking operations

Bookings form the central transactional workflow. A typical booking moves through customer selection, availability/date validation, customer information, pickup information, pricing, payment, confirmation, operational assignment, travel, completion, and post-trip reporting.

Custom-tour requests can be converted into operational booking/tour records through the appropriate workflow.

### 4.4 Agent operations

Agents can manage their assigned customer relationships and booking workflows, including:

- customer records
- bookings
- packages
- quotations
- commissions
- agent-specific operational views

### 4.5 Tour management

Tour management covers:

- tour creation and editing
- destinations and categories
- pricing
- availability
- travel dates
- guide/driver assignments
- vehicle assignments
- booking capacity
- tour lifecycle
- tour reports
- itineraries

### 4.6 Guide and driver operations

Guides and drivers receive role-specific operational views. Assignment data is controlled by the tour/assignment layer and should remain tenant-scoped.

The lifecycle service is responsible for keeping tour status aligned with dates and operational state. The server also starts a periodic lifecycle synchronization process during startup.

### 4.7 Fleet and staff

The platform manages:

- vehicles
- staff profiles
- guides
- drivers
- vehicle assignment
- staff assignment
- operational availability

### 4.8 Finance and payments

Finance functionality includes:

- M-Pesa payments
- Stripe payments
- payment lifecycle tracking
- refunds
- refund audit data
- reconciliation
- commissions
- financial analytics
- exports
- invoices
- quotations

Payment callbacks and webhooks must always resolve to the correct tenant before modifying transactional data.

### 4.9 Administration

Admin functionality covers users, roles, permissions, destinations, tours, bookings, payments, reviews, galleries, coupons, finance, customers, settings, analytics, system health, and security operations.

### 4.10 SuperAdmin/platform operations

SuperAdmin functionality is intended for platform-level administration rather than ordinary business operations. It includes tenant/platform operations, API monitoring, maintenance, security/audit tooling, database operations, and platform settings.

SuperAdmin access should be treated as highly privileged and should never be granted to ordinary operational accounts.

### 4.11 AI capabilities

The backend contains AI-oriented services/controllers for search, booking assistance, recommendations, analytics, fraud/risk analysis, sentiment, marketing, pricing, revenue forecasting, operational intelligence, task management, and automated briefings.

AI features should fail safely when an AI provider is unavailable and must not bypass authorization or tenant isolation.

---

## 5. Authentication and authorization

Authentication is handled by the backend authentication middleware and user model. JWT-based authentication is used for protected API access.

Authorization is role/permission based. The repository contains explicit RBAC contract validation:

```bash
cd server
npm run check:rbac
```

Administrative routes should use both authentication and the appropriate permission checks. Platform-level routes require stronger authorization than ordinary business operations.

### Passwords

Passwords must never be stored in plaintext. Password hashing uses bcryptjs. Production seed passwords must be supplied through deployment secrets and must not be committed to Git.

### Session/token safety

- Keep JWT secrets private.
- Use HTTPS in production.
- Configure appropriate token expiration.
- Do not log access tokens or payment credentials.
- Rotate credentials when compromise is suspected.

---

## 6. Multi-tenancy and data isolation

Multi-tenancy is a foundational security boundary.

### Tenant model

Each organization represents a tenant boundary. Application-owned business records are associated with the tenant through `tenantId`.

The tenancy bootstrap is loaded before the application route/model graph. Tenant-aware models receive the tenant field and associated protection through the tenant plugin architecture.

### Global models

Some models are intentionally global/platform-level. Examples include organization and permission data. These models must not be treated like ordinary tenant business records.

### Tenant context

Requests enter through tenant resolution middleware. Tenant context is then consumed by the model/plugin layer and downstream services.

### Required guarantees

The system must prevent:

- cross-tenant reads
- cross-tenant updates
- cross-tenant deletes
- tenant ID forgery
- accidental unscoped writes
- unsafe bulk operations
- unsafe aggregation access
- cross-tenant socket/data leakage

### Validation

Run the static check:

```bash
npm run check:multitenancy
npm run check:multitenancy:code
```

Run the live regression test when MongoDB is available:

```bash
npm run check:multitenancy:live
```

See [`MULTITENANCY.md`](MULTITENANCY.md) for the focused tenancy guide.

---

## 7. API organization

The API is mounted under `/api`.

Major route families include:

```text
/api/auth
/api/mfa
/api/bookings
/api/tours
/api/destinations
/api/admin/*
/api/admin-ai
/api/superadmin/*
/api/tenants
/api/custom-tour-requests
/api/reviews
/api/gallery
/api/hero
/api/mpesa
/api/payments/stripe
/api/analytics
/api/tourmanager
/api/tour-assignments
/api/tour-reports
/api/agents
/api/customers
/api/documents
/api/invoices
/api/notifications
/api/guide
/api/driver
/api/vehicles
/api/users
/api/staff
/api/commissions
/api/crm
/api/coupons
/api/ai
/api/recommendations
/api/settings/public
/api/health
```

The exact controller and route contracts should be treated as implementation details and verified against the current source before integrating external clients.

### Health endpoints

The application exposes `/api/health` for basic health reporting and the server health configuration points Render at that endpoint. fileciteturn77file0

A protected administrative system-health endpoint is also available for authorized operational users.

---

## 8. Security controls

The API currently incorporates several standard production controls:

- Helmet security headers
- CORS allow-listing
- HTTP compression
- request rate limiting
- cookie parsing
- request logging
- input/body size limits
- JWT authentication
- password hashing
- tenant isolation
- permission checks
- duplicate-key handling
- validation/cast error normalization
- production log redaction for sensitive fields

Run the security validation with:

```bash
npm run check:security
```

Never disable these controls merely to make a local integration work. Fix the underlying configuration instead.

---

## 9. Payments

### M-Pesa

M-Pesa integration requires provider credentials, shortcode/passkey/security credentials, and a publicly reachable callback URL in production.

Important production checks:

1. Use production credentials only in the production secret store.
2. Verify callback tenant resolution.
3. Validate transaction IDs and amounts server-side.
4. Make callbacks idempotent.
5. Never trust client-provided payment status.
6. Record payment lifecycle/audit data.
7. Test failed, cancelled, delayed, and duplicate callbacks.

### Stripe

Stripe requires a secret key and webhook secret. Stripe webhooks must be authenticated and mapped to the correct booking/payment/tenant context before state changes are made.

### Reconciliation

Financial reconciliation should be run against provider transaction records and internal payment records. Payment state should never be changed manually without an audit trail.

---

## 10. Media and file handling

Cloudinary is the primary media integration. Production configuration requires:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Upload middleware must enforce file-type/size rules and should never allow arbitrary executable content to become publicly executable.

Store only references/metadata in MongoDB where appropriate; use Cloudinary for durable media storage.

---

## 11. Email and notifications

SMTP settings support transactional email. Notification services provide application-level notification records and real-time delivery where configured.

Production email configuration includes host, port, username, password, and sender address.

Operational recommendations:

- use a dedicated transactional sender
- configure SPF/DKIM/DMARC where supported
- monitor bounce and delivery failures
- do not expose SMTP credentials to the frontend

---

## 12. Scheduled/background operations

The backend starts automated operational processes during server startup. Current application behavior includes tour lifecycle synchronization and payment cleanup scheduling.

Scheduled jobs must be designed to be idempotent because deployment platforms may restart instances and multiple instances may exist in production.

For horizontally scaled production deployments, any job that changes transactional state should use an appropriate distributed locking/idempotency strategy rather than assuming a single server instance.

---

## 13. Environment variables

The deployment definition identifies the principal backend and frontend configuration surface. fileciteturn77file0

### Backend

```text
NODE_ENV
PORT
MONGODB_URI
JWT_SECRET
JWT_EXPIRE
CLIENT_URL
CLIENT_ORIGINS

OPENAI_API_KEY

MPESA_CONSUMER_KEY
MPESA_CONSUMER_SECRET
MPESA_SHORTCODE
MPESA_PASSKEY
MPESA_CALLBACK_URL
MPESA_SECURITY_CREDENTIAL

STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM

SEED_ADMIN_PASSWORD
SEED_SUPERADMIN_PASSWORD
SEED_MANAGER_PASSWORD
SEED_AGENT_PASSWORD
SEED_GUIDE_PASSWORD
SEED_CUSTOMER_PASSWORD
SEED_STAFF_PASSWORD
SEED_FINANCE_PASSWORD
```

### Frontend

```text
VITE_API_URL
VITE_SOCKET_URL
```

Do not commit real values. Use `.env` locally and encrypted deployment secrets in production.

---

## 14. Local development

### Backend

```bash
cd server
npm ci
npm run check:all
npm run dev
```

### Frontend

```bash
cd client
npm ci
npm run lint
npm run build
npm run dev
```

### Common local issue: port already in use

Find the process:

```bash
sudo lsof -i :5000 -nP
```

Stop the stale process or configure another development port.

### Common local issue: environment variables

Check that `server/.env` exists and contains a reachable `MONGODB_URI`, valid JWT secret, correct frontend origin, and credentials for any integration being tested.

---

## 15. Testing and validation strategy

The project uses layered validation rather than relying on a single test command.

### Syntax and startup checks

```bash
npm run check
npm run check:controllers
npm run check:models
```

### Authorization and security

```bash
npm run check:rbac
npm run check:security
```

### Tenancy

```bash
npm run check:multitenancy
npm run check:multitenancy:code
npm run check:multitenancy:live
```

### Production readiness

```bash
npm run check:production
```

### Complete backend validation

```bash
npm run check:all
```

### Frontend

```bash
cd client
npm run lint
npm run build
```

### Release smoke tests

At minimum, verify:

1. Public home page loads.
2. Destination listing loads.
3. Tour listing/details load.
4. Customer registration/login works.
5. Customer booking can be created.
6. Travel date and pickup validation work.
7. Payment initiation works in sandbox/test mode.
8. Booking confirmation is reflected in customer/admin views.
9. Agent workflow works.
10. Guide/driver assignment works.
11. Vehicle assignment works.
12. Admin dashboards load.
13. Role/permission editing works.
14. SuperAdmin routes are inaccessible to unauthorized roles.
15. Notifications and real-time updates work.
16. Images load from Cloudinary.
17. `/api/health` returns healthy when the database is connected.
18. Tenant A cannot access Tenant B data.
19. Production frontend build succeeds.
20. No secrets appear in logs or client bundles.

---

## 16. Deployment

### Render

The repository includes a Render definition containing separate backend and frontend services. The API uses `server` as its root directory and `npm ci` / `npm start`; the frontend uses `client`, `npm ci && npm run build`, and publishes `dist`. fileciteturn77file0

The frontend is configured as a single-page application with a catch-all rewrite to `index.html`. fileciteturn77file0

Recommended production sequence:

```text
1. Merge approved code to main
2. Confirm dependency lockfiles are committed
3. Run CI validation
4. Deploy API
5. Verify /api/health
6. Verify database connection
7. Deploy frontend
8. Verify frontend/API connectivity
9. Test authentication
10. Test booking/payment sandbox flows
11. Monitor logs
```

### Vercel

`vercel.json` configures the Vite client build from `client/`, publishes `client/dist`, and rewrites application routes to `index.html`. fileciteturn78file0

The Vercel configuration should be kept aligned with the actual deployment project and environment-variable configuration.

---

## 17. Database operations

### Backups

Production backups must be enabled at the MongoDB provider level. Application-level database tools must not be considered a replacement for provider backups.

### Migrations

Tenant migrations and reconciliation scripts exist under `server/scripts/`. Before running a migration:

1. Back up the database.
2. Confirm the target environment.
3. Review the script.
4. Run it first against a staging copy.
5. Record the migration output.
6. Verify counts/indexes/constraints.
7. Only then run against production.

### Tenant indexes

Use the tenant-index reconciliation tooling when required:

```bash
npm run reconcile:tenant-indexes
```

Never drop tenant-related indexes blindly in production.

---

## 18. Seed and repair scripts

The backend contains seed and repair scripts for development and controlled maintenance. Examples include staff/vehicle seeding, role repair, guide repair, administrator creation, password reset, and migration utilities.

These scripts can change production data and therefore require explicit operator review. Seed passwords must never be reused as permanent production credentials.

---

## 19. Observability and operations

### Application health

Use `/api/health` for basic service/database availability.

### Logs

Production logging should avoid secrets, access tokens, passwords, payment credentials, and sensitive callback payloads. The server includes production log redaction for sensitive fields.

### Monitoring priorities

Monitor:

- API availability
- database connectivity
- error rate
- latency
- authentication failures
- payment failures
- webhook failures
- email delivery failures
- Cloudinary upload failures
- Socket.IO connection failures
- scheduled-job failures
- tenant isolation/security alerts
- deployment failures

---

## 20. Troubleshooting

### API returns 404

Check:

- API base URL
- route prefix `/api`
- frontend environment configuration
- route module registration
- authentication/permission middleware

### CORS errors

Verify `CLIENT_URL`/`CLIENT_ORIGINS` and ensure the browser origin exactly matches an allowed origin. Do not solve CORS by allowing every origin in production.

### MongoDB disconnected

Verify `MONGODB_URI`, network access rules, database credentials, and provider availability. Then check `/api/health`.

### Dashboard appears empty

Check authentication, role/permission assignment, API response status, tenant context, and browser network requests. An empty dashboard must not be “fixed” by disabling authorization or tenant filtering.

### Roles cannot be edited

Validate:

```bash
npm run check:rbac
```

Then inspect role permissions, authenticated user permissions, admin role routes, and frontend API calls.

### Payment callback fails

Check provider callback URL, signature/credential validation, tenant resolution, idempotency, and payment record lookup. Never accept an unverified callback as proof of payment.

### Deployment succeeds but SPA routes return 404

Ensure the hosting platform has a catch-all rewrite to `index.html`. Both the repository's Render and Vercel frontend configurations include SPA rewrite behavior. fileciteturn77file0turn78file0

---

## 21. Security checklist

Before production release:

- [ ] Production `NODE_ENV=production`
- [ ] Strong unique JWT secret
- [ ] No development seed passwords reused
- [ ] MongoDB network access restricted appropriately
- [ ] HTTPS enabled
- [ ] CORS restricted to known origins
- [ ] Rate limiting enabled
- [ ] Helmet enabled
- [ ] Payment webhook secrets configured
- [ ] M-Pesa callback security verified
- [ ] Cloudinary credentials secured
- [ ] SMTP credentials secured
- [ ] OpenAI credentials secured
- [ ] Tenant isolation regression passes
- [ ] RBAC validation passes
- [ ] Security validation passes
- [ ] No credentials committed to Git
- [ ] Backups verified
- [ ] Audit logging monitored
- [ ] SuperAdmin accounts restricted

---

## 22. Release checklist

```text
CODE
[ ] Feature branch reviewed
[ ] No accidental debug code
[ ] No secrets
[ ] Lockfiles consistent

VALIDATION
[ ] Backend check:all passes
[ ] RBAC check passes
[ ] Security check passes
[ ] Multi-tenancy checks pass
[ ] Live tenant isolation passes
[ ] Frontend lint passes
[ ] Frontend build passes

DATABASE
[ ] Backup verified
[ ] Migrations reviewed
[ ] Indexes verified

INTEGRATIONS
[ ] M-Pesa tested
[ ] Stripe tested
[ ] Cloudinary tested
[ ] SMTP tested
[ ] AI integration tested where enabled

DEPLOYMENT
[ ] Environment variables configured
[ ] API health endpoint healthy
[ ] Frontend loads
[ ] SPA routes work
[ ] Authentication works
[ ] Booking flow works
[ ] Payment flow works
[ ] Admin dashboards work
[ ] SuperAdmin access verified

POST-RELEASE
[ ] Logs monitored
[ ] Payment callbacks monitored
[ ] Error rate checked
[ ] Customer booking smoke test completed
```

---

## 23. Development workflow

Use short-lived feature branches for changes:

```bash
git checkout main
git pull --ff-only origin main
git checkout -b feature/your-change
```

Before opening a pull request:

```bash
cd server
npm run check:all

cd ../client
npm run lint
npm run build
```

Commit only the files belonging to the change. Review the diff before pushing.

After review, merge through the repository's normal pull-request process rather than pushing unreviewed production changes directly to `main`.

---

## 24. Production readiness statement

The repository has a strong production-oriented foundation, including tenant-aware model protection, live isolation regression tooling, RBAC/security checks, health checks, deployment definitions, payment integrations, and broad operational modules.

A production-ready claim must still be tied to the actual deployment environment. Passing static checks does not prove that external payment credentials, DNS, SMTP, Cloudinary, MongoDB networking, provider webhooks, or production deployment limits are configured correctly.

The final release decision should therefore be based on a green CI run plus environment-specific end-to-end smoke testing.

---

## 25. Ownership and maintenance

The project owner is responsible for:

- production credentials
- deployment accounts
- domain/DNS configuration
- database backups
- payment provider accounts
- Cloudinary account
- SMTP provider
- AI provider
- user access administration
- incident response
- licensing and commercial distribution decisions

Changes to authentication, tenancy, payments, permissions, or database migrations should receive extra review because they affect security and transactional integrity.

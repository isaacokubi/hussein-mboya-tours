# Hussein Mboya Tours

> Production-oriented multi-tenant African safari and travel management platform built with React, Vite, Node.js, Express, MongoDB/Mongoose, and Socket.IO.

[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)](client/)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933)](server/)
[![Database](https://img.shields.io/badge/database-MongoDB%20%2B%20Mongoose-47A248)](server/models/)
[![Security](https://img.shields.io/badge/security-multi--tenant%20isolation-0b7285)](docs/PROJECT_DOCUMENTATION.md#multi-tenancy-and-data-isolation)

## Overview

Hussein Mboya Tours is a full-stack travel operations platform for managing destinations, tours, bookings, customers, agents, guides, drivers, vehicles, payments, commissions, documents, notifications, analytics, AI-assisted operations, SEO, and administration from one system.

The platform is designed around a tenant-aware backend so multiple organizations can operate through the same application while application-owned data remains isolated by organization/tenant.

## Core capabilities

- Public travel website with destinations, tours, galleries, reviews, wishlist, recommendations, and SEO support.
- Customer accounts, profiles, bookings, travel-date validation, pickup details, invoices, vouchers, notifications, and payment history.
- Agent operations including customers, bookings, packages, quotations, and commissions.
- Tour management including availability, assignments, staff, vehicles, lifecycle status, reports, and itineraries.
- Guide and driver workflows for assigned tours and operational reporting.
- Administration for users, roles, permissions, destinations, tours, bookings, payments, reviews, galleries, coupons, finance, settings, analytics, and system health.
- SuperAdmin operations for tenant administration, monitoring, maintenance, database operations, audit/security tooling, and platform-level management.
- M-Pesa and Stripe payment integrations, payment lifecycle handling, refunds, reconciliation, and financial reporting.
- Cloudinary media handling and SMTP-based email support.
- Socket.IO real-time communication and notifications.
- AI services for search, recommendations, booking assistance, analytics, risk/fraud, marketing, pricing, revenue, operations, and task workflows.
- Automated tour lifecycle and payment cleanup processes.
- Production validation and multi-tenancy regression checks.

## Technology stack

### Frontend

- React 19
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS
- Framer Motion
- Recharts
- Socket.IO Client
- i18next / react-i18next
- Vite PWA tooling

### Backend

- Node.js (ES modules)
- Express 5
- MongoDB / Mongoose 8
- JWT authentication
- bcryptjs password hashing
- Helmet, CORS, compression, rate limiting, cookie parsing, and Morgan logging
- Socket.IO
- Cloudinary
- M-Pesa / Africa's Talking integrations
- Stripe
- Nodemailer
- OpenAI integration
- PDFKit, QRCode, sitemap, slugify, and CSV export tooling

## Repository layout

```text
hussein-mboya-tours/
├── client/                 # React/Vite frontend
├── server/                 # Express/Mongoose backend
├── docs/                   # Detailed engineering and operations documentation
├── .github/                # CI/CD and repository automation
├── render.yaml             # Render deployment configuration
├── vercel.json             # Vercel frontend configuration
├── SECURITY.md             # Security reporting policy
└── README.md               # Project overview and quick start
```

## Quick start

### Prerequisites

- Node.js 20+ recommended for local development.
- npm 10+ recommended.
- MongoDB 8 for local or CI integration testing.
- Git.
- Credentials for external services when their features are enabled.

### Clone

```bash
git clone https://github.com/isaacokubi/hussein-mboya-tours.git
cd hussein-mboya-tours
```

### Backend

```bash
cd server
npm ci
cp .env.example .env
# Edit .env with your local values
npm run check:all
npm run dev
```

The API normally listens on the configured `PORT` (commonly 5000 in local development).

### Frontend

In another terminal:

```bash
cd client
npm ci
npm run lint
npm run build
npm run dev
```

Set `VITE_API_URL` and, when real-time features are enabled, `VITE_SOCKET_URL` in the frontend environment.

## Validation

The backend exposes a consolidated validation command:

```bash
cd server
npm run check:all
```

Individual checks include:

```bash
npm run check
npm run check:controllers
npm run check:models
npm run check:rbac
npm run check:security
npm run check:multitenancy
npm run check:multitenancy:code
npm run check:production
```

The live tenant isolation regression test is:

```bash
npm run check:multitenancy:live
```

The frontend validation commands are:

```bash
cd client
npm run lint
npm run build
```

## Multi-tenancy and security

Multi-tenancy is a core architectural property rather than an application-level convention. Tenant-aware models receive `tenantId` protection through the tenancy bootstrap/plugin system, while platform-global models such as organizations and permissions are intentionally treated differently.

The isolation layer is designed to protect reads and writes, including common Mongoose operations and regression-tested cross-tenant access patterns. Tenant context is resolved at the API boundary and propagated through application services.

Read the complete design and operational guidance in [`docs/MULTITENANCY.md`](docs/MULTITENANCY.md) and the broader [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md).

## Production deployment

The repository contains deployment definitions for Render and Vercel. The Render configuration provisions separate Node API and static frontend services, while Vercel is configured for the Vite frontend. citeturn77file0turn78file0

For production, configure secrets in the deployment provider rather than committing them to Git. Required integrations include MongoDB, JWT, frontend origins, payment credentials, Cloudinary, SMTP, and optional AI credentials. See the environment-variable reference in the full documentation.

## Operational principles

1. Never bypass tenant context in application data access.
2. Never commit secrets, production credentials, database dumps, or user data.
3. Run backend and frontend validation before release.
4. Use migrations/reconciliation scripts deliberately and back up production data first.
5. Validate payment webhooks and callback tenant resolution in a safe environment before production rollout.
6. Treat SuperAdmin functionality as platform-level access and protect it accordingly.
7. Monitor API health, logs, database connectivity, payment failures, and deployment status after releases.

## Documentation

- **[Full Project Documentation](docs/PROJECT_DOCUMENTATION.md)** — architecture, modules, workflows, APIs, security, tenancy, deployment, operations, testing, troubleshooting, and release procedures.
- **[Multi-tenancy Guide](docs/MULTITENANCY.md)** — tenant architecture and isolation guidance.
- **[Security Policy](SECURITY.md)** — responsible vulnerability reporting.

## Current engineering status

The repository includes automated production-readiness, RBAC, security, controller/model, and multi-tenancy checks. Live cross-tenant isolation has also been exercised during engineering validation. Production readiness should still be certified against the actual production environment, credentials, payment providers, deployment platform, and final end-to-end user journeys before a commercial release.

## License and ownership

This repository is maintained for Hussein Mboya Tours. Licensing and commercial distribution terms should be established by the project owner before external redistribution.

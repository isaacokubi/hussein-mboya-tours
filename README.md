# Hussein Mboya Tours — Travel & Tour Management Platform

> A full-stack, multi-tenant travel management platform for tour operators, travel agencies, guides, agents, drivers, finance teams, and customers.

## Product Overview

Hussein Mboya Tours is a production-oriented MERN-style travel operations platform built to manage the customer journey and internal tour operations from a single application.

The system combines a public travel website, customer booking experience, operational dashboards, financial workflows, administration, and multi-tenant capabilities in one platform.

### Key Business Capabilities

- Public website for destinations, tours, galleries, reviews, recommendations, and SEO.
- Customer registration, profiles, bookings, pickup details, invoices, vouchers, notifications, and payment history.
- Tour and package management with availability, itineraries, assignments, staff, vehicles, and lifecycle tracking.
- Booking-agent workflows for customers, bookings, quotations, packages, and commissions.
- Tour-guide and driver workflows for assigned trips and operational reporting.
- Finance workflows covering payments, commissions, refunds, reconciliation, and reporting.
- Administrative management for users, roles, permissions, destinations, tours, bookings, reviews, galleries, coupons, settings, analytics, and system health.
- SuperAdmin platform management for organizations/tenants and platform-level administration.
- Multi-tenant architecture designed to isolate organization data within a shared application.
- M-Pesa and Stripe payment integrations.
- Cloudinary media management and SMTP email support.
- Socket.IO real-time communication and notifications.
- Optional AI-assisted search, recommendations, booking assistance, analytics, marketing, pricing, and operations features.

## Technology Stack

**Frontend**
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

**Backend**
- Node.js with ES modules
- Express 5
- MongoDB / Mongoose 8
- JWT authentication and bcryptjs
- Helmet, CORS, compression, rate limiting, cookie parsing, and Morgan
- Socket.IO
- Cloudinary
- M-Pesa / Africa's Talking integrations
- Stripe
- Nodemailer
- OpenAI integration
- PDFKit, QRCode, sitemap, slugify, and CSV tooling

## Repository Structure

```text
hussein-mboya-tours/
├── client/          # React/Vite frontend
├── server/          # Node/Express/Mongoose backend
├── docs/            # Product, architecture, deployment and operations documentation
├── .github/         # Repository automation
├── render.yaml      # Render deployment configuration
├── vercel.json      # Vercel frontend configuration
├── SECURITY.md      # Security reporting policy
└── README.md        # Project overview and setup guide
```

The repository has been cleaned for commercial handover: temporary repair scripts, audit outputs, development backups, and stray root-level development artifacts are not part of the product source tree.

## Local Setup

### Requirements

- Node.js 20+
- npm 10+
- MongoDB
- Git
- Credentials for any external services you enable

### 1. Clone

```bash
git clone https://github.com/isaacokubi/hussein-mboya-tours.git
cd hussein-mboya-tours
```

### 2. Backend

```bash
cd server
npm ci
cp .env.example .env
```

Configure the environment variables in `.env`, then run:

```bash
npm run dev
```

### 3. Frontend

Open a second terminal:

```bash
cd client
npm ci
npm run dev
```

Configure `VITE_API_URL` and, where required, `VITE_SOCKET_URL` in the frontend environment.

## Production Deployment

Deployment configuration is included for Vercel and Render. Production secrets must be configured in the hosting provider and must never be committed to the repository.

Typical production integrations include:

- MongoDB / MongoDB Atlas
- JWT and authentication settings
- Frontend/API origins
- M-Pesa and/or Stripe
- Cloudinary
- SMTP/email provider
- Optional AI provider

## Security & Multi-Tenancy

Multi-tenancy is part of the platform architecture. Tenant-aware application data is designed to remain isolated by organization, while platform-global resources are handled separately.

Authentication, authorization, tenant context, payment callbacks, and administrative access should be reviewed against the buyer's deployment environment before launch.

See:

- [`docs/MULTITENANCY.md`](docs/MULTITENANCY.md)
- [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md)
- [`SECURITY.md`](SECURITY.md)

## Validation

Backend validation commands are available from the server package. The main validation command is:

```bash
cd server
npm run check:all
```

Frontend validation:

```bash
cd client
npm run lint
npm run build
```

A buyer or deployment team should run the validation suite using its own environment variables, database, payment credentials, domains, and external-service accounts before production launch.

## Commercial Handover

The source repository is intended to provide a clean foundation for a buyer or development team to continue development, customize branding, connect production services, and deploy the platform under its own infrastructure.

A commercial handover should include:

1. Source-code transfer.
2. Environment-variable and deployment configuration handover without exposing secrets.
3. Database and hosting ownership transfer where applicable.
4. Third-party service account transfer or replacement.
5. Production-domain configuration.
6. Final security and end-to-end acceptance testing.
7. Licensing and intellectual-property terms agreed separately between the parties.

## Documentation

- **[Project Documentation](docs/PROJECT_DOCUMENTATION.md)** — architecture, modules, workflows, APIs, security, tenancy, deployment, operations, testing, and troubleshooting.
- **[Multi-Tenancy Guide](docs/MULTITENANCY.md)** — tenant architecture and isolation guidance.
- **[Security Policy](SECURITY.md)** — responsible vulnerability reporting.

## Ownership

This repository is maintained for Hussein Mboya Tours. Commercial licensing, source-code transfer, branding rights, third-party accounts, and redistribution terms should be agreed with the project owner as part of the sale.
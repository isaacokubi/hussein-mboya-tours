# Hussein Mboya Tours — Multi-Tenant Tour Operations Platform

A production-oriented MERN platform for tour operators covering public bookings, customers, agents, guides, drivers, vehicles, finance, payments, administration, SuperAdmin governance and company-isolated multi-tenancy.

## Stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT + MFA + RBAC
- M-Pesa + Stripe
- Cloudinary
- Socket.IO

## Multi-tenancy

The platform supports multiple independent tour companies in one deployment. Business data is automatically isolated by `tenantId`. See [`docs/MULTITENANCY.md`](docs/MULTITENANCY.md) for the architecture, deployment patterns and migration procedure.

## Local development

### Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

For an existing database, migrate it before serving tenant-scoped production traffic:

```bash
cd server
npm run migrate:multitenancy
```

## Production checks

```bash
cd server
npm run check:all
```

The CI production-readiness check validates configuration templates without requiring a real production database. To validate runtime environment variables on a deployed environment:

```bash
PRODUCTION_READINESS_RUNTIME=true npm run check:production
```

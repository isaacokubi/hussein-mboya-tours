# Architecture

## System shape

The project is a browser SPA plus a JSON API. The frontend is React 19 with React Router, Vite, TanStack Query and Axios. The backend is an Express 5 ES-module application on Node.js. Mongoose maps domain documents into MongoDB. External providers are accessed from backend services/controllers; callback routes return provider results into the backend.

```mermaid
flowchart LR
  User[Customer or staff browser] --> SPA[React SPA / Vite build]
  SPA -->|HTTP JSON, credentials| Express[Express app]
  SPA <-->|Socket.IO events| Express
  Express --> Context[Request ID and tenant resolution]
  Context --> Guards[Authentication, role, permission and feature guards]
  Guards --> Route[Route modules]
  Route --> Controller[Controllers]
  Controller --> Service[Domain and provider services]
  Service --> Models[Mongoose models and tenant plugins]
  Models --> Mongo[(MongoDB)]
  Service --> Providers[M-Pesa / Stripe / PayPal / optional APIs]
  Providers -->|callback or webhook| Route
```

## Startup and request lifecycle

`server/server.js` loads tenancy and accounting hooks, creates the HTTP and Socket.IO servers, starts listening, then retries database startup. Critical startup includes Mongo connection, optional staging seed, and invoice index migration. After readiness it starts background schedulers/workers. `server/app.js` installs request context, Helmet, rate limiting, CORS, compression, JSON/form/cookie parsing and request logging; it resolves tenant context before the API router. Database readiness gates normal API calls. 404 and final error handlers terminate unmatched/error flows.

```mermaid
sequenceDiagram
  participant B as Browser
  participant E as Express middleware
  participant T as Tenant/auth guards
  participant R as Route/controller
  participant S as Service/model
  participant D as MongoDB/provider
  B->>E: HTTP request + tenant hints + credentials
  E->>E: request ID, security headers, CORS, limits, parse body
  E->>T: resolve tenant and validate identity/permission
  T->>R: authorized request
  R->>S: validated domain operation
  S->>D: tenant-scoped query / provider call
  D-->>S: result or failure
  S-->>R: domain result
  R-->>B: JSON response with request ID
```

## Tenant/data architecture

`Organization` represents a tenant. A tenant may be resolved using host/domain or request headers according to `tenantMiddleware.js`; authenticated users are checked against their tenant, while super-admin access is explicitly platform-scoped. `server/tenancy/` contains AsyncLocalStorage context, query helpers, bootstrap and plugins. Models commonly install `tenantPlugin`; controllers also use `mergeTenantFilter`/`requireTenantId`. This layered approach is intended to reduce cross-tenant reads/writes. Verify each sensitive path: a plugin cannot replace authorization review, especially for aggregation/raw queries and background tasks.

## Frontend architecture

`client/src/main.jsx` creates the React root and shared providers; `App.jsx` composes site chrome and application routes. `routes/AppRoutes.jsx` lazy-loads pages and groups role dashboards behind route guards. `context/` contains authentication, cart, settings, tenant and notification context. `api/` provides Axios-based endpoint modules; TanStack Query is used for asynchronous server state and cache invalidation. Components are organized by domain and dashboard role.

## Backend architecture and patterns

The server follows an Express route → controller → service/model layering, with some controllers also containing domain rules. Mongoose schemas hold persistence validation, indexes, methods, hooks, and tenant plugins. Middleware composes cross-cutting concerns (auth, tenant resolution, permission checks, validation, rate limits, audit, upload). Services centralize reusable payment, lifecycle, accounting, and provider operations. Background schedulers use explicit startup/stop logic in the server entry point.

Observed patterns include middleware pipelines, service modules, repository-like Mongoose models, dependency injection of an Axios client in M-Pesa functions for testability, and transaction use for atomic booking/slot creation. Do not describe the whole backend as strict MVC: responsibilities are distributed and some controllers are substantial.

## Authentication sequence

```mermaid
sequenceDiagram
  participant UI as Login page/API client
  participant API as Auth endpoint
  participant DB as User/Role models
  participant Guard as protect middleware
  UI->>API: credentials
  API->>DB: find account and compare password hash
  DB-->>API: user/role
  API-->>UI: signed JWT and configured auth cookie/response
  UI->>API: later request with cookie or Bearer token
  API->>Guard: verify JWT issuer/audience/expiry
  Guard->>DB: reload active user and permissions
  Guard->>Guard: enforce tenant match and set tenant context
  Guard-->>API: authenticated request or 401/403
```

Exact cookie attributes and token issuance details vary by auth controller; consult `authController.js`, `utils/authCookie.js`, and `middleware/authMiddleware.js` before presenting the sequence as a precise response contract.

## Booking and payment sequence

```mermaid
sequenceDiagram
  participant C as Customer SPA
  participant API as Express booking/payment routes
  participant DB as MongoDB
  participant M as M-Pesa Daraja
  C->>API: create booking (authenticated)
  API->>DB: validate tour/custom quote and reserve capacity
  API->>DB: create booking in transaction where configured
  DB-->>C: booking details
  C->>API: initiate STK Push with booking and phone
  API->>DB: authorize booking access; create payment attempt
  API->>M: authenticated STK request
  M-->>API: accepted request + checkout identifiers
  M->>API: asynchronous callback
  API->>M: query/verify provider result as implemented
  API->>DB: update payment and booking lifecycle
  C->>API: poll status/retrieve booking
  API-->>C: current persisted status
```

This diagram is conceptual: provider callback and verification behavior is implemented across several modules and must be read with `PAYMENTS_AND_MPESA.md`. An accepted STK request is not proof of payment.

## Database relationship sketch

```mermaid
erDiagram
  ORGANIZATION ||--o{ USER : scopes
  ORGANIZATION ||--o{ TOUR : owns
  ORGANIZATION ||--o{ BOOKING : owns
  USER ||--o{ BOOKING : requests
  CUSTOMER ||--o{ BOOKING : profile
  TOUR ||--o{ BOOKING : booked_for
  BOOKING ||--o{ PAYMENT : records
  ORGANIZATION ||--o{ PAYMENT : owns
  HOTEL ||--o{ HOTEL_BOOKING : reserved
  USER ||--o{ HOTEL_BOOKING : requests
```

Relationships are ObjectId references, not SQL foreign keys. The diagram is intentionally a high-level subset; see [database inventory](DATABASE.md).

## External boundaries and deployment

Provider API calls, email, SMS/WhatsApp, media hosting, AI, and database are external boundaries. `render.yaml` configures Render API/static services; `vercel.json` configures a Vite static frontend independently. These manifests do not prove which host is currently serving production. See [deployment](DEPLOYMENT.md).

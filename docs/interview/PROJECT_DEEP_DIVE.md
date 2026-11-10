# Project deep dive

## Why build it / problem

The code represents a travel platform intended to connect customer discovery and reservations with staff operations. The measurable reason for the original project is not independently documented in the source, so describe that purpose as the product problem, not as a measured business result.

## Users and architecture

Users include travelers and operational/business roles. The browser is a React SPA; Vite builds it. It calls the Express API through shared Axios modules. The API is connected to MongoDB through Mongoose, and tenant context scopes many records. Role/permission middleware enforces server-side access. Socket.IO, provider integrations and scheduled services are additional boundaries.

## Data flow and booking

The UI collects booking intent; the backend validates tenant, customer, selected tour/custom quote, travel date, capacity and pricing. Booking persistence includes references/snapshots and lifecycle/payment fields. A separate transaction helper can wrap capacity reservation and booking insertion, but the main customer booking controller currently reserves capacity, then creates the booking and compensates on insertion failure; it does not use the transaction helper. Later staff operations assign resources or move booking lifecycle status under role rules. See [the core booking walkthrough](../CORE_CODE_WALKTHROUGHS.md#2-customer-booking-creation-and-capacity).

## Authentication

Login validates credentials and produces a signed JWT/cookie. Protected middleware verifies issuer/audience/time, reloads the current user and permissions, checks active status and tenant consistency, and establishes tenant context. Role checks and granular permission checks then gate routes. Cookie-authenticated mutations require CSRF token match.

## Database

MongoDB stores domain documents defined by Mongoose schemas. Tenant-owned records commonly carry `tenantId`; refs connect users/customers, tours, bookings, payments and operations entities. Schema indexes support lookup and uniqueness. There are many domain models, so discuss one concrete path and avoid implying a relational FK model.

## Payments

M-Pesa flow validates tenant configuration, ownership, payable balance and phone, submits STK Push, and processes callback/query verification. The persisted provider result drives the final booking/payment status. Stripe and PayPal code paths exist; manual methods also exist. A provider request accepted is not proof of settlement. External end-to-end success remains a separate evidence requirement.

## Deployment and security

Render config describes API and static client services; Vercel config describes an alternative static client deployment. MongoDB URI is supplied externally. Security mechanisms include headers, CORS, rate limiting, JWT and CSRF checks, role/permission guards, tenant scoping, sanitized production errors and callback controls. Deployment configuration is not proof of active production service or secure runtime settings.

## Difficulty, learning and next improvements

Code-level engineering concerns include tenant isolation consistency, booking concurrency, asynchronous payment state, and keeping a broad feature surface understandable. Unless personally verified, describe these as technical challenges the design addresses rather than personal historical stories. At larger scale I would strengthen OpenAPI contracts, automated cross-tenant regression coverage, external payment reconciliation evidence, and centralized observability, then profile real workloads before adding caching or service decomposition.

## Honest close

“The repository demonstrates a broad implementation, but I distinguish code presence from production proof. I can show a feature through its UI, route, guard, service and model, and I can explain what still needs environment/provider validation.”

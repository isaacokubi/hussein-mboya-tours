# Project overview

## In plain language

Hussein Mboya Tours is a web application for a travel business. Travelers can explore tour and destination information and make or review reservations. Staff-facing parts of the system support the work around those reservations, such as assigning guides and vehicles, communicating with customers, and tracking payment and finance information.

The system's source has expanded beyond a single tour-company website. It includes a tenant-aware platform structure, hospitality reservations, agent and staff roles, finance and compliance tools, and a platform super-admin area. These describe code paths, not verified adoption by real businesses.

## Problem, domain, and users

Travel operators often coordinate product information, customer details, availability, payment evidence, and trip execution across separate tools. The application brings many of those activities into a browser-based system with a shared API and database. The domain includes tours, travelers, reservations, accommodations, transfers, payments, staff, and business operations.

The implemented user roles include customer, admin, manager/tour manager, agent, guide, driver, and super admin. Access is mediated by frontend route guards and backend middleware; backend authorization is the enforcement boundary.

## Implemented capabilities evidenced in source

- Public React pages for tours, destinations, hotels, and airport transfers.
- User registration/login and role-aware authenticated experiences.
- Tour/custom-tour booking, booking retrieval, cancellation/rescheduling, and operational management.
- Mongoose data models and tenant context/filtering mechanisms.
- Payment initiation and provider-specific callback/webhook code.
- Hotel/transfer reservation and hospitality payment modules.
- Operational, accounting, finance, compliance, reporting, and platform-admin modules.
- Optional services for media, messaging, AI, email, and real-time updates.

## Benefits and rationale

The product goal represented by the code is to connect customer-facing discovery/reservation with staff operations and payment follow-up. Centralized records can reduce duplicate entry and give authorized staff a common view. The repository does not contain independently verified user research or measured business outcomes, so those benefits are design intent rather than measured achievements.

## Current implementation status and limits

The repository is an active, broad application rather than a small isolated demo. A module's existence does not mean its feature is enabled for a tenant, externally configured, certified, or production-verified. Existing readiness documents report outstanding payment/deployment gates and should be consulted alongside code. Production deployment status cannot be established from source configuration alone.

See [architecture](ARCHITECTURE.md), [feature workflows](BUSINESS_LOGIC.md), and [the payment readiness evidence](MPESA_DARAJA_SANDBOX_READINESS.md).

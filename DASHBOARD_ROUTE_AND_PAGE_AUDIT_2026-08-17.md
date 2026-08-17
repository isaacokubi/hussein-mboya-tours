# Hussein-Mboya Tours — Dashboard, Route & Missing-Page Audit

**Audit date:** 17 August 2026  
**Scope:** React/Vite dashboard routing, dashboard page inventory, deep links, legacy aliases, missing dashboard pages, and placeholder-page indicators.

## Executive result

The supplied project contains a substantial dashboard implementation for Customer, Agent, Guide, Driver, Tour Manager, Admin and SuperAdmin roles. The primary weakness found in this pass was **route coverage**, not a lack of dashboard components. Multiple UI links referenced deep routes that were not registered in `client/src/routes/AppRoutes.jsx`, creating avoidable 404s when users followed dashboard actions or bookmarked pages.

This repair adds:
- deep-link and legacy route coverage;
- missing Guide Assigned Tours page;
- missing Agent Packages page;
- missing Tour Manager Destinations page;
- missing Tour Manager Itineraries page;
- missing Tour Manager Settings page;
- protected wrappers around newly added admin/superadmin aliases;
- compatibility routes for old manager paths;
- compatibility routes for older admin analytics/report/payment/gallery/role paths;
- compatibility routes for `/driver`, `/manager`, `/guides`, `/drivers`, `/agents`, and related deep links.

## Dashboard route matrix

| Area | Main dashboard | Key operational pages | Status after repair |
|---|---|---|---|
| Customer | `/dashboard` | bookings, booking details, profile, checkout, payment status, custom tour | Covered |
| Agent | `/agent/dashboard` | bookings, customers, commission, quotes, packages | Covered |
| Guide | `/guide/dashboard` | assigned tours | Covered |
| Driver | `/driver/dashboard` | dashboard root compatibility | Covered |
| Tour Manager | `/tour-manager/dashboard` | tours, create/edit, guides, assignments, vehicles, availability, calendar, bookings, customers, analytics, reports, destinations, itineraries, settings | Covered |
| Admin | `/admin/dashboard` | users, staff, tours, destinations, bookings, payments, agents, commissions, customers, guides, vehicles, coupons, reviews, gallery, reports, analytics, AI, notifications, settings, finance, RBAC, health, custom tours | Covered |
| SuperAdmin | `/superadmin/dashboard` | users, audit, security, roles, system, settings, database, API monitor, maintenance aliases | Covered |

## Important route gaps identified

UI references were found for routes that were not present in the route table, including:
- `/guide/assigned-tours`
- `/driver`
- `/manager`
- `/manager/destinations`
- `/manager/itineraries`
- `/manager/settings`
- `/agent/packages`
- `/agent/packages/:packageId`
- `/agents` and agent detail/status aliases
- `/drivers`
- `/guides`
- `/admin/ai`, `/admin/query`, `/admin/briefing`
- `/admin/bookings/analytics`
- `/admin/revenue/analytics`
- `/admin/users/analytics`
- `/admin/reports/daily`
- `/admin/reports/monthly`
- `/admin/reports/tours`
- `/admin/reports/agents`
- `/admin/payments/analytics`
- `/admin/payments/reconciliation`
- `/admin/gallery/upload`
- `/admin/coupons/:id`
- `/admin/reviews/:id`
- `/admin/gallery/:id`
- `/admin/payments/:id`
- `/admin/roles/:id`
- `/admin/roles/:id/permissions`
- `/admin/roles/permissions/all`
- `/admin/tours/:id`
- `/admin/bookings/:id` and operational deep links
- `/admin/:id/assign` and `/admin/:id/quote`
- `/admin-ai/*`
- `/tour-manager/tours/create`
- `/tour-manager/tours/:id/edit`
- `/tour-manager/tours/:id/availability`
- SuperAdmin maintenance/database deep links.

## Missing pages created

### Guide — Assigned Tours
`client/src/pages/guide/AssignedTours.jsx`

Uses the existing Guide API and displays assigned tours, dates, locations, guest counts, status, loading/error states and refresh controls.

### Agent — Packages
`client/src/pages/agent/AgentPackages.jsx`

Uses the existing package API and provides package listing, pricing/duration display, loading/error states and refresh controls.

### Tour Manager — Destinations
`client/src/pages/tourManager/Destinations.jsx`

Uses the existing destination API and presents published destinations in a responsive operational view.

### Tour Manager — Itineraries
`client/src/pages/tourManager/Itineraries.jsx`

Uses the existing Tour Manager itinerary API and provides loading/error/empty states and itinerary cards.

### Tour Manager — Settings
`client/src/pages/tourManager/ManagerSettings.jsx`

Uses the existing settings API with editable company name, support phone and currency plus save feedback.

## Security/routing correction

New administrative compatibility routes are wrapped with `AdminRoute`, and SuperAdmin maintenance aliases are wrapped with the SuperAdmin role guard. This prevents the new compatibility paths from becoming an accidental authentication bypass.

## Existing page review

No obvious literal `Coming Soon`, `Under Construction`, or `Not implemented` dashboard page marker was found in the scanned JSX files. Many occurrences of the word `placeholder` are normal HTML input placeholders rather than placeholder pages.

The project already contains substantial implementations for the dashboard pages, so this repair focuses on route integrity and missing operational screens rather than replacing working pages with generic shells.

## Remaining professional QA recommendation

A full browser/E2E pass should still be run against the deployed API because static source inspection cannot prove:
1. every API endpoint is available in the current backend deployment;
2. every role has the expected server-side permission;
3. every mutation succeeds against live MongoDB data;
4. every image URL resolves;
5. every mobile navigation action behaves correctly;
6. every dynamic route works with real IDs.

Recommended validation after merging:
- `cd client && npm install`
- `npm run build`
- `npm run lint`
- run the backend;
- log in once for each role;
- click every sidebar item;
- test every newly added deep link;
- test refresh/bookmark access on each dashboard route;
- verify unauthorized users are redirected rather than shown protected content.

## Files changed in this repair

- `client/src/routes/AppRoutes.jsx`
- `client/src/pages/guide/AssignedTours.jsx`
- `client/src/pages/agent/AgentPackages.jsx`
- `client/src/pages/tourManager/Destinations.jsx`
- `client/src/pages/tourManager/Itineraries.jsx`
- `client/src/pages/tourManager/ManagerSettings.jsx`


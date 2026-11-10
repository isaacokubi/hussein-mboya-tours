# Code explanation guide

This document is the entry point for reading and understanding the implementation. It focuses on runtime paths and explains why key boundaries exist. Every first-party JS/JSX/TS/TSX source file now has a source-specific page or structural walkthrough; coverage distinguishes those static walkthroughs from fully hand-reviewed semantic explanations in [DOCUMENTATION_COVERAGE.md](DOCUMENTATION_COVERAGE.md).

## Read the application from the outside inward

1. **Browser entry:** `client/src/main.jsx` mounts the providers and app.
2. **Navigation:** `client/src/routes/AppRoutes.jsx` maps URLs to route-level pages and guards.
3. **User action:** a page owns UI state and calls a domain API function.
4. **Transport:** `client/src/api/axios.js` sets base URL, credentials, tenant and CSRF metadata.
5. **HTTP composition:** `server/app.js` parses and gates the request, then dispatches routers.
6. **Endpoint policy:** a route module combines path, method, authentication, role, permission and input middleware.
7. **Domain operation:** a controller coordinates request data and calls service/model operations.
8. **Persistence/integration:** services use tenant-scoped Mongoose models or provider clients.
9. **Response:** controller returns the API shape; query cache refreshes the UI.

## Main cross-cutting concepts

- **Request and tenant context:** request ID and tenant are set before most domain routes. The current tenant is passed through async context and query helpers.
- **Authentication vs authorization:** JWT/cookie validation identifies an active user; role/permission/resource checks decide access.
- **Client vs server validation:** client checks support UX. The server recalculates prices and validates resource ownership and provider input.
- **Persistence vs side effects:** a database write can succeed while an email/webhook/ledger side effect fails. Hooks/services catch some side-effect errors; those require operational reconciliation.
- **Provider request vs payment outcome:** a successful outbound API call may only create a pending attempt. Verified callback/query evidence updates the financial lifecycle.
- **Readiness vs liveness:** a live server can still be unavailable for DB-backed API calls.

## Detailed source walkthroughs

Use [the per-file explanation index](code-explanations/INDEX.md), which includes backend startup, Express middleware order, authentication/tenant enforcement, booking transaction/model, M-Pesa flow, React bootstrap, Axios, and booking/payment UI. Dedicated pages cover all 96 models, 96 route modules and 77 client API wrappers. The [AST walkthrough index](code-explanations/source/INDEX.md) contains 735 AST guide artifacts; 725 remain the primary structural walkthroughs, while ten critical files now link to source-specific detailed guides. This does not certify exhaustive line-by-line review; see [measured coverage](DOCUMENTATION_COVERAGE.md).

## How to explain any other source file

Read imports first to identify dependencies and whether imports have side effects. Then identify exported functions/classes/constants, their callers, inputs/outputs, state changes, errors, and trust boundaries. For route/controller pairs, document the complete call chain. For a model, identify tenant ownership, required fields, enums, indexes, hooks, and which paths use it. For a test, determine what it mocks and whether it accesses a database/provider. Use `rg` to find callers and inspect the exact package scripts before claiming runtime behavior.

## Code comments

The existing code contains comments around subtle behavior such as transaction side effects, callback handling and deployment checks. This documentation task did not add source comments because the most useful notes are maintained in linked source-specific guides, and changes to comments across a very large file surface without line-level validation risk becoming stale. No executable code was changed.

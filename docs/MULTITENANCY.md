# Multi-tenancy

The platform supports isolated tour-operator workspaces under one deployment.

## Tenant URLs

Every organization has a unique slug. With `PLATFORM_HOST=globaltours.com`, the public URL is:

`https://<tenant-slug>.globaltours.com`

Examples:

- `https://amani-trails-safaris.globaltours.com`
- `https://savanna-crown-safaris.globaltours.com`
- `https://coastal-horizon-adventures.globaltours.com`

The platform owner remains at `https://globaltours.com/superadmin`.

## DNS / frontend hosting

Configure the frontend hosting provider with the apex domain and wildcard `*.globaltours.com`. The exact DNS records and TLS setup depend on the provider. The application resolves the hostname after the provider routes it to the frontend; it does not create DNS records itself.

Server environment:

`PLATFORM_HOST=globaltours.com`

Frontend build environment:

`VITE_PLATFORM_HOST=globaltours.com`

## Tenant resolution

Requests can identify a company with the authenticated user's `tenantId`, a platform subdomain, a configured custom domain, a tenant-specific frontend origin, `X-Tenant-Slug`/`X-Tenant-Key` where supported, or a development/default tenant fallback. The hostname is preferred over client-supplied tenant identifiers.

The resolved organization is attached as `req.tenant` and `req.tenantId` and propagated through the tenancy context.

## Isolation

Business Firestore-backed models receive a tenant-aware plugin at model compilation time. Reads, updates, deletes, aggregates, lookups, bulk operations and inserts are scoped to the active tenant. Cross-tenant identifiers are rejected. Organization, Permission and Currency remain platform-level models.

Never trust a browser-supplied tenant ID as an authorization boundary. The API compares the tenant context with the authenticated user's tenant stored in the database and JWT. SuperAdmin is the only role allowed to operate across tenants.

## Branding

Tenant public settings expose company name, legal name, slug, platform URL, custom domain, logo, favicon, brand colors, contact information, country, currency and timezone. `TenantContext` applies the tenant document title, favicon and CSS brand variables so the same frontend can represent different companies.

## Custom domains

A tenant may provide a custom domain such as `www.husseintours.com` during company creation. It is stored in `organizations.domain` and is displayed in SuperAdmin tenant management. DNS and TLS must point the domain at the frontend deployment before it can serve the tenant.

For production, custom-domain onboarding should additionally verify domain ownership before activation and should only enable `features.customDomain` after verification.

## Production integrity and maintenance

Firestore is the active runtime datastore. Before a production migration or repair:

1. Create and verify an approved Firestore backup.
2. Run the read-only integrity/reconciliation scan.
3. Review the intended tenant scope and script behavior.
4. Run the change against a staging/emulator environment first.
5. Retain the command output and deployment commit with the evidence.

Use `npm run audit:firestore-integrity` for the read-only production integrity scan. Do not use historical MongoDB migration instructions for the current runtime.

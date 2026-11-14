# Multi-tenancy

The platform supports isolated tour-operator workspaces under one deployment. A registered custom domain is optional; the application must not assume ownership of a platform hostname.

## Tenant URLs

Until a platform domain is registered, the frontend is accessed through its assigned hosting URL (currently the Vercel deployment URL). Tenant-specific custom domains can be connected individually after their owners configure DNS and complete domain verification.

Do not generate tenant subdomains from an unowned or placeholder hostname. SuperAdmin tenant management displays a direct URL only when that tenant has a configured custom domain.

## Domain configuration

- `PLATFORM_HOST` is optional. Set it only after the platform owner registers and controls a domain and configures wildcard DNS/TLS.
- `VITE_PLATFORM_HOST` is optional and should match `PLATFORM_HOST` only when platform subdomain routing is enabled.
- `CLIENT_URL` and `CLIENT_ORIGINS` must contain the actual HTTPS frontend origin(s) used by the deployment.
- Tenant custom domains are stored in `organizations.domain`; DNS and TLS must point the domain at the frontend deployment before activation.

## Tenant resolution

Requests can identify a company with the authenticated user's `tenantId`, a configured platform subdomain (when `PLATFORM_HOST` is set), a verified custom domain, a tenant-specific frontend origin, or supported `X-Tenant-Slug`/`X-Tenant-Key` selectors. The hostname is preferred over client-supplied tenant identifiers.

The resolved organization is attached as `req.tenant` and `req.tenantId` and propagated through the tenancy context. A shared hosting hostname does not imply ownership of a separate domain; use the configured public tenant slug or tenant selection mechanism where applicable.

## Isolation

Business Mongoose schemas receive a tenant-aware plugin at model compilation time. Reads, updates, deletes, aggregates, lookups, bulk operations and inserts are scoped to the active tenant. Cross-tenant identifiers are rejected. Organization, Permission and Currency remain platform-level models.

Never trust a browser-supplied tenant ID as an authorization boundary. The API compares the tenant context with the authenticated user's tenant stored in the database and JWT. SuperAdmin is the only role allowed to operate across tenants.

## Branding

Tenant public settings expose company name, legal name, slug, platform URL, custom domain, logo, favicon, brand colors, contact information, country, currency and timezone. `TenantContext` applies the tenant document title, favicon and CSS brand variables so the same frontend can represent different companies.

## Custom domains

A tenant may provide a custom domain during company creation. It is stored in `organizations.domain` and is displayed in SuperAdmin tenant management. DNS and TLS must point the domain at the frontend deployment before it can serve the tenant.

For production, custom-domain onboarding should additionally verify domain ownership before activation and should only enable `features.customDomain` after verification.

## Existing database migration

Back up MongoDB first, then run:

```bash
cd server
npm run migrate:multitenancy
```

The script creates the default organization when necessary, assigns existing business records to it, synchronizes indexes, and prints `DEFAULT_TENANT_ID`.

# Multi-tenancy

The platform supports isolated tour-operator workspaces under one deployment.

## Tenant resolution

Requests can identify a company with `X-Tenant-ID`, `X-Tenant-Slug`, a configured custom domain, a subdomain, or `DEFAULT_TENANT_ID` for the default deployment.

## Isolation

Business Mongoose schemas receive a tenant-aware plugin at model compilation time. Reads, updates, deletes, aggregates and inserts are scoped to the active tenant. Cross-tenant identifiers are rejected. Organization, Permission and Currency remain platform-level models.

## SuperAdmin

SuperAdmins operate at platform scope and can create, suspend, activate and enter company workspaces. Selecting a tenant stores the tenant ID/slug in the client and causes subsequent API requests to carry the tenant context.

## Existing database migration

Back up MongoDB first, then run:

```bash
cd server
npm run migrate:multitenancy
```

The script creates the default `hussein-mboya-tours` organization when necessary, assigns existing business records to it, synchronizes indexes, and prints `DEFAULT_TENANT_ID`.

## Production configuration

Set `DEFAULT_TENANT_ID` in Render/server environment variables. For company-specific domains, add the hostname to the organization's `domain` field and configure DNS to point at the deployment.

## Security rule

Never trust a tenant ID supplied by the browser as authorization. The API compares the tenant context with the authenticated user's tenant stored in the database and JWT. SuperAdmin is the only role allowed to operate across tenants.

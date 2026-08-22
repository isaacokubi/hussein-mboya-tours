# Multi-Tenancy Architecture

The platform now supports isolated company workspaces (tenants) from one application deployment.

## Isolation model

- `Organization` is the global tenant registry.
- All business models carry an immutable `tenantId`.
- Mongoose query middleware automatically scopes reads, updates, deletes and aggregations to the active tenant.
- Unique fields become tenant-local unique indexes instead of platform-global identifiers.
- Normal users can only access the tenant assigned to their account.
- Platform SuperAdmin is global and can enter a selected tenant workspace without losing SuperAdmin permissions.
- Public requests resolve a tenant using `X-Tenant-ID`, `X-Tenant-Slug`, a configured custom domain/subdomain, or `DEFAULT_TENANT_ID`.
- M-Pesa callbacks resolve the tenant from the payment record before processing provider callbacks.
- Socket sessions carry tenant context and tenant notification rooms are isolated.

## Creating a company

SuperAdmin can use:

`POST /api/tenants`

Example body:

```json
{
  "name": "Safari Adventures Ltd",
  "slug": "safari-adventures",
  "country": "Kenya",
  "timezone": "Africa/Nairobi",
  "currency": "KES",
  "admin": {
    "name": "Company Administrator",
    "email": "admin@safari.example",
    "phone": "0712345678",
    "password": "ChangeThisImmediately1"
  }
}
```

## Existing database migration

Run once against the existing database:

```bash
cd server
npm run migrate:multitenancy
```

The migration:

1. creates the `hussein-mboya-tours` default tenant if it does not exist;
2. assigns existing business records to that tenant;
3. synchronizes tenant-local indexes;
4. prints the resulting `DEFAULT_TENANT_ID`.

Set that value in the production server environment and set the frontend `VITE_TENANT_SLUG` to the company's slug for shared-domain deployments.

## Deployment patterns

### Shared domain

Use `X-Tenant-Slug` or frontend `VITE_TENANT_SLUG`.

### Subdomains

`company-a.example.com` resolves the `company-a` tenant slug.

### Custom domains

Set `Organization.domain` to the exact hostname. The resolver maps requests to that tenant.

## Security rules

Never accept a client-supplied `tenantId` in business payloads as authoritative. The server derives tenant context from the authenticated account or trusted tenant resolver. Provider callbacks must resolve the tenant from server-side payment records.

# First Tenant Onboarding

Tenant creation is a platform-owner operation. There is no public tenant-creation or public first-platform-owner endpoint. Public `/register` creates a customer account only.

## First installation

1. Configure `MONGODB_URI` and a strong `JWT_SECRET` for the backend. Configure the production encryption keys listed in [FIRST_TENANT_ACCEPTANCE.md](FIRST_TENANT_ACCEPTANCE.md) before starting the production service.
2. Run `cd server && npm run bootstrap:first` as a controlled operator against the intended database. The interactive script creates system roles, the initial tenant, a platform SuperAdmin and its first tenant Admin. It refuses to run after an active SuperAdmin exists.
3. Sign in at `/login` as the platform owner and tenant Admin separately. Confirm the tenant and its Admin appear in SuperAdmin → Tenants.
4. For every later tenant, use the authenticated SuperAdmin tenant management UI (`POST /api/superadmin/tenants`). This creates the Organization, unique slug, tenant Admin with the system Admin role, and default tenant settings in a MongoDB transaction.
5. From the tenant Admin account, configure destinations, tours, packages, customer/booking settings, branding, website integration keys and that tenant's payment gateways.
6. Resolve the tenant using its configured tenant subdomain/custom domain or the public deployment's explicit tenant slug. Unknown and inactive tenants must fail closed.

Do not call the obsolete public onboarding/bootstrap controller modules directly; they are not mounted as HTTP routes. Do not expose bootstrap values through a browser or Vite variable. Do not use direct MongoDB writes for normal tenant creation.

## Required onboarding verification

- Tenant is created with `trial` status and a unique normalized slug.
- Admin role is assigned to a user whose `tenantId` equals the new Organization ID.
- Admin can log in and access tenant-scoped routes; the platform owner can use platform routes.
- A different tenant context cannot read or mutate the tenant's data.
- Tenant URL resolves to that tenant; unknown and suspended tenants cannot use public services.
- Payment gateways are configured per tenant. Missing M-Pesa configuration returns a safe 503 and never falls back to global production credentials.
- Website browser keys are publishable, tenant-scoped and revocable; website secret keys remain server-side.

The current CI suite includes isolation, onboarding authorization and route-contract regression checks. Provider transactions, external DNS, production database behavior and live website acceptance still require their own external evidence; see [TEST_EVIDENCE.md](TEST_EVIDENCE.md).
